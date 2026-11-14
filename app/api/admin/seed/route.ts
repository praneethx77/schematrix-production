// ==============================================================================
// SCHEMATRIX - POST /api/admin/seed
// Idempotent database initialization + demonstration seed. Protected by an
// optional ADMIN_SEED_TOKEN env var (if set). If ADMIN_SEED_TOKEN is not set,
// the route is disabled to avoid public data mutation.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/collections';
import { jsonError, withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(req: NextRequest): Promise<NextResponse> {
  const token = process.env.ADMIN_SEED_TOKEN?.trim();
  if (!token) {
    return jsonError(
      'Seeding is disabled. Set ADMIN_SEED_TOKEN to enable the seed endpoint.',
      403,
      'seed_disabled'
    );
  }

  const provided = req.headers.get('x-seed-token');
  if (provided !== token) {
    return jsonError('Unauthorized.', 401, 'unauthorized');
  }

  const result = await initDatabase();
  return NextResponse.json({ success: true, ...result });
}

export const POST = withErrorHandling(handler);