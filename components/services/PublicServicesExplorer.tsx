'use client';

// ==============================================================================
// SCHEMATRIX - Public Services Directory Explorer
// Searchable directory of government services with category filters.
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { PublicService } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  fetchServices,
  filterServices,
  SERVICE_CATEGORIES,
} from '@/lib/services';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailModal } from './ServiceDetailModal';
import {
  Search,
  RotateCcw,
  Loader2,
  ShieldCheck,
  FileText,
  LayoutGrid,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  all: LayoutGrid,
  'Certificates & Identity': FileText,
  Agriculture: FileText,
  Health: ShieldCheck,
  Education: FileText,
  'Local Government': FileText,
};

export function PublicServicesExplorer(): React.ReactElement {
  const { t } = useLanguage();

  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeService, setActiveService] = useState<PublicService | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchServices();
        if (isMounted) {
          setServices(data);
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

  const filteredServices = useMemo(() => {
    return filterServices(services, {
      search: searchQuery,
      category: selectedCategory,
    });
  }, [services, searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    (selectedCategory && selectedCategory !== 'all');

  return (
    <section id="services" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            <span>{t('publicServicesDir')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Public Services Directory
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Discover and apply for government certificates, identity services, agriculture,
            healthcare, education, and local government services online or at your nearest office.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('verifiedSource')}</span>
          </span>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/60 border-2 border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchByServiceName')}
            aria-label={t('searchByServiceName')}
            className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none transition-all shadow-xs"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t('filterCategory')}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetFilters')}</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Service Categories">
            {SERVICE_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const Icon = CATEGORY_ICONS[cat.id] || FileText;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-md border-2 border-amber-600'
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

        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div>
            <span>
              {t('showingSchemes')}:{' '}
              <strong className="text-neutral-900 dark:text-white font-bold">{filteredServices.length}</strong>{' '}
              of {services.length}
            </span>
          </div>
          {filteredServices.length > 0 && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('verifiedData')}</span>
            </span>
          )}
        </div>
      </div>
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-semibold">{t('loading')}</p>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={(svc) => setActiveService(svc)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {t('noServicesFound')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              Try adjusting your search keywords or switching categories to find more government services.
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

      <ServiceDetailModal
        isOpen={Boolean(activeService)}
        onClose={() => setActiveService(null)}
        service={activeService}
      />
    </section>
  );
}