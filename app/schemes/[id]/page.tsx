// ==============================================================================
// SCHEMATRIX - Scheme Details Page
// Server-rendered details for a single verified scheme, including official
// source, last-verified date, and eligibility. Nothing is fabricated; fields not
// stated by the source are shown as "Not specified in official source".
// ==============================================================================

import { getSchemeById } from '@/lib/data-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const dash = '—';

export default async function SchemeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scheme = await getSchemeById(id);
  if (!scheme) notFound();

  const formattedIncome =
    scheme.incomeLimitAnnual === null || scheme.incomeLimitAnnual === undefined
      ? 'Not specified in official source'
      : `Rs ${scheme.incomeLimitAnnual.toLocaleString('en-IN')} per annum`;

  return (
    <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span className="w-4 h-4">←</span> Back to directory
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {scheme.name}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {scheme.department}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: summary & eligibility */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                About This Scheme
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {scheme.summary}
              </p>
              <p className="mt-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <span className="font-bold">Intended beneficiaries:</span>{' '}
                {scheme.intendedBeneficiaries}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                Eligibility Criteria
              </h2>
              <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {scheme.eligibilityCriteria.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: benefits, documents, apply */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                Benefits
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {scheme.benefits}
              </p>
              {scheme.incomeLimitAnnual !== null && scheme.incomeLimitAnnual !== undefined && (
                <p className="mt-3 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  <span className="font-bold">Annual family income limit:</span>{' '}
                  {formattedIncome}
                </p>
              )}
              {scheme.ageCriteria && (
                <p className="mt-3 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  <span className="font-bold">Age criteria:</span>{' '}
                  {scheme.ageCriteria}
                </p>
              )}
              {scheme.genderRequirement && scheme.genderRequirement !== 'any' && (
                <p className="mt-3 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  <span className="font-bold">Gender requirement:</span>{' '}
                  {scheme.genderRequirement}
                </p>
              )}
              {scheme.beneficiaryCategory && (
                <p className="mt-3 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  <span className="font-bold">Beneficiary category:</span>{' '}
                  {scheme.beneficiaryCategory}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                Required Documents
              </h2>
              <ul className="space-y-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {scheme.requiredDocuments.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-neutral-400">•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/30 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-4">
                Apply Online
              </h2>
              <a
                href={scheme.applyUrl || scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
              >
                Apply on Official Portal
                <span className="w-4 h-4">→</span>
              </a>
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                Opens the official application portal in a new tab.
              </p>
            </div>
          </div>
        </div>

        {/* Verification & source */}
        <section className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
            Source & Verification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400">Official Source</span>
              <a
                href={scheme.officialSourceUrl || scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 hover:underline"
              >
                {scheme.sourceOrganization || scheme.department}
              </a>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400">Last Verified</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                {scheme.lastVerifiedAt || 'Not specified in official source'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400">Verification Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {scheme.verificationStatus}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400">Application Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {scheme.applicationStatus || 'unconfirmed'}
              </span>
            </div>
            {scheme.academicYear && (
              <div className="space-y-1">
                <span className="text-neutral-500 dark:text-neutral-400">Academic Year</span>
                <span className="text-neutral-700 dark:text-neutral-300">{scheme.academicYear}</span>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
            Scheme details are traceable to the official source above. If anything
            appears outdated, check the official portal before applying.
          </p>
        </section>
      </div>
    </main>
  );
}
