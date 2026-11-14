// ==============================================================================
// SCHEMATRIX - GET /api/offices/nearby
//
// Live nearby public-office discovery. Combines curated official records from
// MongoDB with community-mapped OpenStreetMap results (via Overpass). Responses
// are cached in memory (short TTL) and OSM results are persisted/deduplicated in
// MongoDB. Never fabricates data; on provider failure it degrades honestly to
// cached data or an "unavailable" message.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllOffices } from '@/lib/data-server';
import { fetchNearbyFromOverpass } from '@/lib/overpass';
import { cacheOsmOffices, readCachedOsmOffices } from '@/lib/office-cache';
import { attachDistances, dedupeOffices, haversineKm } from '@/lib/geo';
import { OSM_ATTRIBUTION } from '@/lib/overpass-query';
import { PublicOffice } from '@/lib/types';
import { jsonError, withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_RADIUS_M = 10_000;
const MIN_RADIUS_M = 500;
const MAX_RADIUS_M = 25_000;
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  offices: PublicOffice[];
  fetchedAt: string;
  expiresAt: number;
}

const memCache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lng: number, radius: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)},${Math.round(radius)}`;
}

function clampRadius(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_RADIUS_M;
  return Math.min(MAX_RADIUS_M, Math.max(MIN_RADIUS_M, Math.round(n)));
}

function inRadius(o: PublicOffice, lat: number, lng: number, radiusM: number): boolean {
  if (o.latitude == null || o.longitude == null) return false;
  return haversineKm(lat, lng, o.latitude, o.longitude) * 1000 <= radiusM;
}

async function getOfficialOffices(
  lat: number,
  lng: number,
  radiusM: number
): Promise<PublicOffice[]> {
  try {
    const all = await getAllOffices();
    return all.filter((o) => inRadius(o, lat, lng, radiusM));
  } catch {
    return [];
  }
}

async function handler(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;
  const latRaw = sp.get('lat');
  const lngRaw = sp.get('lng');

  if (latRaw === null || lngRaw === null || latRaw.trim() === '' || lngRaw.trim() === '') {
    return jsonError('Valid latitude and longitude are required.', 400, 'validation');
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return jsonError('Valid latitude and longitude are required.', 400, 'validation');
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return jsonError('Latitude must be -90..90 and longitude -180..180.', 400, 'validation');
  }

  const radius = clampRadius(sp.get('radius'));
  const key = cacheKey(lat, lng, radius);
  const now = Date.now();

  const cached = memCache.get(key);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json({
      offices: attachDistances(cached.offices, lat, lng),
      count: cached.offices.length,
      source: 'cache',
      attribution: OSM_ATTRIBUTION,
      fetchedAt: cached.fetchedAt,
    });
  }

  const [official, osmResult] = await Promise.all([
    getOfficialOffices(lat, lng, radius),
    fetchNearbyFromOverpass(lat, lng, radius),
  ]);

  let osmOffices: PublicOffice[] = [];
  let warning: string | undefined;
  let source: 'live' | 'cache' | 'mixed' | 'unavailable';

  if (osmResult.ok) {
    osmOffices = osmResult.offices;
    // Persist/dedupe in MongoDB (best-effort; failures don't break discovery).
    await cacheOsmOffices(osmOffices);
    source = official.length > 0 ? 'mixed' : 'live';
  } else {
    // Provider failed: fall back to previously cached OSM results within radius.
    const cachedOsm = (await readCachedOsmOffices()).filter((o) =>
      inRadius(o, lat, lng, radius)
    );
    osmOffices = cachedOsm;
    warning = osmResult.error || 'Live office discovery is temporarily unavailable.';
    source = official.length > 0 || cachedOsm.length > 0 ? 'cache' : 'unavailable';
  }

  // Merge, dedupe (official wins over community on same id), then distance-sort.
  const merged = dedupeOffices([...official, ...osmOffices]);
  const withDistance = attachDistances(merged, lat, lng);

  if (osmResult.ok) {
    memCache.set(key, {
      offices: merged,
      fetchedAt: new Date().toISOString(),
      expiresAt: now + CACHE_TTL_MS,
    });
  }

  return NextResponse.json({
    offices: withDistance,
    count: withDistance.length,
    source,
    attribution: OSM_ATTRIBUTION,
    fetchedAt: new Date().toISOString(),
    ...(warning ? { warning, code: osmResult.code } : {}),
    ...(osmResult.ok && osmResult.skipped > 0 ? { skipped: osmResult.skipped } : {}),
  });
}

export const GET = withErrorHandling(handler);