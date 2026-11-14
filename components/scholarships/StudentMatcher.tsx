// ==============================================================================
// SCHEMATRIX - Student Scholarship Matcher (client component)
// Collects only non-sensitive details a student volunteers, calls
// POST /api/schemes/match, and renders potential matches. Never asks for or
// stores Aadhaar, bank account, or other identifying documents.
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SchemeWithDiscovery } from '@/lib/types';
import { SchemeCard } from '@/components/schemes/SchemeCard';

interface FormData {
  state: string;
  district: string;
  educationLevel: string;
  course: string;
  academicYear: string;
  annualFamilyIncome: string;
  category: string;
  gender: string;
  age: string;
}

const EDUCATION_OPTIONS = [
  { value: '', label: 'Select education level' },
  { value: 'school', label: 'School (Class 9-12)' },
  { value: 'intermediate', label: 'Intermediate / Class 12' },
  { value: 'diploma', label: 'Diploma / Polytechnic' },
  { value: 'undergraduate', label: 'Undergraduate (B.Tech, B.A, B.Sc, B.Com)' },
  { value: 'postgraduate', label: 'Postgraduate (M.Tech, M.A, M.Sc, MBA)' },
  { value: 'technical', label: 'Technical / Engineering' },
];

const GENDER_OPTIONS = [
  { value: 'any', label: 'Prefer not to say / Any' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Category (optional)' },
  { value: 'SC', label: 'Scheduled Caste (SC)' },
  { value: 'ST', label: 'Scheduled Tribe (ST)' },
  { value: 'OBC', label: 'Other Backward Class (OBC)' },
  { value: 'EBC', label: 'Economically Backward Class (EBC)' },
  { value: 'Minority', label: 'Minority community' },
  { value: 'Disability', label: 'Person with disability' },
];

export function StudentMatcher() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormData>({
    state: '',
    district: '',
    educationLevel: '',
    course: '',
    academicYear: '',
    annualFamilyIncome: '',
    category: '',
    gender: 'any',
    age: '',
  });
  const [matches, setMatches] = useState<SchemeWithDiscovery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/schemes/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: form.state || undefined,
          district: form.district || undefined,
          educationLevel: form.educationLevel || undefined,
          course: form.course || undefined,
          academicYear: form.academicYear || undefined,
          annualFamilyIncome:
            form.annualFamilyIncome === '' ? undefined : Number(form.annualFamilyIncome),
          category: form.category || undefined,
          gender: form.gender || 'any',
          age: form.age === '' ? undefined : Number(form.age),
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch matches');
      const data = await res.json();
      setMatches((data.matches || []).map((m: any) => m.scheme || m));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matching failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
            Find Scholarships for You
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            We only ask for details needed to match scholarships. We never ask for
            Aadhaar, bank account, or other identifying documents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              State
            </label>
            <input
              name="state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="e.g. Telangana"
              className="input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Education Level
            </label>
            <select
              name="educationLevel"
              value={form.educationLevel}
              onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
              className="input"
            >
              {EDUCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Course / Qualification
            </label>
            <input
              name="course"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              placeholder="e.g. B.Tech"
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Annual Family Income (Rs)
            </label>
            <input
              name="annualFamilyIncome"
              type="number"
              value={form.annualFamilyIncome}
              onChange={(e) => setForm({ ...form, annualFamilyIncome: e.target.value })}
              placeholder="600000"
              className="input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Category (optional)
            </label>
            <select
              name="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="input"
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Age
            </label>
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="20"
              className="input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
        >
          {loading ? 'Finding Matches...' : 'Find Matching Scholarships'}
        </button>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {matches.length > 0 && (
          <section className="mt-8">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
              Potential Matches ({matches.length})
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Potential match &mdash; verify final eligibility on the official
              portal before applying.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </section>
        )}
      </form>
    </section>
  );
}
