// ==============================================================================
// SCHEMATRIX - GET /api/offices
// Returns all offices from MongoDB (source: mongo). Client computes distance.
// ==============================================================================

import { NextResponse } from 'next/server';
import { getAllOffices } from '@/lib/data-server';
import { withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(): Promise<NextResponse> {
  const offices = await getAllOffices();
  return NextResponse.json({ offices, count: offices.length, source: 'mongo' });
}

export const GET = withErrorHandling(handler);