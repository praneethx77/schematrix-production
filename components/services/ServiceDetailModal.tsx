'use client';

// ==============================================================================
// SCHEMATRIX - Public Service Detail Modal
// Accessible full service details: description, eligibility, documents, steps,
// fee, processing time, offline location, helpline, and official portal link.
// Each record shows the official portal and its last-reviewed date.
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import { PublicService } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  Phone,
  Landmark,
  Clock,
  Compass,
  CalendarCheck,
  ListOrdered,
  IndianRupee,
} from 'lucide-react';

interface ServiceDetailModalProps {
  service: PublicService | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  const { language, t } = useLanguage();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const localizedName =
    language === 'hi' && service.nameHi
      ? service.nameHi
      : language === 'te' && service.nameTe
        ? service.nameTe
        : service.name;

  const localizedDesc =
    language === 'hi' && service.descriptionHi
      ? service.descriptionHi
      : language === 'te' && service.descriptionTe
        ? service.descriptionTe
        : service.description;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <div className="space-y-2 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                {service.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('verifiedSource')}</span>
              </span>
            </div>
            <h2 id="modal-service-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
              {localizedName}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 font-medium">
              <Landmark className="w-3.5 h-3.5 text-neutral-500" />
              <span>{service.department}</span>
            </p>
            {service.lastReviewedAt && (
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                {t('lastVerifiedOn')}{' '}
                {new Date(service.lastReviewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t('description')}
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{localizedDesc}</p>
          </div>

          {/* Target audience & eligibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5" />
                {t('intendedBeneficiaries')}
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">{service.targetAudience}</p>
            </div>
            {service.eligibilitySummary && (
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  {t('eligibilityCriteria')}
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300">{service.eligibilitySummary}</p>
              </div>
            )}
          </div>

          {/* Required Documents */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-500" />
              {t('requiredDocs')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {service.requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-neutral-500" />
              {t('applicationMethod')}
            </h3>
            <ul className="space-y-2.5">
              {service.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Meta: fee, processing time, offline location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <IndianRupee className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('applicationFee')}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {service.applicationFee || t('freeService')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
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
            <div className="flex items-start gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <Phone className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('helpline')}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{service.contactHelpline || '—'}</p>
              </div>
            </div>
          </div>

          {/* Offline location */}
          {service.offlineLocation && (
            <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <MapPin className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('offlineLocation')}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{service.offlineLocation}</p>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {t('servicesDisclaimerNote')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            {t('close')}
          </button>
          <a
            href={service.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
          >
            <span>{t('applyNow')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}