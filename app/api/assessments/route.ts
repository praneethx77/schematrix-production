// ==============================================================================
// SCHEMATRIX - POST /api/assessments
// Persists an eligibility assessment to MongoDB. Requires an authenticated user;
// unauthenticated/guest assessments are simply not persisted (client keeps a
// local record). Owner is enforced from the session, never from the body.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError, withErrorHandling } from '@/lib/api';
import { assessmentSchema } from '@/lib/validation';

export const runtime = 'nodejs';

async function handler(req: NextRequest): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    // Guests: not persisted server-side. Return 401 so the client keeps a
    // local-only record (never fabricate a server save).
    return jsonError('Sign in to save assessments to your account.', 401, 'auth_required');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid request body.', 400);
  }

  const parsed = assessmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid assessment.', 400, 'validation');
  }

  const a = parsed.data;
  const now = new Date().toISOString();

  const db = await getDb();
  const result = await db.collection(COLLECTIONS.eligibilityAssessments).insertOne({
    user_id: user.id,
    scheme_id: a.schemeId,
    scheme_name: a.schemeName,
    scheme_rule_version: a.schemeRuleVersion,
    answers: a.answers,
    result: a.result,
    explanation: a.explanation,
    missing_criteria: a.missingCriteria,
    required_documents: a.requiredDocuments,
    official_url: a.officialUrl,
    created_at: now,
  });

  return NextResponse.json(
    { success: true, id: result.insertedId.toHexString() },
    { status: 201 }
  );
}

export const POST = withErrorHandling(handler);