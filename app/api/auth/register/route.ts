// ==============================================================================
// SCHEMATRIX - POST /api/auth/register
// Creates a user with a bcrypt-hashed password and an HTTP-only session cookie.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import {
  hashPassword,
  createSession,
  StoredUser,
} from '@/lib/auth-server';
import { checkAuthRateLimit } from '@/lib/auth-server';
import { getClientIp, jsonError, withErrorHandling } from '@/lib/api';
import { registerSchema } from '@/lib/validation';

export const runtime = 'nodejs';

async function handler(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const limit = checkAuthRateLimit(`register:${ip}`);
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid input.', 400, 'validation');
  }

  const { fullName, email, password, preferredLanguage } = parsed.data;

  const db = await getDb();
  const users = db.collection<StoredUser>(COLLECTIONS.users);

  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) {
    return jsonError('An account with this email already exists.', 409, 'email_taken');
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const doc: Omit<StoredUser, '_id'> = {
    id: '',
    full_name: fullName,
    email: email.toLowerCase(),
    role: 'citizen',
    preferred_language: preferredLanguage || 'en',
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  };

  const result = await users.insertOne(doc as any);
  const userId = result.insertedId.toHexString();
  await users.updateOne({ _id: result.insertedId }, { $set: { id: userId } });

  const stored: StoredUser = {
    ...doc,
    id: userId,
    _id: result.insertedId,
  };

  await createSession(stored);

  return NextResponse.json(
    {
      user: {
        id: userId,
        email: stored.email,
        fullName: stored.full_name,
        role: stored.role,
        preferredLanguage: stored.preferred_language,
      },
    },
    { status: 201 }
  );
}

export const POST = withErrorHandling(handler);