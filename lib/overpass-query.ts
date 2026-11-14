// ==============================================================================
// SCHEMATRIX - OpenStreetMap Overpass query builder, classifier and parser
//
// Pure functions (no server-only imports) so they can be unit-tested. The
// server-side fetch wrapper lives in lib/overpass.ts. Nothing here fabricates
// data: every field comes from the OSM element tags or coordinates.
// ==============================================================================

import { PublicOffice, OfficeSourceType } from './types';

export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';
export const OSM_SOURCE_URL = 'https://www.openstreetmap.org/copyright';

export type OfficeCategoryId =
  | 'all'
  | 'government'
  | 'municipal'
  | 'panchayat'
  | 'revenue'
  | 'csc'
  | 'post'
  | 'health'
  | 'police';

export const OFFICE_CATEGORY_IDS: OfficeCategoryId[] = [
  'all',
  'government',
  'municipal',
  'panchayat',
  'revenue',
  'csc',
  'post',
  'health',
  'police',
];

/** OSM tag selectors used for the broad discovery query. */
const OVERPASS_SELECTORS = [
  'nwr(around:{r},{lat},{lng})["office"="government"]',
  'nwr(around:{r},{lat},{lng})["office"="administrative"]',
  'nwr(around:{r},{lat},{lng})["amenity"="townhall"]',
  'nwr(around:{r},{lat},{lng})["amenity"="public_building"]',
  'nwr(around:{r},{lat},{lng})["amenity"="post_office"]',
  'nwr(around:{r},{lat},{lng})["amenity"="hospital"]',
  'nwr(around:{r},{lat},{lng})["amenity"="police"]',
  'nwr(around:{r},{lat},{lng})["amenity"="courthouse"]',
  'nwr(around:{r},{lat},{lng})["amenity"="fire_station"]',
];

/**
 * Build an Overpass QL query for public-service places around a point.
 * `radius` is in metres. Uses `out center tags;` so ways/relations carry a
 * representative centre coordinate.
 */
export function buildOverpassQuery(lat: number, lng: number, radius: number): string {
  const body = OVERPASS_SELECTORS.map((s) =>
    s.replace('{r}', String(radius)).replace('{lat}', String(lat)).replace('{lng}', String(lng))
  ).join(';\n  ');
  return `[out:json][timeout:25];\n(\n  ${body};\n);\nout center tags;`;
}

interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function firstNonEmpty(...vals: Array<string | undefined>): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

/** Classify an OSM element into one of our office categories, or null to skip. */
export function classifyOffice(tags: Record<string, string>): OfficeCategoryId | null {
  const amenity = (tags.amenity || '').toLowerCase();
  const office = (tags.office || '').toLowerCase();
  const healthcare = (tags.healthcare || '').toLowerCase();
  const name = (tags.name || tags['name:en'] || tags.operator || '').toLowerCase();

  if (amenity === 'post_office') return 'post';
  if (amenity === 'hospital' || healthcare === 'hospital') return 'health';
  if (amenity === 'police') return 'police';
  if (amenity === 'townhall') return 'municipal';

  if (office === 'government' || office === 'administrative') {
    if (/panchayat|panchayath|gram sabha/.test(name)) return 'panchayat';
    if (/revenue|tehsil|tahsil|taluk|taluka|mandal|mro|sub-?division|sub-?dist/.test(name)) {
      return 'revenue';
    }
    if (/csc|common service|service cent|e-?seva|meeseva|jan ?seva|public service|setu/.test(name)) {
      return 'csc';
    }
    return 'government';
  }

  if (amenity === 'public_building') return 'government';
  if (amenity === 'courthouse') return 'government';
  if (amenity === 'fire_station') return 'government';

  return null;
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:full'],
    tags['addr:housenumber'] && tags['addr:street']
      ? `${tags['addr:housenumber']} ${tags['addr:street']}`
      : tags['addr:street'],
    tags['addr:neighbourhood'] || tags['addr:suburb'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
    tags['addr:district'] || tags['addr:county'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter((p): p is string => Boolean(p && p.trim()));
  return parts.join(', ');
}

function elementLatLng(el: OsmElement): { lat: number; lng: number } | null {
  if (el.type === 'node' && typeof el.lat === 'number' && typeof el.lon === 'number') {
    return { lat: el.lat, lng: el.lon };
  }
  if (el.center && typeof el.center.lat === 'number' && typeof el.center.lon === 'number') {
    return { lat: el.center.lat, lng: el.center.lon };
  }
  return null;
}

export interface ParseResult {
  offices: PublicOffice[];
  skipped: number;
}

/**
 * Convert raw Overpass elements into PublicOffice records. Never invents phone
 * numbers, addresses or coordinates — missing values stay empty/undefined.
 */
export function parseOverpassElements(
  elements: OsmElement[],
  userLat: number,
  userLng: number
): ParseResult {
  const offices: PublicOffice[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (const el of elements) {
    const tags = el.tags || {};
    const category = classifyOffice(tags);
    const coords = elementLatLng(el);
    if (!category || !coords) {
      skipped += 1;
      continue;
    }

    const externalId = `osm:${el.type}/${el.id}`;
    if (seen.has(externalId)) continue;
    seen.add(externalId);

    const name = firstNonEmpty(tags.name, tags['name:en'], tags.operator, tags.brand);
    if (!name) {
      // Unnamed OSM nodes are not useful to a citizen; skip them honestly.
      skipped += 1;
      continue;
    }

    const address = buildAddress(tags);
    const phone = firstNonEmpty(tags.phone, tags['contact:phone']);
    const website = firstNonEmpty(tags.website, tags['contact:website'], tags.url);

    offices.push({
      id: externalId,
      name,
      category,
      address,
      district: firstNonEmpty(tags['addr:district'], tags['addr:city'], tags['addr:county']) || '',
      state: tags['addr:state'] || '',
      pinCode: tags['addr:postcode'] || '',
      phone: phone || '',
      workingHours: tags.opening_hours || '',
      latitude: coords.lat,
      longitude: coords.lng,
      officialSource: 'OpenStreetMap',
      sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      lastReviewedAt: new Date().toISOString(),
      sourceType: 'osm' as OfficeSourceType,
      externalId,
      attribution: OSM_ATTRIBUTION,
      fetchedAt: new Date().toISOString(),
      website,
    });
  }

  return { offices, skipped };
}