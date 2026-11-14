// ==============================================================================
// SCHEMATRIX - OTP storage & verification (server-only)
//
// OTPs are generated with a cryptographically secure RNG and stored ONLY as a
// SHA-256 hash (never in plaintext, never logged). Each code has a short TTL, a
// max-attempts cap, a resend cooldown, and is single-use.
// ==============================================================================

import 'server-only';
import crypto from 'crypto';
import { getDb, COLLECTIONS } from './mongodb';

export const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

interface OtpDoc {
  phone: string;
  otp_hash: string;
  expires_at: Date;
  attempts: number;
  consumed: boolean;
  created_at: Date;
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/** Generate a 6-digit numeric OTP using a CSPRNG. */
export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export interface IssueResult {
  ok: boolean;
  /** Seconds until a resend is allowed (when ok === false due to cooldown). */
  resendAfterSec: number;
}

/**
 * Store a hashed OTP for a phone number. Enforces the resend cooldown. Returns
 * ok:false with a resendAfterSec when the caller is trying to resend too soon.
 */
export async function issueOtp(phone: string, otp: string): Promise<IssueResult> {
  const db = await getDb();
  const col = db.collection<OtpDoc>(COLLECTIONS.otpCodes);
  const now = new Date();

  const existing = await col.findOne({ phone });
  if (existing) {
    const cooldownEnd = existing.created_at.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
    if (cooldownEnd > now.getTime()) {
      return {
        ok: false,
        resendAfterSec: Math.ceil((cooldownEnd - now.getTime()) / 1000),
      };
    }
  }

  await col.updateOne(
    { phone },
    {
      $set: {
        phone,
        otp_hash: hashOtp(otp),
        expires_at: new Date(now.getTime() + OTP_TTL_SECONDS * 1000),
        attempts: 0,
        consumed: false,
        created_at: now,
      },
    },
    { upsert: true }
  );

  return { ok: true, resendAfterSec: OTP_RESEND_COOLDOWN_SECONDS };
}

export type VerifyFailReason =
  | 'not_found'
  | 'expired'
  | 'used'
  | 'too_many_attempts'
  | 'invalid';

export interface VerifyResult {
  ok: boolean;
  reason?: VerifyFailReason;
}

/**
 * Verify a submitted OTP against the stored hash. Enforces expiry, single-use,
 * and the max-attempts cap. Consumes the code on success.
 */
export async function verifyOtp(phone: string, otp: string): Promise<VerifyResult> {
  const db = await getDb();
  const col = db.collection<OtpDoc>(COLLECTIONS.otpCodes);
  const rec = await col.findOne({ phone });

  if (!rec) return { ok: false, reason: 'not_found' };
  if (rec.consumed) return { ok: false, reason: 'used' };
  if (rec.expires_at.getTime() <= Date.now()) {
    await col.deleteOne({ phone });
    return { ok: false, reason: 'expired' };
  }
  if (rec.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (rec.otp_hash !== hashOtp(otp)) {
    await col.updateOne({ phone }, { $inc: { attempts: 1 } });
    return { ok: false, reason: 'invalid' };
  }

  await col.updateOne({ phone }, { $set: { consumed: true } });
  return { ok: true };
}

/** Remove any stored OTP for a phone (used when SMS delivery fails). */
export async function clearOtp(phone: string): Promise<void> {
  try {
    const db = await getDb();
    await db.collection<OtpDoc>(COLLECTIONS.otpCodes).deleteOne({ phone });
  } catch {
    /* ignore */
  }
}