'use client';

// ==============================================================================
// SCHEMATRIX - SchemeFilters Component
// Real-time search, category tabs, state filters, and active filter counters
// ==============================================================================

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES, STATES } from '@/lib/schemes';
import {
  Search,
  X,
  Filter,
  MapPin,
  Sparkles,
  Tractor,
  HeartPulse,
  Home,
  Briefcase,
  ShoppingBag,
  Baby,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface SchemeFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  onResetFilters: () => void;
  totalResults: number;
  totalSchemes: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: Layers,
  Agriculture: Tractor,
  Health: HeartPulse,
  Housing: Home,
  Employment: Briefcase,
  'Food Security': ShoppingBag,
  'Women & Child': Baby,
};

export function SchemeFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedState,
  onStateChange,
  onResetFilters,
  totalResults,
  totalSchemes,
}: SchemeFiltersProps) {
  const { t } = useLanguage();

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedState && selectedState !== 'All India');

  return (
    <div className="space-y-6">
      {/* 1. Search Bar & State Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Real-Time Multilingual Search Input */}
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('quickSearchPlaceholder')}
            aria-label={t('quickSearchPlaceholder')}
            className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none transition-all shadow-xs"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={t('clearSearch')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* State Filter Dropdown */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <MapPin className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>

          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            aria-label={t('filterByState')}
            className="w-full pl-10 pr-8 py-3.5 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm font-semibold text-neutral-900 dark:text-white appearance-none focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none transition-all shadow-xs cursor-pointer"
          >
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state === 'All India' ? t('allStates') : state}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
            <Filter className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Responsive Category Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {t('filterCategory')}
          </span>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetFilters')}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Scheme Categories">
          {CATEGORY_ICONS &&
            CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Layers;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-md scale-102 border-2 border-amber-600'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-2 border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-neutral-950' : 'text-neutral-500'}`} />
                  <span>{t(cat.labelKey)}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* 3. Result Status Counter */}
      <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <div>
          <span>
            {t('showingSchemes')}:{' '}
            <strong className="text-neutral-900 dark:text-white font-bold">{totalResults}</strong> of {totalSchemes}
          </span>
          {selectedCategory !== 'all' && (
            <span className="ml-2 font-normal">
              in <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedCategory}</span>
            </span>
          )}
          {selectedState !== 'All India' && (
            <span className="ml-2 font-normal">
              for <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedState}</span>
            </span>
          )}
        </div>

        {totalResults > 0 && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Official Guidelines</span>
          </span>
        )}
      </div>
    </div>
  );
}
