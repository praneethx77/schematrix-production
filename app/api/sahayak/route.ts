// ==============================================================================
// SCHEMATRIX - AI Sahayak API Route
// POST /api/sahayak  -> Gemini answer grounded on the verified dataset
// GET  /api/sahayak  -> non-secret status (configured?, model)
//
// Uses the official @google/genai SDK. The API key is read ONLY from the
// server-side GEMINI_API_KEY environment variable and is NEVER returned to the
// client. When Gemini is unavailable (no key, invalid key, quota, network,
// empty), it falls back to the built-in dataset and clearly labels the reply as
// built-in information rather than a live AI response.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  demoSahayakAnswer,
  buildSahayakSystemPrompt,
  SahayakContext,
  SahayakReplyMode,
  resolveReplyLanguage,
  detectLanguage,
  rankSchemesForQuery,
  buildGroundingBlock,
  databaseAnswer,
} from '@/lib/sahayak';
import { DEMO_SCHEMES, DEMO_SERVICES } from '@/lib/demoData';
import { getAllSchemes, getAllServices, getAllOffices } from '@/lib/data-server';
import type { SupportedLanguage, SchemeWithDiscovery } from '@/lib/types';

export const runtime = 'nodejs';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 30_000);
// The @google/genai SDK defaults the Gemini API (generativelanguage) endpoint to
// `v1`, which rejects `systemInstruction` ("Developer instruction is not enabled
// for api version v1. Use api version v1beta instead."). System instructions are
// required to ground answers on the verified dataset, so the Gemini API endpoint
// is pinned to `v1beta` here. Overridable via GEMINI_API_VERSION.
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION?.trim() || 'v1beta';

type SahayakErrorCode =
  | 'not_configured'
  | 'auth'
  | 'rate_limit'
  | 'quota_exhausted'
  | 'network'
  | 'empty'
  | 'unknown';

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

const FALLBACK_CONTEXT: SahayakContext = {
  schemes: DEMO_SCHEMES,
  services: DEMO_SERVICES,
  offices: [],
};

function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function isConfigured(): boolean {
  const k = process.env.GEMINI_API_KEY?.trim();
  return typeof k === 'string' && k.length > 0 && !k.includes('your-gemini-api-key');
}

// -----------------------------------------------------------------------------
// Quota cooldown
//
// When Google reports that the key's free-tier quota is exhausted, retrying the
// API on every message just burns time and adds 429 noise. We remember the
// failure for a short window and answer from the verified dataset instead, then
// probe again automatically once the window passes.
// -----------------------------------------------------------------------------
const QUOTA_COOLDOWN_MS = Number(process.env.GEMINI_QUOTA_COOLDOWN_MS || 15 * 60 * 1000);

const quotaState: { until: number; lastError?: string } = { until: 0 };

/** True while a quota-exhausted response is still cooling down. */
function isCoolingDown(): boolean {
  return Date.now() < quotaState.until;
}

/** Start (or restart) the cooldown after a quota-exhausted response. */
function startCooldown(reason: string): void {
  quotaState.until = Date.now() + QUOTA_COOLDOWN_MS;
  quotaState.lastError = reason;
}

/**
 * Build the grounding context, preferring MongoDB-backed data when reachable.
 * Falls back to bundled verified data when the DB is unavailable/empty.
 */
async function resolveContext(): Promise<{
  context: SahayakContext;
  source: 'mongo' | 'demo';
}> {
  try {
    const [schemes, services, offices] = await Promise.all([
      getAllSchemes(),
      getAllServices(),
      getAllOffices(),
    ]);
    if (schemes.length > 0) {
      return { context: { schemes, services, offices }, source: 'mongo' };
    }
  } catch {
    // Fall through to bundled verified data.
  }
  return { context: FALLBACK_CONTEXT, source: 'demo' };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

/** Classify a Gemini failure into an honest, non-leaky error code + message. */
function classifyError(err: any): { code: SahayakErrorCode; userMessage: string } {
  const status = err?.status ?? err?.statusCode ?? err?.response?.status;
  const msg = String(err?.message || err || '');

  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    /api key not valid|api_key_invalid|permission denied|unauthenticated|invalid_argument/i.test(msg)
  ) {
    return {
      code: 'auth',
      userMessage:
        'Live AI is unavailable because the configured API key was rejected. Showing verified scheme information from the database.',
    };
  }
  if (status === 429 || /rate limit|quota|resource_exhausted|too many requests/i.test(msg)) {
    // Google distinguishes a per-minute rate limit from an exhausted daily or
    // free-tier quota. The quota case needs a cooldown; the rate-limit case does
    // not, because a moment later the same key may answer again.
    const exhausted = /quota|resource_exhausted|exhausted|free ?tier|daily limit|billing/i.test(msg);

    if (exhausted) {
      return {
        code: 'quota_exhausted',
        userMessage:
          'Live AI is temporarily unavailable: the API key has used up its quota. Showing verified scheme information from the database. No AI request is retried until the quota resets.',
      };
    }

    return {
      code: 'rate_limit',
      userMessage:
        'The live AI service is busy or rate-limited. Showing verified scheme information from the database; please try again shortly.',
    };
  }
  if (
    (typeof status === 'number' && status >= 500) ||
    /fetch failed|ENOTFOUND|ETIMEDOUT|ECONN|timeout|network|socket/i.test(msg)
  ) {
    return {
      code: 'network',
      userMessage: 'The live AI service could not be reached. Showing verified scheme information from the database.',
    };
  }
  return {
    code: 'unknown',
    userMessage: 'Live AI is temporarily unavailable. Showing verified scheme information from the database.',
  };
}

function fallbackResponse(
  message: string,
  language: SupportedLanguage,
  context: SahayakContext,
  source: 'mongo' | 'demo',
  code: SahayakErrorCode,
  notice: string,
  retrieved?: SchemeWithDiscovery[]
): NextResponse {
  // When real scheme records were retrieved from the database, answer from those
  // records so the citizen still gets the matching schemes, eligibility, links
  // and verification dates. Only when nothing relevant was retrieved do we fall
  // back to the generic offline assistant.
  const reply =
    retrieved && retrieved.length > 0
      ? databaseAnswer(message, retrieved, language)
      : demoSahayakAnswer(message, context, language);

  return NextResponse.json({
    text: reply.text,
    sources: reply.sources,
    // 'demo' means not live AI. It is never presented as a live Gemini reply.
    mode: 'demo',
    contextSource: source,
    retrievedCount: retrieved?.length ?? 0,
    language: detectLanguage(message),
    error: code,
    notice,
  });
}

/** Non-secret status for the client (never includes the API key). */
export async function GET(): Promise<NextResponse> {
  const coolingDown = isCoolingDown();
  return NextResponse.json({
    configured: isConfigured(),
    model: geminiModel(),
    sdk: '@google/genai',
    // True while a quota-exhausted key is being skipped; the client can explain
    // that live AI is paused rather than implying the service is broken.
    quotaCoolingDown: coolingDown,
    aiAvailable: isConfigured() && !coolingDown,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: {
    message?: string;
    language?: SahayakReplyMode;
    history?: ChatTurn[];
    userId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const message = (body.message || '').trim();
  // 'auto' (default) mirrors the script the citizen wrote in; an explicit
  // en/hi/te overrides that and forces the chosen response language.
  const replyMode: SahayakReplyMode =
    body.language === 'hi' || body.language === 'te' || body.language === 'en'
      ? body.language
      : 'auto';
  const language = resolveReplyLanguage(replyMode, message);

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
  }

  const { context, source } = await resolveContext();

  // Search the MongoDB scheme database FIRST. These retrieved records are what
  // grounds the Gemini answer, and what the deterministic fallback shows, so a
  // citizen always sees real stored schemes rather than generic knowledge.
  const retrieved = rankSchemesForQuery(context.schemes, message);

  if (!isConfigured()) {
    return fallbackResponse(
      message,
      language,
      context,
      source,
      'not_configured',
      'Live AI is not configured (GEMINI_API_KEY is missing). Showing verified scheme information from the database.',
      retrieved
    );
  }

  // A key whose quota is exhausted is not called again until the cooldown ends,
  // so no message is ever answered by retrying a known-dead quota.
  if (isCoolingDown()) {
    return fallbackResponse(
      message,
      language,
      context,
      source,
      'quota_exhausted',
      'Live AI is temporarily unavailable because the API quota is exhausted. Showing verified scheme information from the database.',
      retrieved
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!.trim(),
      httpOptions: { apiVersion: GEMINI_API_VERSION },
    });
    // Ground the model on the retrieved database records specifically, rather
    // than on the whole dataset, so the answer is traceable to stored rows.
    const systemPrompt = `${buildSahayakSystemPrompt(context, replyMode)}\n\nRETRIEVED SCHEME RECORDS FROM THE SCHEMATRIX DATABASE (use only these where relevant):\n${buildGroundingBlock(retrieved)}`;

    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    const contents = [
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await withTimeout(
      ai.models.generateContent({
        model: geminiModel(),
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      }),
      REQUEST_TIMEOUT_MS
    );

    const text = result.text?.trim();
    if (!text) {
      return fallbackResponse(
        message,
        language,
        context,
        source,
        'empty',
        'The live AI returned an empty response. Showing verified scheme information from the database.',
        retrieved
      );
    }

    return NextResponse.json({
      text,
      sources: [],
      mode: 'live',
      contextSource: source,
      // Report the language Gemini actually wrote in (native script), which is
      // what the client uses to pick a speech-synthesis voice.
      language: detectLanguage(text),
    });
  } catch (err: any) {
    // Never expose the provider error detail or key to the client.
    const { code, userMessage } = classifyError(err);
    // A quota-exhausted key would only fail again, so open the cooldown. A plain
    // rate limit or network blip is left alone: the next message may succeed.
    if (code === 'quota_exhausted') {
      startCooldown(String(err?.message || err).slice(0, 200));
    }
    console.error(
      '[sahayak] Gemini error: code=' + code +
      ' status=' + String(err?.status ?? err?.statusCode ?? '') +
      ' apiVersion=' + GEMINI_API_VERSION +
      ' model=' + geminiModel() +
      ' detail=' + String(err?.message || err).slice(0, 200)
    );
    return fallbackResponse(message, language, context, source, code, userMessage, retrieved);
  }
}