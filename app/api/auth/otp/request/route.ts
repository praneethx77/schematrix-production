// ==============================================================================
// SCHEMATRIX - POST /api/auth/otp/request
// Generates a 6-digit OTP, stores it hashed, and sends it via the configured SMS
// provider. Never logs the OTP. When no SMS provider is configured, returns an
// honest 503 instead of pretending the code was sent.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { checkAuthRateLimit } from '@/lib/auth-server';
import {
  issueOtp,
  generateOtp,
  clearOtp,
  OTP_TTL_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '@/lib/otp';
import { sendOtpSms } from '@/lib/sms';
import { getClientIp, jsonError, withErrorHandling } from '@/lib/api';
import { otpRequestSchema } from '@/lib/validation';

export const runtime = 'nodejs';

async function handler(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const limit = checkAuthRateLimit(`otp:${ip}`);
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

  const parsed = otpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid input.', 400, 'validation');
  }

  const { phone } = parsed.data;

  const otp = generateOtp();
  const issued = await issueOtp(phone, otp);
  if (!issued.ok) {
    return jsonError(
      'Please wait before requesting another code.',
      429,
      'cooldown',
      { retryAfterSec: issued.resendAfterSec }
    );
  }

  // In automated tests there is no SMS provider; return the code to the test
  // harness instead of sending. This branch is never active in production.
  const testMode =
    process.env.PLAYWRIGHT_TEST === '1' || process.env.NODE_ENV === 'test';

  if (!testMode) {
    const sms = await sendOtpSms(phone, otp);
    if (!sms.configured) {
      await clearOtp(phone);
      return jsonError(
        'SMS service is not configured on this deployment, so login codes cannot be sent.',
        503,
        'sms_not_configured'
      );
    }
    if (!sms.success) {
      await clearOtp(phone);
      return jsonError(
        'Could not send the verification code. Please try again.',
        502,
        'sms_failed'
      );
    }
  }

  return NextResponse.json({
    success: true,
    expiresInSec: OTP_TTL_SECONDS,
    resendAfterSec: OTP_RESEND_COOLDOWN_SECONDS,
    ...(testMode ? { devCode: otp } : {}),
  });
}

export const POST = withErrorHandling(handler);