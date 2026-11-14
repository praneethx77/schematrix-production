// ==============================================================================
// SCHEMATRIX - OpenStreetMap Overpass fetch wrapper (server-only)
//
// Queries the Overpass API for public-service places around a point. Handles
// timeouts, HTTP errors and rate limiting honestly, and never fabricates data.
// An injectable fetch implementation keeps it testable.
// ==============================================================================

import 'server-only';
import { buildOverpassQuery, parseOverpassElements } from './overpass-query';
import { PublicOffice } from './types';

export type OverpassErrorCode =
  | 'timeout'
  | 'rate_limited'
  | 'http_error'
  | 'network'
  | 'parse_error';

export interface OverpassResult {
  ok: boolean;
  offices: PublicOffice[];
  skipped: number;
  error?: string;
  code?: OverpassErrorCode;
  retryAfterSec?: number;
}

const DEFAULT_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

function endpoints(): string[] {
  const custom = process.env.OVERPASS_ENDPOINT?.trim();
  return custom ? [custom] : DEFAULT_ENDPOINTS;
}

const REQUEST_TIMEOUT_MS = Number(process.env.OVERPASS_TIMEOUT_MS || 20_000);

async function postQuery(
  endpoint: string,
  query: string,
  fetchImpl: typeof fetch
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        // Identify the app per Overpass usage policy.
        'User-Agent': 'SCHEMATRIX/1.0 (GovTech office discovery)',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch nearby offices from Overpass. Tries each endpoint in order. Returns a
 * structured result; never throws.
 */
export async function fetchNearbyFromOverpass(
  lat: number,
  lng: number,
  radius: number,
  fetchImpl: typeof fetch = fetch
): Promise<OverpassResult> {
  const query = buildOverpassQuery(lat, lng, radius);

  let lastError: OverpassResult = {
    ok: false,
    offices: [],
    skipped: 0,
    error: 'Live office discovery is temporarily unavailable.',
    code: 'network',
  };

  for (const endpoint of endpoints()) {
    let res: Response;
    try {
      res = await postQuery(endpoint, query, fetchImpl);
    } catch (err: any) {
      const aborted = err?.name === 'AbortError';
      lastError = {
        ok: false,
        offices: [],
        skipped: 0,
        error: aborted
          ? 'The live office service did not respond in time.'
          : 'Could not reach the live office service.',
        code: aborted ? 'timeout' : 'network',
      };
      continue;
    }

    if (res.status === 429 || res.status === 504) {
      return {
        ok: false,
        offices: [],
        skipped: 0,
        error: 'The live office service is busy. Please try again shortly.',
        code: 'rate_limited',
        retryAfterSec: res.status === 429 ? 30 : 15,
      };
    }
    if (!res.ok) {
      lastError = {
        ok: false,
        offices: [],
        skipped: 0,
        error: 'The live office service returned an error.',
        code: 'http_error',
      };
      continue;
    }

    try {
      const data = (await res.json()) as { elements?: any[] };
      const elements = Array.isArray(data.elements) ? data.elements : [];
      const { offices, skipped } = parseOverpassElements(elements, lat, lng);
      return { ok: true, offices, skipped };
    } catch {
      lastError = {
        ok: false,
        offices: [],
        skipped: 0,
        error: 'The live office service returned an unreadable response.',
        code: 'parse_error',
      };
    }
  }

  return lastError;
}