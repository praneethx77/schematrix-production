// ==============================================================================
// SCHEMATRIX - GET /api/offices/[id]
// Returns a single office by stable id.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllOffices } from '@/lib/data-server';
import { jsonError, withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const offices = await getAllOffices();
  const office = offices.find((o) => o.id === id);
  if (!office) {
    return jsonError('Office not found.', 404, 'not_found');
  }
  return NextResponse.json({ office });
}

export const GET = withErrorHandling(handler as any);