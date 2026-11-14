'use client';

// ==============================================================================
// SCHEMATRIX - AssessmentResults Component
// Detailed, transparent breakdown of satisfied, unsatisfied & missing criteria
// ==============================================================================

import React, { useState } from 'react';
import { SchemeEvaluation, AssessmentResult, CitizenAnswers } from '@/lib/eligibilityEngine';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Volume2,
  VolumeX,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AssessmentResultsProps {
  evaluations: SchemeEvaluation[];
  answers: CitizenAnswers;
  onRetake: () => void;
  onModifyAnswers: () => void;
}

export function AssessmentResults({
  evaluations,
  answers,
  onRetake,
  onModifyAnswers,
}: AssessmentResultsProps) {
  const { language, t, speak, stopVoice, isSpeaking, voiceAudioEnabled } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | AssessmentResult>('all');
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // Group counts
  const eligibleCount = evaluations.filter((e) => e.result === 'appears_eligible').length;
  const notEligibleCount = evaluations.filter((e) => e.result === 'criteria_not_met').length;
  const missingInfoCount = evaluations.filter((e) => e.result === 'insufficient_information').length;

  const filteredEvaluations = evaluations.filter((e) => {
    if (activeFilter === 'all') return true;
    return e.result === activeFilter;
  });

  const toggleExpand = (schemeId: string) => {
    setExpandedSchemeId((prev) => (prev === schemeId ? null : schemeId));
  };

  const handleSpeak = (evaluation: SchemeEvaluation) => {
    const localizedName =
      language === 'hi' && evaluation.schemeNameHi
        ? evaluation.schemeNameHi
        : language === 'te' && evaluation.schemeNameTe
        ? evaluation.schemeNameTe
        : evaluation.schemeName;

    const statusText =
      evaluation.result === 'appears_eligible'
        ? t('eligible')
        : evaluation.result === 'criteria_not_met'
        ? t('notEligible')
        : t('insufficientInfo');

    const speech = `${localizedName}. ${statusText}. ${evaluation.explanation}`;
    speak(speech);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Metric Summary Counters */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Deterministic Evaluation Complete</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
              {t('assessmentResults')}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onModifyAnswers}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Modify Answers</span>
            </button>

            <button
              type="button"
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('retakeAssessment')}</span>
            </button>
          </div>
        </div>

        {/* 3 Outcome Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Appears Eligible */}
          <button
            type="button"
            onClick={() => setActiveFilter('appears_eligible')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              activeFilter === 'appears_eligible'
                ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{t('appearsEligibleCount')}</span>
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {eligibleCount}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Meets statutory criteria based on your answers.
            </p>
          </button>

          {/* Criteria Not Met */}
          <button
            type="button"
            onClick={() => setActiveFilter('criteria_not_met')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              activeFilter === 'criteria_not_met'
                ? 'bg-red-500/10 border-red-500 ring-2 ring-red-500/30'
                : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 hover:border-red-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>{t('criteriaNotMetCount')}</span>
              </span>
              <span className="text-2xl font-black text-red-700 dark:text-red-400">
                {notEligibleCount}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Excluded by land, income, or employment restrictions.
            </p>
          </button>

          {/* More Information Needed */}
          <button
            type="button"
            onClick={() => setActiveFilter('insufficient_information')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              activeFilter === 'insufficient_information'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{t('moreInfoCount')}</span>
              </span>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                {missingInfoCount}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Requires physical survey or unprovided details.
            </p>
          </button>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t('assessmentDisclaimer')}
          </p>
        </div>
      </div>

      {/* 2. Filter Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
            }`}
          >
            All Evaluated Schemes ({evaluations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('appears_eligible')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'appears_eligible'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
            }`}
          >
            {t('appearsEligibleCount')} ({eligibleCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('criteria_not_met')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'criteria_not_met'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50'
            }`}
          >
            {t('criteriaNotMetCount')} ({notEligibleCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('insufficient_information')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'insufficient_information'
                ? 'bg-amber-500 text-neutral-950 font-black'
                : 'bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-50'
            }`}
          >
            {t('moreInfoCount')} ({missingInfoCount})
          </button>
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Showing {filteredEvaluations.length} of {evaluations.length} schemes
        </span>
      </div>

      {/* 3. Detailed Results List */}
      <div className="space-y-4">
        {filteredEvaluations.map((item) => {
          const isExpanded = expandedSchemeId === item.schemeId;
          const localizedName =
            language === 'hi' && item.schemeNameHi
              ? item.schemeNameHi
              : language === 'te' && item.schemeNameTe
              ? item.schemeNameTe
              : item.schemeName;

          const isEligible = item.result === 'appears_eligible';
          const isNotEligible = item.result === 'criteria_not_met';
          const isMissing = item.result === 'insufficient_information';

          return (
            <article
              key={item.schemeId}
              className={`rounded-2xl bg-white dark:bg-neutral-900 border-2 transition-all shadow-xs ${
                isEligible
                  ? 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500'
                  : isNotEligible
                  ? 'border-red-200 dark:border-red-900/60 hover:border-red-500'
                  : 'border-amber-200 dark:border-amber-900/60 hover:border-amber-500'
              }`}
            >
              {/* Card Header & Summary */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-md text-neutral-700 dark:text-neutral-300">
                        {item.category}
                      </span>

                      {/* Status Badge */}
                      {isEligible && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{t('eligible')}</span>
                        </span>
                      )}

                      {isNotEligible && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                          <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          <span>{t('notEligible')}</span>
                        </span>
                      )}

                      {isMissing && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{t('insufficientInfo')}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white pt-1">
                      {localizedName}
                    </h4>
                  </div>

                  {/* Audio Readout & Expand Button */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {voiceAudioEnabled && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(item)}
                        title={t('listenVoice')}
                        className="p-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-500" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(item.schemeId)}
                      aria-expanded={isExpanded}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
                    >
                      <span>{isExpanded ? 'Hide Breakdown' : 'View Criteria Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Explanation Banner */}
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
                  {item.explanation}
                </p>
              </div>

              {/* Collapsible Detailed Breakdown */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-5 animate-in slide-in-from-top-2 duration-150 text-xs">
                  {/* Satisfied Criteria */}
                  {item.criteriaSatisfied.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('criteriaSatisfied')} ({item.criteriaSatisfied.length})</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {item.criteriaSatisfied.map((crit, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-neutral-800 dark:text-neutral-200 border border-emerald-200 dark:border-emerald-800/40"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Failed Criteria */}
                  {item.criteriaNotSatisfied.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>{t('criteriaNotSatisfied')} ({item.criteriaNotSatisfied.length})</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {item.criteriaNotSatisfied.map((crit, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-red-50/60 dark:bg-red-950/20 text-neutral-800 dark:text-neutral-200 border border-red-200 dark:border-red-800/40"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Criteria */}
                  {item.missingInformation.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{t('missingInfoNotice')} ({item.missingInformation.length})</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {item.missingInformation.map((infoItem, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-neutral-800 dark:text-neutral-200 border border-amber-200 dark:border-amber-800/40"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <span>{infoItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Documents */}
                  <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <h5 className="font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>{t('requiredDocs')}</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.requiredDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-medium text-neutral-800 dark:text-neutral-200"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Portal Link */}
                  <div className="pt-2 flex justify-end">
                    <a
                      href={item.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-xs"
                    >
                      <span>{t('applyNow')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
