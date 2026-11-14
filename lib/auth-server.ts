// ==============================================================================
// SCHEMATRIX - Server Authentication Utilities (server-only)
//
// Password hashing (bcrypt), opaque session tokens (stored hashed in MongoDB),
// and HTTP-only cookie helpers. Never imported into client components.
// ==============================================================================

import 'server-only';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ObjectId, WithId, Document } from 'mongodb';
import { getDb, COLLECTIONS } from './mongodb';
import { cookies, headers } from 'next/headers';

export const SESSION_COOKIE = 'schematrix_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const BCRYPT_ROUNDS = 12;

/**
 * Whether the session cookie should be marked `secure` (HTTPS-only).
 * Secure in production EXCEPT when served over plain HTTP on localhost (local
 * dev/preview), so local login still works while deployed cookies stay HTTPS-only.
 */
async function shouldUseSecureCookie(): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') return false;
  try {
    const h = await headers();
    const host = (h.get('host') || '').toLowerCase();
    const proto = (h.get('x-forwarded-proto') || '').split(',')[0].trim().toLowerCase();
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0')) {
      return false;
    }
    if (proto === 'http') return false;
  } catch {
    /* if headers unavailable, default to secure */
  }
  return true;
}

export interface StoredUser {
  _id: ObjectId;
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'admin';
  preferred_language?: 'en' | 'hi' | 'te';
  /** Present for email/password accounts; absent for mobile-OTP-only accounts. */
  password_hash?: string;
  created_at: string;
  updated_at: string;
}

/** Public, safe view of a user returned to the client (never includes hash). */
export interface PublicUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: 'citizen' | 'admin';
  preferredLanguage?: 'en' | 'hi' | 'te';
}

export function toPublicUser(row: StoredUser): PublicUser {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    role: row.role,
    preferredLanguage: row.preferred_language,
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Hash an opaque token with SHA-256 for storage (tokens never stored raw). */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Find an existing user by phone, or create a phone-OTP account. Phone accounts
 * have no password and use a synthetic (non-routable) email so the unique email
 * index is satisfied without exposing a real address.
 */
export async function findOrCreatePhoneUser(
  phone: string,
  fullName?: string
): Promise<StoredUser> {
  const db = await getDb();
  const users = db.collection<StoredUser>(COLLECTIONS.users);

  const existing = await users.findOne({ phone });
  if (existing) return existing;

  const now = new Date().toISOString();
  const name = (fullName && fullName.trim()) || `Citizen ${phone.slice(-4)}`;
  const doc: Omit<StoredUser, '_id'> = {
    id: '',
    full_name: name,
    email: `phone:${phone}@schematrix.local`,
    phone,
    role: 'citizen',
    preferred_language: 'en',
    created_at: now,
    updated_at: now,
  };

  const result = await users.insertOne(doc as any);
  const userId = result.insertedId.toHexString();
  await users.updateOne({ _id: result.insertedId }, { $set: { id: userId } });

  return { ...doc, id: userId, _id: result.insertedId };
}

/** Generate a cryptographically random opaque session token. */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

interface SessionDoc {
  _id?: ObjectId;
  token_hash: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

/**
 * Create a session row and set the HTTP-only cookie. Returns the public user.
 */
export async function createSession(user: StoredUser): Promise<void> {
  const db = await getDb();
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.collection<SessionDoc>(COLLECTIONS.sessions).insertOne({
    token_hash: tokenHash,
    user_id: user.id,
    expires_at: expiresAt,
    created_at: new Date(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: await shouldUseSecureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Resolve the current session cookie to a public user, or null. Cleans up
 * expired sessions and invalidates the cookie when the session is stale.
 */
export async function getSessionUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const tokenHash = hashToken(token);
  const session = await db.collection<SessionDoc>(COLLECTIONS.sessions).findOne({
    token_hash: tokenHash,
  });

  if (!session) return null;

  if (session.expires_at.getTime() <= Date.now()) {
    // Expired: clean up and drop the cookie.
    await db
      .collection<SessionDoc>(COLLECTIONS.sessions)
      .deleteOne({ token_hash: tokenHash });
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  const user = await db
    .collection<StoredUser & Document>(COLLECTIONS.users)
    .findOne({ id: session.user_id });

  if (!user) return null;
  return toPublicUser(user as unknown as StoredUser);
}

/** Destroy the current session (row + cookie). Safe to call when no session. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db
      .collection<SessionDoc>(COLLECTIONS.sessions)
      .deleteOne({ token_hash: hashToken(token) });
  }
  cookieStore.delete(SESSION_COOKIE);
}

// -----------------------------------------------------------------------------
// Simple in-memory auth rate limiter (per server instance)
// -----------------------------------------------------------------------------
interface RateEntry {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateEntry>();
const RATE_LIMIT = 10; // attempts
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Returns true if the key is allowed to proceed, false if rate-limited.
 * Keyed by IP (fallback to 'unknown').
 */
export function checkAuthRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateBuckets.get(key);

  if (!entry || entry.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_LIMIT) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}