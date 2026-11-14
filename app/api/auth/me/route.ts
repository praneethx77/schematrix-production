// ==============================================================================
// SCHEMATRIX - GET /api/auth/me
// Returns the current authenticated user (from the session cookie) or null.
// ==============================================================================

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(): Promise<NextResponse> {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export const GET = withErrorHandling(handler);