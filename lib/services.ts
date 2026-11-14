// ==============================================================================
// SCHEMATRIX - Public Services Discovery Service
// Client-side service: fetches services from the server API (MongoDB-backed) and
// transparently falls back to bundled demo data when the API is unavailable.
// ==============================================================================

import { PublicService } from './types';
import { DEMO_SERVICES } from './demoData';
import { apiFetchServices } from './api-client';

export interface ServiceFilterOptions {
  search?: string;
  category?: string;
}

export const SERVICE_CATEGORIES = [
  { id: 'all', labelKey: 'allCategories' as const, icon: null },
  { id: 'Certificates & Identity', labelKey: 'catCertificates' as const, icon: null },
  { id: 'Agriculture', labelKey: 'catAgriculture' as const, icon: null },
  { id: 'Health', labelKey: 'catHealth' as const, icon: null },
  { id: 'Education', labelKey: 'catEducation' as const, icon: null },
  { id: 'Local Government', labelKey: 'catLocalGovt' as const, icon: null },
];

/**
 * Fetch services from the server API (MongoDB). Falls back to bundled
 * DEMO_SERVICES when the API is unavailable or returns no records.
 */
export async function fetchServices(): Promise<PublicService[]> {
  try {
    const data = await apiFetchServices();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fall through to demo data.
  }

  return DEMO_SERVICES;
}

/**
 * Filter and search services by text and category
 */
export function filterServices(
  services: PublicService[],
  filters: ServiceFilterOptions
): PublicService[] {
  return services.filter((service) => {
    if (filters.category && filters.category !== 'all') {
      if (service.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      const searchCorpus = [
        service.name,
        service.nameHi || '',
        service.nameTe || '',
        service.department,
        service.category,
        service.description,
        service.descriptionHi || '',
        service.descriptionTe || '',
        service.targetAudience,
        service.eligibilitySummary || '',
        ...service.requiredDocuments,
        ...service.steps,
      ]
        .join(' ')
        .toLowerCase();
      return searchCorpus.includes(q);
    }

    return true;
  });
}