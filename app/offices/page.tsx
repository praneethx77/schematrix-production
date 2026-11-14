'use client';

// ==============================================================================
// SCHEMATRIX - /offices Route
// Government Office Locator with GPS/distance sorting and honest source info.
// ==============================================================================

import React from 'react';
import { GovernmentOfficeLocator } from '@/components/GovernmentOfficeLocator';
import { PageShell } from '@/components/layout/PageShell';

export default function OfficesPage(): React.ReactElement {
  return (
    <PageShell>
      <GovernmentOfficeLocator />
    </PageShell>
  );
}