// ==============================================================================
// SCHEMATRIX - GET /api/scheme-search
//
// Server-side search over the verified scheme database, with the filters the
// directory and student finder offer. Never fabricates: only stored records
// are returned, each with its source URL and verification date.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes } from '@/lib/data-server';
import { filterSchemes, type SchemeFilters } from '@/lib/schemeSearch';
import { SchemeWithDiscovery } from '@/lib/types';

export const runtime = 'nodejs';

async function handler(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const filters: SchemeFilters = {
    query: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    state: searchParams.get('state') || undefined,
    district: searchParams.get('district') || undefined,
    educationLevel: (searchParams.get('educationLevel') || undefined) as any,
    beneficiaryCategory: searchParams.get('beneficiaryCategory') || undefined,
    maxIncomeAnnual:
      searchParams.get('maxIncomeAnnual') !== null
        ? searchParams.get('maxIncomeAnnual') === ''
          ? undefined
          : Number(searchParams.get('maxIncomeAnnual'))
        : undefined,
    gender: (searchParams.get('gender') as any) || undefined,
    course: searchParams.get('course') || undefined,
    applicationStatus: searchParams.get('applicationStatus') || undefined,
    academicYear: searchParams.get('academicYear') || undefined,
    onlyScholarships: searchParams.get('onlyScholarships') === 'true',
  };

  // Drop undefined/null values so they are treated as "not filtering on this".
  Object.keys(filters).forEach((key) => {
    const k = key as keyof SchemeFilters;
    if (filters[k] === undefined || filters[k] === null) delete filters[k];
  });

  // Remove numeric NaN.
  if (filters.maxIncomeAnnual !== undefined && Number.isNaN(filters.maxIncomeAnnual)) {
    delete filters.maxIncomeAnnual;
  }

  const allSchemes = (await getAllSchemes()) as SchemeWithDiscovery[];
  const results = filterSchemes(allSchemes, filters);

  return NextResponse.json({
    schemes: results,
    count: results.length,
    filters,
  });
}

export const GET = handler;
