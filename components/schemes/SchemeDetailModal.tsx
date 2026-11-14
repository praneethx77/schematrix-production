'use client';

// ==============================================================================
// SCHEMATRIX - SchemeDetailModal Component
// Accessible comprehensive scheme details view with verified criteria & audio readout
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import { Scheme } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  FileText,
  MapPin,
  Phone,
  Landmark,
  Calendar,
  Sparkles,
  Info,
  Users,
  Compass,
} from 'lucide-react';

interface SchemeDetailModalProps {
  scheme: Scheme | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckEligibility?: (scheme: Scheme) => void;
}

export function SchemeDetailModal({ scheme, isOpen, onClose, onCheckEligibility }: SchemeDetailModalProps) {
  const { language, t, speak, stopVoice, isSpeaking, voiceAudioEnabled } = useLanguage();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus close button on open
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !scheme) return null;

  const localizedName =
    language === 'hi' && scheme.nameHi
      ? scheme.nameHi
      : language === 'te' && scheme.nameTe
      ? scheme.nameTe
      : scheme.name;

  const localizedSummary =
    language === 'hi' && scheme.summaryHi
      ? scheme.summaryHi
      : language === 'te' && scheme.summaryTe
      ? scheme.summaryTe
      : scheme.summary;

  const localizedBenefits =
    language === 'hi' && scheme.benefitsHi
      ? scheme.benefitsHi
      : language === 'te' && scheme.benefitsTe
      ? scheme.benefitsTe
      : scheme.benefits;

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
      return;
    }

    const fullSpeech = `${localizedName}. ${t('department')}: ${scheme.department}. ${localizedSummary}. ${t('benefits')}: ${localizedBenefits}. ${t('intendedBeneficiaries')}: ${scheme.intendedBeneficiaries}. ${t('applicationMethod')}: ${scheme.applicationMethod}.`;
    speak(fullSpeech);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-scheme-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <div className="space-y-2 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                {scheme.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('verifiedSource')}</span>
              </span>
            </div>

            <h2 id="modal-scheme-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
              {localizedName}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 font-medium">
              <Landmark className="w-3.5 h-3.5 text-neutral-500" />
              <span>{scheme.department}</span>
            </p>
          </div>

          {/* Close Button */}
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

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* Audio Read-Aloud & Verified Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20">
            <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 font-medium">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{t('officialNotice')}: {scheme.rulesVersion ? `Version ${scheme.rulesVersion}` : 'Official Guidelines'}</span>
            </div>

            {voiceAudioEnabled && (
              <button
                type="button"
                onClick={handleReadAloud}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSpeaking
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? t('stopVoice') : t('listenVoice')}</span>
              </button>
            )}
          </div>

          {/* Scheme Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Overview
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {localizedSummary}
            </p>
          </div>

          {/* Key Benefits */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('benefits')}</span>
            </div>
            <p className="text-neutral-800 dark:text-neutral-200 font-semibold leading-relaxed">
              {localizedBenefits}
            </p>
          </div>

          {/* Intended Beneficiaries */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Users className="w-4 h-4 text-neutral-500" />
              <span>{t('intendedBeneficiaries')}</span>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
              {scheme.intendedBeneficiaries}
            </p>
          </div>

          {/* Detailed Eligibility Criteria */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>{t('eligibilityCriteria')}</span>
            </div>
            <ul className="space-y-2.5">
              {scheme.eligibilityCriteria.map((criteria, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Documents Checklist */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span>{t('requiredDocs')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scheme.requiredDocuments.map((doc, idx) => (
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

          {/* How to Apply */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Compass className="w-4 h-4 text-neutral-500" />
              <span>{t('applicationMethod')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {scheme.applicationMethod}
            </div>
          </div>

          {/* Official Source & Helpline Metadata */}
          <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {t('sourceReferences')}:
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 italic">
                {scheme.sourceReferences}
              </span>
            </div>

            {scheme.contactHelpline && (
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold">{t('helpline')}:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {scheme.contactHelpline}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            {t('close')}
          </button>

          <div className="flex items-center gap-2">
            <a
              href={scheme.officialUrl}
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
    </div>
  );
}
