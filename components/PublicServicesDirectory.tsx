'use client';

// ==============================================================================
// SCHEMATRIX - Public Services Directory (root entry point)
// Delegates to the full-featured PublicServicesExplorer implementation which
// provides search, category filters, and accessible service detail views backed
// by MongoDB via the server API.
// ==============================================================================

import React from 'react';
import { PublicServicesExplorer } from './services/PublicServicesExplorer';

export function PublicServicesDirectory(): React.ReactElement {
  return <PublicServicesExplorer />;
}

export default PublicServicesDirectory;