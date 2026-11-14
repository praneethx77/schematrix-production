'use client';

// ==============================================================================
// SCHEMATRIX - Shared Page Shell
// Consistent <main id="main-content"> wrapper used by every route so the
// accessibility skip-link (in GovTechNavbar) always resolves to a valid target.
// ==============================================================================

import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps): React.ReactElement {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`flex-1 flex flex-col focus:outline-none ${className ?? ''}`}
    >
      {children}
    </main>
  );
}

export default PageShell;