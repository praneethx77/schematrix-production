// ==============================================================================
// SCHEMATRIX - POST /api/schemes/match
//
// Student scheme finder. Collects only non-sensitive details, returns matching
// scholarships with explicit reasons, each labelled "Potential match - verify
// final eligibility". Never asks for or stores Aadhaar, bank account or other
// identifying documents.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes } from '@/lib/data-server';
import { matchSchemesForStudent, type StudentProfile } from '@/lib/schemeSearch';
import { SchemeWithDiscovery } from '@/lib/types';

export const runtime = 'nodejs';

async function handler(req: NextRequest): Promise<NextResponse> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const profile: StudentProfile = {
    state: body.state ?? null,
    district: body.district ?? null,
    educationLevel: body.educationLevel ?? null,
    course: body.course ?? null,
    academicYear: body.academicYear ?? null,
    annualFamilyIncome:
      body.annualFamilyIncome === null || body.annualFamilyIncome === undefined
        ? null
        : Number(body.annualFamilyIncome),
    category: body.category ?? null,
    gender: body.gender ?? null,
    age: body.age === null || body.age === undefined ? null : Number(body.age),
  };

  // Sanitise out unusable values.
  if (profile.annualFamilyIncome !== null && Number.isNaN(profile.annualFamilyIncome))
    profile.annualFamilyIncome = null;
  if (profile.age !== null && Number.isNaN(profile.age)) profile.age = null;

  const allSchemes = (await getAllSchemes()) as SchemeWithDiscovery[];
  const matches = matchSchemesForStudent(allSchemes, profile);

  return NextResponse.json({
    matches: matches.map((m) => ({
      ...m.scheme,
      // Always remind the student that matching is not a guarantee.
      reasons: m.reasons,
      score: m.score,
      potentialMatch: true,
    })),
    count: matches.length,
    note:
      'Potential match — verify final eligibility. These are database records, not live AI. Confirm the current rules and dates on the official government portal before applying.',
  });
}

export const POST = handler;
