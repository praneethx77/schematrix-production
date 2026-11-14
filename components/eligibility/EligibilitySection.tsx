'use client';

// ==============================================================================
// SCHEMATRIX - EligibilitySection Component
// Main container hosting the interactive questionnaire & deterministic results
// ==============================================================================

import React, { useState } from 'react';
import { CitizenAnswers, SchemeEvaluation, evaluateAllSchemes, evaluateScheme, saveAssessmentRecord } from '@/lib/eligibilityEngine';
import { EligibilityWizard } from './EligibilityWizard';
import { AssessmentResults } from './AssessmentResults';
import { useLanguage } from '@/context/LanguageContext';
import {
  FileCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sliders,
  HelpCircle,
  Landmark,
} from 'lucide-react';

interface EligibilitySectionProps {
  preselectedSchemeId?: string | null;
  onClearPreselectedScheme?: () => void;
}

export function EligibilitySection({
  preselectedSchemeId,
  onClearPreselectedScheme,
}: EligibilitySectionProps) {
  const { t } = useLanguage();
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<SchemeEvaluation[] | null>(null);
  const [lastAnswers, setLastAnswers] = useState<CitizenAnswers | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Trigger evaluation
  const handleRunEvaluation = async (answers: CitizenAnswers) => {
    setLastAnswers(answers);
    setIsSaving(true);

    try {
      let results: SchemeEvaluation[];
      if (preselectedSchemeId) {
        // Evaluate preselected scheme + other schemes for context
        const singleEval = evaluateScheme(preselectedSchemeId, answers);
        const allEvals = evaluateAllSchemes(answers).filter((e) => e.schemeId !== preselectedSchemeId);
        results = [singleEval, ...allEvals];
      } else {
        results = evaluateAllSchemes(answers);
      }

      setEvaluations(results);
      setIsWizardActive(false);

      // Save to Supabase or demo storage
      for (const res of results) {
        await saveAssessmentRecord(res, answers);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setEvaluations(null);
    setIsWizardActive(true);
    if (onClearPreselectedScheme) onClearPreselectedScheme();
  };

  const handleModifyAnswers = () => {
    setIsWizardActive(true);
  };

  return (
    <section id="checker" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            <FileCheck className="w-4 h-4" />
            <span>{t('checker')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Deterministic Eligibility Assessment Engine
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            100% rule-based evaluation. Sourced directly from official government gazettes with zero AI hallucination or probability guesswork.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Rule Version 2024.1</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Container */}
      {!isWizardActive && !evaluations && (
        /* Welcome / Start Evaluation Banner */
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 dark:from-amber-950/20 dark:via-neutral-900 dark:to-emerald-950/20 border-2 border-neutral-200 dark:border-neutral-800 shadow-md">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Citizen Assessment</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-snug">
              Check Your Family’s Legal Entitlements Across 6 Major Central Welfare Schemes
            </h3>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Answer simple questions regarding age, landholding, housing condition, and occupation to receive an immediate deterministic evaluation: <strong className="text-emerald-600 dark:text-emerald-400">Appears Eligible</strong>, <strong className="text-red-600 dark:text-red-400">Criteria Not Met</strong>, or <strong className="text-amber-600 dark:text-amber-400">More Information Needed</strong>.
            </p>

            {/* Checklist of Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Deterministic rules (No AI hallucination)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Covers PM-KISAN, Ayushman Bharat, PMAY-G & more</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Detailed checklists of required documents</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Available in English, हिन्दी, and తెలుగు</span>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsWizardActive(true)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Eligibility Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Wizard View */}
      {isWizardActive && (
        <EligibilityWizard
          initialAnswers={lastAnswers || {}}
          targetSchemeId={preselectedSchemeId || undefined}
          onSubmit={handleRunEvaluation}
          onCancel={evaluations ? () => setIsWizardActive(false) : undefined}
        />
      )}

      {/* Assessment Results View */}
      {!isWizardActive && evaluations && lastAnswers && (
        <AssessmentResults
          evaluations={evaluations}
          answers={lastAnswers}
          onRetake={handleRetake}
          onModifyAnswers={handleModifyAnswers}
        />
      )}
    </section>
  );
}
