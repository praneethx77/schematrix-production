'use client';

// ==============================================================================
// SCHEMATRIX - SchemesExplorer Component
// Complete GovTech schemes discovery with search, category filtering & modal
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Scheme } from '@/lib/types';
import { fetchSchemes, filterSchemes } from '@/lib/schemes';
import { SchemeCard } from './SchemeCard';
import { SchemeFilters } from './SchemeFilters';
import { SchemeDetailModal } from './SchemeDetailModal';
import { useLanguage } from '@/context/LanguageContext';
import {
  Compass,
  SearchX,
  RotateCcw,
  Landmark,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface SchemesExplorerProps {
  onCheckEligibility?: (scheme: Scheme) => void;
}

export function SchemesExplorer({ onCheckEligibility }: SchemesExplorerProps) {
  const { t } = useLanguage();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('All India');
  const [activeModalScheme, setActiveModalScheme] = useState<Scheme | null>(null);

  // Load schemes from Supabase or Fallback dataset
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchSchemes();
        if (isMounted) {
          setSchemes(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter schemes reactively
  const filteredSchemes = useMemo(() => {
    return filterSchemes(schemes, {
      search: searchQuery,
      category: selectedCategory,
      state: selectedState,
    });
  }, [schemes, searchQuery, selectedCategory, selectedState]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedState('All India');
  };

  return (
    <section id="schemes" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4" />
            <span>{t('schemes')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Curated Indian Welfare Schemes Directory
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Explore statutory financial assistance, health cover, housing subsidies, and employment guarantees with instant mother-tongue translation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('verifiedSource')}</span>
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-6 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/60 border-2 border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
        <SchemeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          onResetFilters={handleResetFilters}
          totalResults={filteredSchemes.length}
          totalSchemes={schemes.length}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-semibold">{t('loading')}</p>
        </div>
      ) : filteredSchemes.length > 0 ? (
        /* Scheme Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {t('noSchemesFound')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              Try adjusting your search keywords, switching categories, or clearing state filters to explore all available central and state government schemes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('resetFilters')}</span>
          </button>
        </div>
      )}

      {/* Scheme Detail Modal */}
      <SchemeDetailModal
        scheme={activeModalScheme}
        isOpen={Boolean(activeModalScheme)}
        onClose={() => setActiveModalScheme(null)}
        onCheckEligibility={onCheckEligibility}
      />
    </section>
  );
}
