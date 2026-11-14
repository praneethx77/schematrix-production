// ==============================================================================
// SCHEMATRIX - GET /api/health
// Reports MongoDB connectivity without exposing any secrets or data.
// ==============================================================================

import { NextResponse } from 'next/server';
import { checkMongoHealth } from '@/lib/mongodb';
import { withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(): Promise<NextResponse> {
  const health = await checkMongoHealth();
  return NextResponse.json(
    {
      ok: health.connected,
      mongo: health,
    },
    { status: health.connected ? 200 : 503 }
  );
}

export const GET = withErrorHandling(handler);