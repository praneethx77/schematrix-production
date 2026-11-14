// ==============================================================================
// SCHEMATRIX - POST /api/auth/logout
// Destroys the current session (row + cookie).
// ==============================================================================

import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth-server';
import { withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';

async function handler(): Promise<NextResponse> {
  await destroySession();
  return NextResponse.json({ success: true });
}

export const POST = withErrorHandling(handler);