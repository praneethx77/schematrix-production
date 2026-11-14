// ==============================================================================
// SCHEMATRIX - Authentication Service (client-side)
//
// Talks to the server auth API (/api/auth/*), which uses MongoDB + bcrypt and
// sets an HTTP-only session cookie. This module never stores tokens in
// localStorage and never fabricates a successful authentication. The server is
// the source of truth for the session.
// ==============================================================================

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  fullName?: string;
  role?: 'citizen' | 'admin';
  preferredLanguage?: 'en' | 'hi' | 'te';
  isDemo: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  demo?: boolean;
}

interface ApiUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: 'citizen' | 'admin';
  preferredLanguage?: 'en' | 'hi' | 'te';
}

function toAuthUser(u: ApiUser): AuthUser {
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    fullName: u.fullName,
    role: u.role,
    preferredLanguage: u.preferredLanguage,
    // Real sessions are never "demo"; the server is the source of truth.
    isDemo: false,
  };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; retryAfterSec?: number };
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`) as Error & {
      status?: number;
      retryAfterSec?: number;
    };
    err.status = res.status;
    err.retryAfterSec = data.retryAfterSec;
    throw err;
  }
  return data;
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validateFullName(name: string): string | null {
  if (!name || !name.trim()) return 'Full name is required.';
  if (name.trim().length < 2) return 'Enter your full name.';
  return null;
}

/** Validate and normalize a 10-digit Indian mobile number. Returns error or null. */
export function validateIndianPhone(phone: string): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return 'Mobile number is required.';
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid 10-digit Indian mobile number (starting 6-9).';
  }
  return null;
}

export function normalizeIndianPhone(phone: string): string {
  return (phone || '').replace(/\D/g, '').slice(-10);
}

/**
 * Returns the current authenticated user from the server session cookie, or
 * null. This is the source of truth — no local token storage.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: ApiUser | null };
    return data.user ? toAuthUser(data.user) : null;
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const emailErr = validateEmail(email);
  if (emailErr) return { success: false, error: emailErr };
  const pwErr = validatePassword(password);
  if (pwErr) return { success: false, error: pwErr };

  try {
    const data = await postJson<{ user: ApiUser }>('/api/auth/login', {
      email: email.trim(),
      password,
    });
    return { success: true, user: toAuthUser(data.user) };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Sign in failed.' };
  }
}

export async function signUp(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const nameErr = validateFullName(fullName);
  if (nameErr) return { success: false, error: nameErr };
  const emailErr = validateEmail(email);
  if (emailErr) return { success: false, error: emailErr };
  const pwErr = validatePassword(password);
  if (pwErr) return { success: false, error: pwErr };

  try {
    const data = await postJson<{ user: ApiUser }>('/api/auth/register', {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
    return { success: true, user: toAuthUser(data.user) };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Sign up failed.' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
  } catch {
    /* ignore network errors on logout */
  }
}

export interface OtpRequestResult {
  success: boolean;
  error?: string;
  resendAfterSec?: number;
  expiresInSec?: number;
  code?: string;
}

/** Request a login OTP for an Indian mobile number. */
export async function requestOtp(
  phone: string,
  fullName?: string
): Promise<OtpRequestResult> {
  const err = validateIndianPhone(phone);
  if (err) return { success: false, error: err };

  try {
    const data = await postJson<{
      success: true;
      expiresInSec: number;
      resendAfterSec: number;
      devCode?: string;
    }>('/api/auth/otp/request', {
      phone: normalizeIndianPhone(phone),
      fullName: fullName?.trim() || undefined,
    });
    return {
      success: true,
      expiresInSec: data.expiresInSec,
      resendAfterSec: data.resendAfterSec,
      code: data.devCode,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not send the code.' };
  }
}

/** Verify a login OTP and establish the session. */
export async function verifyOtp(phone: string, otp: string): Promise<AuthResult> {
  const phoneErr = validateIndianPhone(phone);
  if (phoneErr) return { success: false, error: phoneErr };
  if (!/^\d{6}$/.test((otp || '').trim())) {
    return { success: false, error: 'Enter the 6-digit OTP.' };
  }

  try {
    const data = await postJson<{ user: ApiUser }>('/api/auth/otp/verify', {
      phone: normalizeIndianPhone(phone),
      otp: otp.trim(),
    });
    return { success: true, user: toAuthUser(data.user) };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Verification failed.' };
  }
}