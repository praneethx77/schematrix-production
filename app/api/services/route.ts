// ==============================================================================
// SCHEMATRIX - GET /api/services
// Returns all public services from MongoDB.
// ==============================================================================

import { NextResponse } from 'next/server';
import { getAllServices } from '@/lib/data-server';
import { withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(): Promise<NextResponse> {
  const services = await getAllServices();
  return NextResponse.json({ services, count: services.length, source: 'mongo' });
}

export const GET = withErrorHandling(handler);