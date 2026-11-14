'use client';

// ==============================================================================
// SCHEMATRIX - SchemeCard Component
// Accessible, responsive GovTech card with verified badges, voice read-aloud & details
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { Scheme } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  FileText,
  MapPin,
  Phone,
  Eye,
  Sparkles,
} from 'lucide-react';

interface SchemeCardProps {
  scheme: Scheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const { language, t, speak, isSpeaking, voiceAudioEnabled } = useLanguage();

  // Localized fields based on user language
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

  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `${localizedName}. ${t('category')}: ${scheme.category}. ${localizedSummary}. ${t('benefits')}: ${localizedBenefits}.`;
    speak(fullText);
  };

  return (
    <article
      tabIndex={0}
      aria-labelledby={`scheme-title-${scheme.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-amber-500/60 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
    >
      <div className="space-y-4">
        {/* Top Badges: Category & Verified Source Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {scheme.category}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('verifiedSource')}</span>
          </div>
        </div>

        {/* Scheme Name & Department */}
        <div>
          <h3
            id={`scheme-title-${scheme.id}`}
            className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug"
          >
            {localizedName}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            {scheme.department}
          </p>
        </div>

        {/* Scheme Summary */}
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-3">
          {localizedSummary}
        </p>

        {/* Benefits Highlight Box */}
        <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('benefits')}</span>
          </div>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
            {localizedBenefits}
          </p>
        </div>

        {/* Metadata Pills: State & Documents Count */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
          <span className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span>{scheme.applicableState || 'All India'}</span>
          </span>

          <span className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
            <FileText className="w-3 h-3 text-neutral-500" />
            <span>{scheme.requiredDocuments.length} {t('requiredDocs')}</span>
          </span>

          {scheme.contactHelpline && (
            <span className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
              <Phone className="w-3 h-3 text-neutral-500" />
              <span>{scheme.contactHelpline.split('/')[0].trim()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-5 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        {/* Left: View Details & Voice Read Button */}
        <div className="flex items-center gap-2">
          <Link
            href={`/schemes/${scheme.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </Link>

          {voiceAudioEnabled && (
            <button
              type="button"
              onClick={handleReadAloud}
              title={t('listenVoice')}
              aria-label={`${t('listenVoice')} ${localizedName}`}
              className="p-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Official Portal Link */}
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
        >
          <span>{t('applyNow')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
