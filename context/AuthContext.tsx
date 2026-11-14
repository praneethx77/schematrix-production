'use client';

// ==============================================================================
// SCHEMATRIX - Authentication Context
// Provides current user/session state across the app. Hydrates from the server
// session API (/api/auth/me) after mount (never during SSR) to keep server/client
// markup equal. Supports both email/password and mobile-OTP sign-in.
// ==============================================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  AuthUser,
  OtpRequestResult,
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  requestOtp,
  verifyOtp,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  requestOtp: (phone: string, fullName?: string) => Promise<OtpRequestResult>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await refresh();
      if (!active) return;
    })();

    return () => {
      active = false;
    };
  }, [refresh]);

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      const res = await signIn(email, password);
      if (res.success) {
        await refresh();
      }
      return { success: res.success, error: res.error };
    },
    [refresh]
  );

  const handleSignUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const res = await signUp(fullName, email, password);
      if (res.success) {
        await refresh();
      }
      return { success: res.success, error: res.error };
    },
    [refresh]
  );

  const handleRequestOtp = useCallback(
    async (phone: string, fullName?: string) => requestOtp(phone, fullName),
    []
  );

  const handleVerifyOtp = useCallback(
    async (phone: string, otp: string) => {
      const res = await verifyOtp(phone, otp);
      if (res.success) {
        await refresh();
      }
      return { success: res.success, error: res.error };
    },
    [refresh]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      // Auth is always available via the server API; the "configured" flag now
      // reflects whether the backend session endpoint is reachable (we optimistically
      // set true — failures surface as honest error messages from the API).
      isConfigured: true,
      signIn: handleSignIn,
      signUp: handleSignUp,
      requestOtp: handleRequestOtp,
      verifyOtp: handleVerifyOtp,
      signOut: handleSignOut,
      refresh,
    }),
    [user, loading, handleSignIn, handleSignUp, handleRequestOtp, handleVerifyOtp, handleSignOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}