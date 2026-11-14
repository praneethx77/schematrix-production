// ==============================================================================
// SCHEMATRIX - POST /api/auth/otp/verify
// Verifies a submitted OTP and, on success, creates (or finds) the phone account
// and issues an HTTP-only session cookie.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  findOrCreatePhoneUser,
  createSession,
  checkAuthRateLimit,
  StoredUser,
} from '@/lib/auth-server';
import { verifyOtp, VerifyFailReason } from '@/lib/otp';
import { getClientIp, jsonError, withErrorHandling } from '@/lib/api';
import { otpVerifySchema } from '@/lib/validation';

export const runtime = 'nodejs';

const REASON_MESSAGE: Record<VerifyFailReason, string> = {
  not_found: 'Request a new code to continue.',
  used: 'This code was already used. Request a new one.',
  expired: 'This code has expired. Request a new one.',
  too_many_attempts: 'Too many attempts. Request a new code.',
  invalid: 'Incorrect code. Please try again.',
};

async function handler(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const limit = checkAuthRateLimit(`otpverify:${ip}`);
  if (!limit.allowed) {
    return jsonError(
      'Too many attempts. Please try again later.',
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

  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid input.', 400, 'validation');
  }

  const { phone, otp } = parsed.data;
  const result = await verifyOtp(phone, otp);
  if (!result.ok) {
    return jsonError(
      REASON_MESSAGE[result.reason ?? 'not_found'],
      401,
      `otp_${result.reason ?? 'invalid'}`
    );
  }

  const user: StoredUser = await findOrCreatePhoneUser(phone);
  await createSession(user);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.full_name,
      role: user.role,
      preferredLanguage: user.preferred_language,
    },
  });
}

export const POST = withErrorHandling(handler);