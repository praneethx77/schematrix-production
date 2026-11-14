// ==============================================================================
// SCHEMATRIX - POST /api/auth/login
// Verifies credentials with bcrypt and issues an HTTP-only session cookie.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import {
  verifyPassword,
  createSession,
  checkAuthRateLimit,
  StoredUser,
} from '@/lib/auth-server';
import { getClientIp, jsonError, withErrorHandling } from '@/lib/api';
import { loginSchema } from '@/lib/validation';

export const runtime = 'nodejs';

async function handler(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const limit = checkAuthRateLimit(`login:${ip}`);
  if (!limit.allowed) {
    return jsonError(
      'Too many login attempts. Please try again later.',
      429,
      'rate_limited',
      { retryAfterSec: limit.retryAfterSec }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid request body.', 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid input.', 400, 'validation');
  }

  const { email, password } = parsed.data;

  const db = await getDb();
  const user = await db
    .collection<StoredUser>(COLLECTIONS.users)
    .findOne({ email: email.toLowerCase() });

  // Constant-ish response regardless of which factor failed (no user enumeration).
  const genericError = () =>
    jsonError('Invalid email or password.', 401, 'invalid_credentials');

  if (!user) {
    // Run a dummy compare to reduce timing side-channel.
    await verifyPassword(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidin');
    return genericError();
  }

  // Phone-OTP-only accounts have no password and cannot use email login.
  if (!user.password_hash) {
    return jsonError(
      'This account uses mobile OTP sign-in. Use the mobile tab to sign in.',
      401,
      'phone_account'
    );
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return genericError();
  }

  await createSession(user);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      preferredLanguage: user.preferred_language,
    },
  });
}

export const POST = withErrorHandling(handler);