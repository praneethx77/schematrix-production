// ==============================================================================
// SCHEMATRIX - GET /api/schemes
// Returns all schemes from MongoDB. On failure, returns 503 with an honest
// error so the client can fall back to bundled demo data.
// ==============================================================================

import { NextResponse } from 'next/server';
import { getAllSchemes } from '@/lib/data-server';
import { withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(): Promise<NextResponse> {
  const schemes = await getAllSchemes();
  return NextResponse.json({ schemes, count: schemes.length, source: 'mongo' });
}

export const GET = withErrorHandling(handler);