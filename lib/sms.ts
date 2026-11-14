// ==============================================================================
// SCHEMATRIX - SMS OTP delivery (server-only)
//
// Provider abstraction for sending one-time passwords over SMS. Supports MSG91
// and 2Factor via environment variables. When no provider is configured, the
// caller receives { configured: false } and must surface an honest
// "SMS not configured" message. OTPs are NEVER logged here.
// ==============================================================================

import 'server-only';

export type SmsProvider = 'msg91' | '2factor';

export interface SmsResult {
  success: boolean;
  configured: boolean;
  provider?: SmsProvider;
  error?: string;
}

export function getSmsProvider(): SmsProvider | null {
  if (process.env.MSG91_AUTH_KEY) return 'msg91';
  if (process.env.TWO_FACTOR_API_KEY) return '2factor';
  return null;
}

export function isSmsConfigured(): boolean {
  return getSmsProvider() !== null;
}

function normalizePhone10(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
}

async function sendViaMsg91(phone: string, otp: string): Promise<SmsResult> {
  const authKey = process.env.MSG91_AUTH_KEY!;
  const sender = process.env.MSG91_SENDER_ID || 'SCHMAT';
  const message =
    process.env.MSG91_OTP_MESSAGE?.replace('{otp}', otp) ||
    `${otp} is your SCHEMATRIX verification code. Valid for 5 minutes. Do not share it.`;

  const res = await fetch('https://api.msg91.com/api/v2/sendsms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authkey: authKey,
    },
    body: JSON.stringify({
      sender,
      route: '4',
      country: '91',
      sms: [{ message, to: [normalizePhone10(phone)] }],
    }),
  });

  if (!res.ok) {
    return { success: false, configured: true, provider: 'msg91', error: `MSG91 HTTP ${res.status}` };
  }
  const data = (await res.json().catch(() => ({}))) as { type?: string; message?: string };
  if (data.type && data.type !== 'success') {
    return { success: false, configured: true, provider: 'msg91', error: data.message || 'MSG91 rejected the request' };
  }
  return { success: true, configured: true, provider: 'msg91' };
}

async function sendVia2Factor(phone: string, otp: string): Promise<SmsResult> {
  const apiKey = process.env.TWO_FACTOR_API_KEY!;
  // 2Factor custom-SMS endpoint: /SMSG/{to}/{text}
  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMSG/${encodeURIComponent(
    normalizePhone10(phone)
  )}/${encodeURIComponent(`${otp} is your SCHEMATRIX verification code. Valid for 5 minutes.`)}`;

  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    return { success: false, configured: true, provider: '2factor', error: `2Factor HTTP ${res.status}` };
  }
  const data = (await res.json().catch(() => ({}))) as { Status?: string; Details?: string };
  if (data.Status && data.Status !== 'Success') {
    return { success: false, configured: true, provider: '2factor', error: data.Details || '2Factor rejected the request' };
  }
  return { success: true, configured: true, provider: '2factor' };
}

/**
 * Send an OTP via the configured SMS provider. Never throws; never logs the OTP.
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SmsResult> {
  const provider = getSmsProvider();
  if (!provider) {
    return { success: false, configured: false };
  }
  try {
    return provider === 'msg91'
      ? await sendViaMsg91(phone, otp)
      : await sendVia2Factor(phone, otp);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown SMS error';
    return { success: false, configured: true, provider, error: message };
  }
}