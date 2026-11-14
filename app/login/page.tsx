'use client';

// ==============================================================================
// SCHEMATRIX - /login Route
// Sign in / sign up. Reads an optional ?next=<path> so protected routes (e.g.
// /vault) can bounce the user back after a successful authentication.
// ==============================================================================

import React, { Suspense } from 'react';
import { SignIn } from '@/components/auth/SignIn';
import { PageShell } from '@/components/layout/PageShell';
import { Loader2 } from 'lucide-react';

export default function LoginPage(): React.ReactElement {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm font-semibold">Loading sign-in…</p>
          </div>
        }
      >
        <SignIn />
      </Suspense>
    </PageShell>
  );
}