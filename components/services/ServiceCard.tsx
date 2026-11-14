'use client';

// ==============================================================================
// SCHEMATRIX - Public Service Card
// Displays service details, department, documents, steps, fee, processing time, and offline location.
// Each card shows the official portal and the date the record was last reviewed.
// ==============================================================================

import React from 'react';
import { PublicService } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  FileText,
  Building2,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  CalendarCheck,
} from 'lucide-react';

interface ServiceCardProps {
  service: PublicService;
  onSelect?: (service: PublicService) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const { t, language } = useLanguage();

  const displayName =
    language === 'hi' && service.nameHi
      ? service.nameHi
      : language === 'te' && service.nameTe
        ? service.nameTe
        : service.name;

  const displayDesc =
    language === 'hi' && service.descriptionHi
      ? service.descriptionHi
      : language === 'te' && service.descriptionTe
        ? service.descriptionTe
        : service.description;

  return (
    <article
      className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all group focus-within:ring-2 focus-within:ring-amber-500 outline-none"
      tabIndex={0}
      role="listitem"
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
              {displayName}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              {service.category}
            </p>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {service.department}
            </span>
          </div>
        </div>

        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
          {displayDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
            <FileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('requiredDocs')}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {service.requiredDocuments.length} documents
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
            <Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('processingTime')}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {service.deliveryTimeDays} {t('days')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 mb-4">
          <Phone className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('helpline')}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {service.contactHelpline || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 mb-4">
          <MapPin className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('offlineLocation')}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {service.offlineLocation || '—'}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          {service.lastReviewedAt && (
            <p className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <CalendarCheck className="w-3 h-3" aria-hidden="true" />
              {t('lastVerifiedOn')} {new Date(service.lastReviewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
          <button
            type="button"
            onClick={() => onSelect?.(service)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('viewDetails')}</span>
          </button>
        </div>
      </div>
    </article>
  );
}