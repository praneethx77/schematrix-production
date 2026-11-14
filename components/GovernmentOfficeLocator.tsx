'use client';

// ==============================================================================
// SCHEMATRIX - Government Office Locator (root entry point)
// Delegates to the full-featured GovernmentOfficeLocator implementation which
// provides category/state/district/mandal/village filters, browser geolocation,
// manual location selection, distance calculation, and map links, backed by
// MongoDB via the server API. Only traceable, source-verified offices are shown.
// ==============================================================================

import React from 'react';
import { GovernmentOfficeLocator as OfficeLocatorImpl } from './offices/GovernmentOfficeLocator';

export function GovernmentOfficeLocator(): React.ReactElement {
  return <OfficeLocatorImpl />;
}

export default GovernmentOfficeLocator;