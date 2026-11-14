// ==============================================================================
// SCHEMATRIX - Schemes Discovery Service
// Client-side service: fetches schemes from the server API (MongoDB-backed) and
// transparently falls back to bundled demo data when the API is unavailable.
// ==============================================================================

import { Scheme } from './types';
import { DEMO_SCHEMES } from './demoData';
import { apiFetchSchemes } from './api-client';

export interface SchemeFilterOptions {
  search?: string;
  category?: string;
  state?: string;
  verifiedOnly?: boolean;
}

export const CATEGORIES = [
  { id: 'all', labelKey: 'allCategories' as const },
  { id: 'Agriculture', labelKey: 'catAgriculture' as const },
  { id: 'Health', labelKey: 'catHealth' as const },
  { id: 'Housing', labelKey: 'catHousing' as const },
  { id: 'Employment', labelKey: 'catEmployment' as const },
  { id: 'Food Security', labelKey: 'catFood' as const },
  { id: 'Women & Child', labelKey: 'catWomenChild' as const },
];

export const STATES = [
  'All India',
  'Telangana',
  'Andhra Pradesh',
  'Karnataka',
  'Maharashtra',
  'Uttar Pradesh',
  'Bihar',
  'Madhya Pradesh',
  'Rajasthan',
  'Tamil Nadu',
];

/**
 * Fetch schemes from the server API (MongoDB). Falls back to bundled
 * DEMO_SCHEMES when the API is unavailable or returns no records.
 */
export async function fetchSchemes(): Promise<Scheme[]> {
  try {
    const data = await apiFetchSchemes();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fall through to demo data.
  }

  return DEMO_SCHEMES;
}

/**
 * Real-time filter and search across scheme names (EN/HI/TE), categories, departments, and benefits
 */
export function filterSchemes(schemes: Scheme[], filters: SchemeFilterOptions): Scheme[] {
  return schemes.filter((scheme) => {
    // 1. Category Filter
    if (filters.category && filters.category !== 'all') {
      if (scheme.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // 2. State Filter
    if (filters.state && filters.state !== 'All India') {
      const schemeState = (scheme.applicableState || 'All India').toLowerCase();
      const targetState = filters.state.toLowerCase();
      const isApplicable =
        schemeState.includes('all india') || schemeState.includes(targetState);
      if (!isApplicable) {
        return false;
      }
    }

    // 3. Verified Status Filter
    if (filters.verifiedOnly && scheme.reviewStatus !== 'verified') {
      return false;
    }

    // 4. Multilingual Search Query
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();

      const searchCorpus = [
        scheme.name,
        scheme.nameHi || '',
        scheme.nameTe || '',
        scheme.department,
        scheme.category,
        scheme.summary,
        scheme.summaryHi || '',
        scheme.summaryTe || '',
        scheme.intendedBeneficiaries,
        scheme.benefits,
        scheme.benefitsHi || '',
        scheme.benefitsTe || '',
        ...scheme.eligibilityCriteria,
        ...scheme.requiredDocuments,
      ]
        .join(' ')
        .toLowerCase();

      return searchCorpus.includes(q);
    }

    return true;
  });
}
