'use client';

// ==============================================================================
// SCHEMATRIX - Sign In / Sign Up
// Two authentication methods against the server API (/api/auth/*):
//   • Email + password (sign in or create account)
//   • Mobile OTP (+91, 10-digit, 6-digit code)
// Both establish the same HTTP-only session. No demo sessions are fabricated.
// ==============================================================================

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Mail,
  Lock,
  User,
  Smartphone,
  KeyRound,
} from 'lucide-react';

type Mode = 'signin' | 'signup';
type Method = 'email' | 'mobile';

export function SignIn(): React.ReactElement {
  const { t } = useLanguage();
  const { user, signIn, signUp, requestOtp, verifyOtp, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';

  const [method, setMethod] = useState<Method>('email');

  // Email/password state
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mobile OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [sending, setSending] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const startResendCooldown = (seconds: number) => {
    setResendIn(seconds);
    const timer = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (method === 'email') {
        const res =
          mode === 'signin'
            ? await signIn(email, password)
            : await signUp(fullName, email, password);
        if (!res.success) {
          setError(res.error || t('authFailed'));
          return;
        }
        setNotice(t('authSuccess'));
        setFullName('');
        setEmail('');
        setPassword('');
        router.push(nextPath);
        router.refresh();
      } else if (!otpSent) {
        const res = await requestOtp(phone, fullName || undefined);
        if (!res.success) {
          setError(res.error || t('authFailed'));
          return;
        }
        setOtpSent(true);
        setOtp('');
        setNotice(t('authOtpSent'));
        startResendCooldown(res.resendAfterSec || 30);
      } else {
        const res = await verifyOtp(phone, otp);
        if (!res.success) {
          setError(res.error || t('authFailed'));
          return;
        }
        setNotice(t('authSuccess'));
        setOtp('');
        setOtpSent(false);
        router.push(nextPath);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setNotice(t('authSignedOut'));
  };

  const switchMethod = (next: Method) => {
    setMethod(next);
    setError(null);
    setNotice(null);
    setOtpSent(false);
    setOtp('');
  };

  return (
    <section className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('appName')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {user ? t('welcomeBack') : t('authTitle')}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t('authSubtitle')}
          </p>
        </div>

        {/* Signed-in view */}
        {user ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-neutral-900 dark:text-white truncate">{user.fullName}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                  {user.phone ? `+91 ${user.phone}` : user.email}
                </p>
              </div>
            </div>
            {notice && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            {/* Method tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => switchMethod('email')}
                aria-pressed={method === 'email'}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  method === 'email'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>{t('authMethodEmail')}</span>
              </button>
              <button
                type="button"
                onClick={() => switchMethod('mobile')}
                aria-pressed={method === 'mobile'}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  method === 'mobile'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{t('authMethodMobile')}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {method === 'email' ? (
                <>
                  {/* Sign in / Sign up toggle */}
                  <div className="flex items-center justify-center gap-4 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className={mode === 'signin' ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}
                    >
                      {t('login')}
                    </button>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className={mode === 'signup' ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}
                    >
                      {t('register')}
                    </button>
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {t('authFullName')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('authFullNamePlaceholder')}
                          autoComplete="name"
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {t('authEmail')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('authEmailPlaceholder')}
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {t('authPassword')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('authPasswordPlaceholder')}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {t('authFullName')} ({t('optional')})
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('authFullNamePlaceholder')}
                        autoComplete="name"
                        disabled={otpSent}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {t('authPhone')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">
                        +91
                      </span>
                      <Smartphone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder={t('authPhonePlaceholder')}
                        autoComplete="tel-national"
                        disabled={otpSent}
                        className="w-full pl-14 pr-10 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {t('authOtpLabel')}
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder={t('authOtpPlaceholder')}
                          autoComplete="one-time-code"
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm tracking-[0.3em] text-center text-neutral-900 dark:text-white placeholder-neutral-400 placeholder:tracking-normal focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp('');
                            setError(null);
                          }}
                          className="font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                          {t('authChangePhone')}
                        </button>
                        <button
                          type="button"
                          disabled={resendIn > 0 || sending}
                          onClick={async () => {
                            setSending(true);
                            setError(null);
                            const res = await requestOtp(phone, fullName || undefined);
                            setSending(false);
                            if (!res.success) {
                              setError(res.error || t('authFailed'));
                              return;
                            }
                            setNotice(t('authOtpResent'));
                            startResendCooldown(res.resendAfterSec || 30);
                          }}
                          className="font-bold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                          {resendIn > 0 ? `${t('authResendIn')} (${resendIn}s)` : t('authResendCode')}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {notice && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{notice}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || sending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
              >
                {submitting || sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : method === 'email' ? (
                  mode === 'signin' ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )
                ) : otpSent ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
                <span>
                  {method === 'email'
                    ? mode === 'signin'
                      ? t('login')
                      : t('register')
                    : otpSent
                      ? t('authVerify')
                      : t('authSendCode')}
                </span>
              </button>
            </form>

            <p className="text-center text-[11px] text-neutral-500 dark:text-neutral-400">
              {t('authSecureBadge')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}