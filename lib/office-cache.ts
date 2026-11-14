// ==============================================================================
// SCHEMATRIX - Live office discovery cache (server-only)
//
// Persists OpenStreetMap discovery results in a dedicated `office_cache`
// collection, deduplicated by stable external id (e.g. `osm:way/123`). Records
// keep their source, attribution and fetched_at timestamp. These are community
// data and are never treated as government-verified.
// ==============================================================================

import 'server-only';
import { getDb, COLLECTIONS } from './mongodb';
import { PublicOffice, OfficeSourceType } from './types';

interface OfficeCacheDoc {
  external_id: string;
  name: string;
  category: string;
  address: string;
  district: string;
  state: string;
  pin_code: string;
  phone: string;
  working_hours: string;
  latitude: number;
  longitude: number;
  source_url: string;
  attribution: string;
  source_type: OfficeSourceType;
  fetched_at: string;
  location: { type: 'Point'; coordinates: [number, number] };
}

function toDoc(o: PublicOffice): OfficeCacheDoc | null {
  if (!o.externalId || o.latitude == null || o.longitude == null) return null;
  return {
    external_id: o.externalId,
    name: o.name,
    category: o.category,
    address: o.address,
    district: o.district,
    state: o.state,
    pin_code: o.pinCode,
    phone: o.phone,
    working_hours: o.workingHours,
    latitude: o.latitude,
    longitude: o.longitude,
    source_url: o.sourceUrl || '',
    attribution: o.attribution || '',
    source_type: 'osm',
    fetched_at: new Date().toISOString(),
    location: { type: 'Point', coordinates: [o.longitude, o.latitude] },
  };
}

/** Upsert discovery results by external id. Safe to call with an empty list. */
export async function cacheOsmOffices(offices: PublicOffice[]): Promise<number> {
  const docs = offices
    .map(toDoc)
    .filter((d): d is OfficeCacheDoc => d !== null);
  if (docs.length === 0) return 0;

  try {
    const db = await getDb();
    const col = db.collection<OfficeCacheDoc>(COLLECTIONS.officeCache);
    const ops = docs.map((d) => ({
      updateOne: {
        filter: { external_id: d.external_id },
        update: { $set: d },
        upsert: true,
      },
    }));
    await col.bulkWrite(ops as any, { ordered: false });
    return docs.length;
  } catch {
    // Caching is best-effort; never fail discovery because persistence failed.
    return 0;
  }
}

/** Read cached OSM offices (most recently fetched first), capped. */
export async function readCachedOsmOffices(limit = 500): Promise<PublicOffice[]> {
  try {
    const db = await getDb();
    const rows = await db
      .collection<OfficeCacheDoc>(COLLECTIONS.officeCache)
      .find({})
      .sort({ fetched_at: -1 })
      .limit(limit)
      .toArray();
    return rows.map((r) => ({
      id: r.external_id,
      name: r.name,
      category: r.category,
      address: r.address,
      district: r.district,
      state: r.state,
      pinCode: r.pin_code,
      phone: r.phone,
      workingHours: r.working_hours,
      latitude: r.latitude,
      longitude: r.longitude,
      officialSource: 'OpenStreetMap',
      sourceUrl: r.source_url,
      lastReviewedAt: r.fetched_at,
      sourceType: 'osm' as OfficeSourceType,
      externalId: r.external_id,
      attribution: r.attribution,
      fetchedAt: r.fetched_at,
    }));
  } catch {
    return [];
  }
}