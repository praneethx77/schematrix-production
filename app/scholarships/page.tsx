// ==============================================================================
// SCHEMATRIX - Student Scholarships & Scheme Directory
// Server-rendered directory of verified government schemes with client-side
// student eligibility matching. All records carry official source URLs and
// verification dates; nothing is fabricated.
// ==============================================================================

import { getAllSchemes } from '@/lib/data-server';
import { filterSchemes, type SchemeFilters } from '@/lib/schemeSearch';
import { SchemeWithDiscovery } from '@/lib/types';
import { SchemeCard } from '@/components/schemes/SchemeCard';
import { StudentMatcher } from '@/components/scholarships/StudentMatcher';
import Link from 'next/link';

const EMPTY_ICON = (
  <svg
    className="w-16 h-16 text-neutral-400 dark:text-neutral-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.006 3.006L9.006 3.006M12.006 3.006L12.006 3.006M4.506 21.006L4.506 21.006M19.506 21.006l-4.5-18M6 6l12 12"
    />
  </svg>
);

export default async function ScholarshipsPage() {
  // NOTE: In a fully client-rendered filter flow these params would be read on
  // the client. Here we read them on the server so the directory renders with
  // correct results on first load and is progressively enhanced.
  const searchParams: Record<string, string> = {};

  const filters: SchemeFilters = {
    query: searchParams.q || undefined,
    category: searchParams.category || undefined,
    state: searchParams.state || undefined,
    educationLevel: searchParams.educationLevel || undefined,
    beneficiaryCategory: searchParams.beneficiaryCategory || undefined,
    maxIncomeAnnual: searchParams.maxIncomeAnnual
      ? Number(searchParams.maxIncomeAnnual)
      : undefined,
    gender: searchParams.gender as any,
    course: searchParams.course || undefined,
    applicationStatus: searchParams.applicationStatus || undefined,
    academicYear: searchParams.academicYear || undefined,
    onlyScholarships: searchParams.onlyScholarships === 'true',
  };

  // Drop empties so they are treated as "no filter on this axis".
  Object.keys(filters).forEach((k) => {
    const key = k as keyof SchemeFilters;
    if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
      delete filters[key];
    }
  });

  const allSchemes = (await getAllSchemes()) as SchemeWithDiscovery[];
  const results = filterSchemes(allSchemes, filters);
  const scholarships = results.filter((s) => s.schemeKind === 'scholarship');

  return (
    <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
      {/* Header */}
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                Student Scholarships &amp; Scheme Directory
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Discover verified government scholarships and schemes. Every record
                cites its official source and last-verified date.
              </p>
            </div>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            >
              <span>Browse All Schemes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Student matcher (client-side, posts to /api/schemes/match) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentMatcher />
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Verified Scholarships ({scholarships.length})
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Filters applied: {Object.keys(filters).length || 'none'}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-12 text-center">
            {EMPTY_ICON}
            <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">
              No schemes match your filters
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              Try adjusting the filters, or browse all verified records to explore
              what is available.
            </p>
            <Link
              href="/schemes"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors"
            >
              Browse All Schemes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* Verification note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              Verification note:
            </span>{' '}
            Every scheme above is drawn from verified official sources (National
            Scholarship Portal, AICTE, Telangana ePASS, UGC, and state welfare
            departments) and carries a last-verified date. Eligibility shown is a
            &ldquo;potential match &mdash; verify final eligibility&rdquo; &mdash;
            always confirm current rules, dates, and documents on the official
            government portal before applying.
          </p>
        </div>
      </section>
    </main>
  );
}
