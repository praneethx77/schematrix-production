'use client';

// ==============================================================================
// SCHEMATRIX - /sahayak Route
// AI Sahayak assistant (live Gemini when configured, else the built-in dataset).
// ==============================================================================

import React from 'react';
import { AiSahayak } from '@/components/sahayak/AiSahayak';
import { PageShell } from '@/components/layout/PageShell';

export default function SahayakPage(): React.ReactElement {
  return (
    <PageShell>
      <AiSahayak />
    </PageShell>
  );
}