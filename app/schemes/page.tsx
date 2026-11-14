'use client';

// ==============================================================================
// SCHEMATRIX - /schemes Route
// Full schemes discovery engine. Selecting "Check eligibility" on a card routes
// to /eligibility?scheme=<id> instead of an in-page scroll.
// ==============================================================================

import React from 'react';
import { useRouter } from 'next/navigation';
import { SchemesExplorer } from '@/components/schemes/SchemesExplorer';
import { PageShell } from '@/components/layout/PageShell';
import { Scheme } from '@/lib/types';

export default function SchemesPage(): React.ReactElement {
  const router = useRouter();

  const handleCheckEligibility = (scheme: Scheme) => {
    router.push(`/eligibility?scheme=${encodeURIComponent(scheme.id)}`);
  };

  return (
    <PageShell>
      <SchemesExplorer onCheckEligibility={handleCheckEligibility} />
    </PageShell>
  );
}