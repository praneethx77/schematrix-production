// ==============================================================================
// SCHEMATRIX - GET /api/schemes/[id]
// Returns a single scheme by stable id.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSchemeById } from '@/lib/data-server';
import { jsonError, withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const scheme = await getSchemeById(id);
  if (!scheme) {
    return jsonError('Scheme not found.', 404, 'not_found');
  }
  return NextResponse.json({ scheme });
}

export const GET = withErrorHandling(handler as any);