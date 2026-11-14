// ==============================================================================
// SCHEMATRIX - GET /api/services/[id]
// Returns a single public service by stable id.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllServices } from '@/lib/data-server';
import { jsonError, withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const services = await getAllServices();
  const service = services.find((s) => s.id === id);
  if (!service) {
    return jsonError('Service not found.', 404, 'not_found');
  }
  return NextResponse.json({ service });
}

export const GET = withErrorHandling(handler as any);