// ==============================================================================
// SCHEMATRIX - Government Offices Locator Service
// Client-side service: fetches office records from the server API (MongoDB-backed).
// The directory contains ONLY traceable records (official source URL + last-verified
// date). When the API is unavailable or has no records, callers receive an empty
// list plus an honest status — never fabricated offices.
// ==============================================================================

import { PublicOffice } from './types';
import { apiFetchOffices } from './api-client';

export interface OfficeFilterOptions {
  search?: string;
  category?: string;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  sortByDistance?: boolean;
  userLat?: number;
  userLng?: number;
}

export const OFFICE_CATEGORIES = [
  { id: 'all', labelKey: 'allOfficeTypes' as const },
  { id: 'Gram Panchayat', labelKey: 'officeTypeGramPanchayat' as const },
  { id: 'Tahsildar / Mandal Office', labelKey: 'officeTypeMandalOffice' as const },
  { id: 'Common Service Center (CSC)', labelKey: 'officeTypeCSC' as const },
  { id: 'District Agriculture Office', labelKey: 'officeTypeAgriculture' as const },
  { id: 'Health Center / Hospital', labelKey: 'officeTypeHealth' as const },
  { id: 'Post Office', labelKey: 'officeTypePostOffice' as const },
];

export const INDIAN_STATES = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function attachDistances(
  offices: PublicOffice[],
  userLat: number,
  userLng: number
): PublicOffice[] {
  return offices.map((office) => {
    if (office.latitude !== undefined && office.longitude !== undefined) {
      return {
        ...office,
        distanceKm: Number(
          calculateDistanceKm(userLat, userLng, office.latitude, office.longitude).toFixed(1)
        ),
      };
    }
    return office;
  });
}

export function sortByDistance(offices: PublicOffice[]): PublicOffice[] {
  return [...offices].sort((a, b) => {
    const aDist = a.distanceKm ?? Infinity;
    const bDist = b.distanceKm ?? Infinity;
    return aDist - bDist;
  });
}

export async function fetchOffices(): Promise<PublicOffice[]> {
  try {
    const data = await apiFetchOffices();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Honest data-source status for the office directory.
 * 'live'        -> the server API returned records (MongoDB-backed).
 * 'unavailable' -> server unreachable or no records; caller shows an empty state.
 * There is intentionally no bundled "sample" dataset: offices without a
 * traceable official source must never be presented as real.
 */
export type OfficesDataSource = 'live' | 'unavailable';

export async function fetchOfficesWithSource(): Promise<{
  offices: PublicOffice[];
  source: OfficesDataSource;
}> {
  try {
    const data = await apiFetchOffices();
    if (Array.isArray(data) && data.length > 0) {
      return { offices: data, source: 'live' };
    }
    return { offices: [], source: 'unavailable' };
  } catch {
    return { offices: [], source: 'unavailable' };
  }
}

// -----------------------------------------------------------------------------
// Live nearby discovery (Overpass-backed, via /api/offices/nearby)
// -----------------------------------------------------------------------------
export type NearbySource = 'live' | 'cache' | 'mixed' | 'unavailable';

export interface NearbyResponse {
  offices: PublicOffice[];
  count: number;
  source: NearbySource;
  attribution: string;
  fetchedAt: string;
  warning?: string;
  code?: string;
  skipped?: number;
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radius?: number;
  signal?: AbortSignal;
}

export async function fetchNearbyOffices({
  lat,
  lng,
  radius,
  signal,
}: NearbyParams): Promise<NearbyResponse> {
  const qs = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (radius != null) qs.set('radius', String(radius));
  const res = await fetch(`/api/offices/nearby?${qs.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Nearby search failed (${res.status})`);
  }
  return (await res.json()) as NearbyResponse;
}

export function filterOffices(
  offices: PublicOffice[],
  filters: OfficeFilterOptions
): PublicOffice[] {
  return offices.filter((office) => {
    if (filters.category && filters.category !== 'all') {
      if (office.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }
    if (filters.state && filters.state !== 'All India') {
      if (office.state.toLowerCase() !== filters.state.toLowerCase()) {
        return false;
      }
    }
    if (filters.district && filters.district.trim().length > 0) {
      if (
        !office.district.toLowerCase().includes(filters.district.toLowerCase().trim())
      ) {
        return false;
      }
    }
    if (filters.mandal && filters.mandal.trim().length > 0) {
      if (
        !office.mandal
          ?.toLowerCase()
          .includes(filters.mandal.toLowerCase().trim())
      ) {
        return false;
      }
    }
    if (filters.village && filters.village.trim().length > 0) {
      if (
        !office.village
          ?.toLowerCase()
          .includes(filters.village.toLowerCase().trim())
      ) {
        return false;
      }
    }
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      const searchCorpus = [
        office.name,
        office.nameHi || '',
        office.nameTe || '',
        office.category,
        office.address,
        office.district,
        office.mandal || '',
        office.village || '',
        office.state,
        ...(office.availableServices || []),
      ]
        .join(' ')
        .toLowerCase();
      return searchCorpus.includes(q);
    }
    return true;
  });
}

export function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function openStreetMapUrl(address: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
}

export function googleMapsCoordsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Google Maps turn-by-turn directions to a coordinate (uses the user's current location). */
export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function openStreetMapCoordsUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/#map=16/${lat}/${lng}`;
}

/**
 * A record is "traceable" when it names an official source and (ideally) links to
 * it. Only traceable records should be surfaced to citizens.
 */
export function hasTraceableSource(office: PublicOffice): boolean {
  return Boolean(office.officialSource && office.officialSource.trim().length > 0);
}

/** Human-friendly "last verified" date, e.g. "15 Oct 2026". */
export function formatVerifiedDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}