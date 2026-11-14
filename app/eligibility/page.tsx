'use client';

// ==============================================================================
// SCHEMATRIX - /eligibility Route
// Deterministic Eligibility Assessment Engine. Reads an optional ?scheme=<id>
// query parameter (set by the schemes discovery page) to preselect a scheme.
// ==============================================================================

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EligibilitySection } from '@/components/eligibility/EligibilitySection';
import { PageShell } from '@/components/layout/PageShell';
import { Loader2 } from 'lucide-react';

function EligibilityContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const preselectedSchemeId = searchParams.get('scheme') || null;

  return (
    <EligibilitySection
      preselectedSchemeId={preselectedSchemeId}
      onClearPreselectedScheme={undefined}
    />
  );
}

export default function EligibilityPage(): React.ReactElement {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm font-semibold">Loading eligibility engine…</p>
          </div>
        }
      >
        <EligibilityContent />
      </Suspense>
    </PageShell>
  );
}