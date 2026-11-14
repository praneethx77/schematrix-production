'use client';

// ==============================================================================
// SCHEMATRIX - /vault Route
// Protected Document Vault. Unauthenticated visitors are redirected to /login;
// the vault itself only lists documents for the signed-in user.
// ==============================================================================

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentVault } from '@/components/vault/DocumentVault';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock } from 'lucide-react';

export default function VaultPage(): React.ReactElement {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/vault');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <PageShell>
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-semibold">Checking your session…</p>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Lock className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-semibold">Redirecting to sign in…</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <DocumentVault />
    </PageShell>
  );
}