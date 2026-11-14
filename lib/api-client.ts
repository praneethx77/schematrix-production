// ==============================================================================
// SCHEMATRIX - Browser API client helpers
// Small fetch wrappers for client components to reach server API routes.
// Never contains secrets; safe for the browser.
// ==============================================================================

import { Scheme, PublicService, PublicOffice } from './types';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetchSchemes(signal?: AbortSignal): Promise<Scheme[]> {
  const data = await getJson<{ schemes: Scheme[] }>('/api/schemes', signal);
  return data.schemes;
}

export async function apiFetchServices(signal?: AbortSignal): Promise<PublicService[]> {
  const data = await getJson<{ services: PublicService[] }>('/api/services', signal);
  return data.services;
}

export async function apiFetchOffices(signal?: AbortSignal): Promise<PublicOffice[]> {
  const data = await getJson<{ offices: PublicOffice[] }>('/api/offices', signal);
  return data.offices;
}

export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'citizen' | 'admin';
    preferredLanguage?: 'en' | 'hi' | 'te';
  } | null;
}

export async function apiAuthMe(signal?: AbortSignal): Promise<AuthMeResponse> {
  return getJson<AuthMeResponse>('/api/auth/me', signal);
}