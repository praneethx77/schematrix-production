'use client';

// ==============================================================================
// SCHEMATRIX - /services Route
// Public Services Directory backed by MongoDB via the server API.
// ==============================================================================

import React from 'react';
import { PublicServicesDirectory } from '@/components/PublicServicesDirectory';
import { PageShell } from '@/components/layout/PageShell';

export default function ServicesPage(): React.ReactElement {
  return (
    <PageShell>
      <PublicServicesDirectory />
    </PageShell>
  );
}