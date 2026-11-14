// ==============================================================================
// SCHEMATRIX - Geo helpers (isomorphic, no server-only imports)
// ==============================================================================

import { PublicOffice } from './types';

/** Haversine distance in kilometres between two coordinates. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Return a copy of each office with distanceKm set (when coords are known). */
export function attachDistances(
  offices: PublicOffice[],
  userLat: number,
  userLng: number
): PublicOffice[] {
  return offices
    .map((o) => {
      if (o.latitude == null || o.longitude == null) return o;
      return {
        ...o,
        distanceKm: Math.round(haversineKm(userLat, userLng, o.latitude, o.longitude) * 10) / 10,
      };
    })
    .sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
}

/** Deduplicate offices by stable id (prefers the first occurrence). */
export function dedupeOffices(offices: PublicOffice[]): PublicOffice[] {
  const seen = new Set<string>();
  const out: PublicOffice[] = [];
  for (const o of offices) {
    const key = o.externalId || o.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}