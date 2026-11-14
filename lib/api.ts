// ==============================================================================
// SCHEMATRIX - Shared API helpers (server-only)
// Consistent JSON envelope, Mongo error classification, and client IP extraction.
// ==============================================================================

import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { MongoServerError } from 'mongodb';

export interface ApiErrorBody {
  error: string;
  code?: string;
  retryAfterSec?: number;
}

export function jsonError(
  message: string,
  status = 400,
  code?: string,
  extra?: Record<string, unknown>
): NextResponse {
  const body: ApiErrorBody & Record<string, unknown> = { error: message };
  if (code) body.code = code;
  return NextResponse.json({ ...body, ...extra }, { status });
}

/**
 * Map a MongoDB error to an honest, non-leaky HTTP response.
 * Duplicate key -> 409. Connection failure -> 503. Otherwise 500.
 */
export function mongoErrorResponse(err: unknown): NextResponse {
  if (err instanceof MongoServerError) {
    if (err.code === 11000) {
      console.error('[api] duplicate key:', JSON.stringify(err.keyValue), 'index:', err.keyPattern);
      return jsonError('That record already exists.', 409, 'duplicate');
    }
  }
  const message = err instanceof Error ? err.message : 'Unexpected server error.';
  // Connection/config problems -> clearly "backend unavailable".
  if (
    /MONGODB_URI|connect|ECONNREFUSED|timeout|server selection/i.test(message)
  ) {
    return jsonError(
      'Database is not available. Check MONGODB_URI and your Atlas network access.',
      503,
      'db_unavailable'
    );
  }
  // Log full detail server-side; return a generic message to the client.
  console.error('[api] unhandled error:', err);
  return jsonError('Something went wrong. Please try again.', 500, 'internal');
}

/** Extract a best-effort client IP for rate limiting. */
export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/** Wrap a handler so thrown errors become consistent JSON responses. */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      return mongoErrorResponse(err);
    }
  }) as T;
}