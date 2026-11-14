'use client';

// ==============================================================================
// SCHEMATRIX - EligibilityWizard Component
// Step-by-step questionnaire with dynamic conditional logic and form validation
// ==============================================================================

import React, { useState } from 'react';
import { CitizenAnswers } from '@/lib/eligibilityEngine';
import { useLanguage } from '@/context/LanguageContext';
import { STATES } from '@/lib/schemes';
import {
  FileCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Briefcase,
  Home,
  ShieldAlert,
  Sliders,
  RotateCcw,
  Check,
} from 'lucide-react';

interface EligibilityWizardProps {
  initialAnswers?: CitizenAnswers;
  targetSchemeId?: string;
  onSubmit: (answers: CitizenAnswers) => void;
  onCancel?: () => void;
}

export function EligibilityWizard({
  initialAnswers = {},
  targetSchemeId,
  onSubmit,
  onCancel,
}: EligibilityWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<CitizenAnswers>({
    age: 42,
    gender: 'female',
    state: 'Telangana',
    district: 'Warangal',
    areaType: 'rural',
    occupation: 'farmer',
    isFarmer: true,
    ownsCultivableLand: true,
    landHoldingAcres: 2.5,
    isInstitutionalLandholder: false,
    annualFamilyIncome: 95000,
    ownsPuccaHouse: false,
    livesInKutchaHouse: true,
    hasLpgConnectionInHousehold: false,
    rationCardCategory: 'bpl_priority',
    isSeniorCitizen70PlusInFamily: false,
    isCoveredByGovtEmployeeHealthInsurance: false,
    isGovtEmployeeOrPensionerInFamily: false,
    paysIncomeTax: false,
    ownsMotorizedFourWheelerOrTractor: false,
    hasAadhaarLinkedBankDbt: true,
    willingForUnskilledManualWork: true,
    ...initialAnswers,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const updateAnswer = <K extends keyof CitizenAnswers>(key: K, value: CitizenAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  // Validation before advancing
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!answers.age || answers.age < 1 || answers.age > 120) {
        setValidationError('Please enter a valid age between 1 and 120.');
        return false;
      }
      if (!answers.areaType) {
        setValidationError('Please specify if you reside in a rural or urban area.');
        return false;
      }
    }

    if (step === 2) {
      if (answers.annualFamilyIncome === undefined || answers.annualFamilyIncome < 0) {
        setValidationError('Please enter an estimated annual family income.');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = () => {
    onSubmit(answers);
  };

  const handleFillDemoProfile = () => {
    setAnswers({
      age: 42,
      gender: 'female',
      state: 'Telangana',
      district: 'Warangal',
      areaType: 'rural',
      occupation: 'farmer',
      isFarmer: true,
      ownsCultivableLand: true,
      landHoldingAcres: 2.5,
      isInstitutionalLandholder: false,
      annualFamilyIncome: 95000,
      ownsPuccaHouse: false,
      livesInKutchaHouse: true,
      hasLpgConnectionInHousehold: false,
      rationCardCategory: 'bpl_priority',
      isSeniorCitizen70PlusInFamily: false,
      isCoveredByGovtEmployeeHealthInsurance: false,
      isGovtEmployeeOrPensionerInFamily: false,
      paysIncomeTax: false,
      ownsMotorizedFourWheelerOrTractor: false,
      hasAadhaarLinkedBankDbt: true,
      willingForUnskilledManualWork: true,
    });
    setValidationError(null);
  };

  const stepTitles = [
    { num: 1, title: t('stepDemographics'), icon: MapPin },
    { num: 2, title: t('stepOccupation'), icon: Briefcase },
    { num: 3, title: t('stepHousing'), icon: Home },
    { num: 4, title: t('stepExclusions'), icon: ShieldAlert },
    { num: 5, title: t('stepReview'), icon: FileCheck },
  ];

  return (
    <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-xl space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Pre-fill Demo Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Deterministic Assessment Wizard</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            {targetSchemeId ? `Target Scheme: ${targetSchemeId.toUpperCase()}` : t('evaluateAllSchemes')}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleFillDemoProfile}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
        >
          ⚡ Load Sample Rural Citizen Profile
        </button>
      </div>

      {/* 2. Step Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
          <span>Step {currentStep} of 5</span>
          <span className="text-amber-600 dark:text-amber-400 font-extrabold">{currentStep * 20}% Completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
            style={{ width: `${currentStep * 20}%` }}
          />
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-5 gap-1.5 pt-2 hidden md:grid">
          {stepTitles.map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-bold text-left transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    : isDone
                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    : 'text-neutral-400 opacity-60'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-black ${
                  isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-200 dark:bg-neutral-700'
                }`}>
                  {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.num}
                </span>
                <span className="truncate">{s.title.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {validationError && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 3. Dynamic Step Form Content */}
      <div className="space-y-6">
        {/* STEP 1: Demographics & Location */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{t('stepDemographics')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Applicant Age (Years) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={answers.age || ''}
                  onChange={(e) => updateAnswer('age', parseInt(e.target.value) || undefined)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold outline-none focus-visible:border-amber-500"
                  placeholder="e.g. 42"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Applicant Gender (Required for Women Schemes like PM Ujjwala)
                </label>
                <select
                  value={answers.gender || 'female'}
                  onChange={(e) => updateAnswer('gender', e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold outline-none focus-visible:border-amber-500 cursor-pointer"
                >
                  <option value="female">Female (Women Head / Member)</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  State of Residence *
                </label>
                <select
                  value={answers.state || 'Telangana'}
                  onChange={(e) => updateAnswer('state', e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold outline-none focus-visible:border-amber-500 cursor-pointer"
                >
                  {STATES.filter((s) => s !== 'All India').map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Type (Rural / Urban) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Residential Area Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateAnswer('areaType', 'rural')}
                    className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      answers.areaType === 'rural'
                        ? 'bg-amber-500 text-neutral-950 border-amber-600 shadow-sm'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    Rural (Gram Panchayat)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAnswer('areaType', 'urban')}
                    className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      answers.areaType === 'urban'
                        ? 'bg-amber-500 text-neutral-950 border-amber-600 shadow-sm'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    Urban (Municipality)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Occupation & Landholding */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              <span>{t('stepOccupation')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Occupation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Primary Household Occupation *
                </label>
                <select
                  value={answers.occupation || 'farmer'}
                  onChange={(e) => {
                    const occ = e.target.value as any;
                    updateAnswer('occupation', occ);
                    if (occ === 'farmer') updateAnswer('isFarmer', true);
                  }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold outline-none focus-visible:border-amber-500 cursor-pointer"
                >
                  <option value="farmer">Farmer / Agricultural Cultivator</option>
                  <option value="laborer">Agricultural or Construction Laborer</option>
                  <option value="artisan">Artisan / Weaver / Rural Tradesperson</option>
                  <option value="self_employed">Small Shopkeeper / Self-employed</option>
                  <option value="salaried">Private Salaried Employee</option>
                  <option value="senior">Senior Citizen / Homemaker</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              {/* Annual Income */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Annual Family Income (₹) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={answers.annualFamilyIncome ?? ''}
                  onChange={(e) => updateAnswer('annualFamilyIncome', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold outline-none focus-visible:border-amber-500"
                  placeholder="e.g. 95000"
                />
                <span className="text-[11px] text-neutral-500">
                  Used to evaluate BPL / priority thresholds for NFSA, Ayushman Bharat & PMAY.
                </span>
              </div>
            </div>

            {/* Farmer & Cultivable Land Check */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                  <span>Do you or your family own cultivable agricultural land with official revenue records (Patta/RoR/Pahani)?</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">(PM-KISAN Core Criterion)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateAnswer('ownsCultivableLand', true);
                      updateAnswer('isFarmer', true);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      answers.ownsCultivableLand === true
                        ? 'bg-amber-500 text-neutral-950 border-amber-600'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    Yes (Own Cultivable Land)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAnswer('ownsCultivableLand', false)}
                    className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      answers.ownsCultivableLand === false
                        ? 'bg-amber-500 text-neutral-950 border-amber-600'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    No (Landless / Non-Agricultural)
                  </button>
                </div>
              </div>

              {answers.ownsCultivableLand && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Approximate Land Extent (Acres)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0.1}
                      value={answers.landHoldingAcres || ''}
                      onChange={(e) => updateAnswer('landHoldingAcres', parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                      placeholder="e.g. 2.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Is this land held by an institution, trust, or temple?
                    </label>
                    <select
                      value={answers.isInstitutionalLandholder ? 'yes' : 'no'}
                      onChange={(e) => updateAnswer('isInstitutionalLandholder', e.target.value === 'yes')}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold cursor-pointer"
                    >
                      <option value="no">No — Individual / Family Owned</option>
                      <option value="yes">Yes — Institutional Landholder (Excluded from PM-KISAN)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Housing & Household Amenities */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-500" />
              <span>{t('stepHousing')}</span>
            </h4>

            {/* Pucca House Check */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Do you or any household member own a pucca (concrete/brick) house anywhere in India?</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">(PMAY-G Exclusion)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateAnswer('ownsPuccaHouse', true);
                    updateAnswer('livesInKutchaHouse', false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.ownsPuccaHouse === true
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (Own Pucca House)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateAnswer('ownsPuccaHouse', false);
                    updateAnswer('livesInKutchaHouse', true);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.ownsPuccaHouse === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No (Homeless or Living in Kutcha House)
                </button>
              </div>
            </div>

            {/* Ration Card Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Current Ration Card Category
              </label>
              <select
                value={answers.rationCardCategory || 'bpl_priority'}
                onChange={(e) => updateAnswer('rationCardCategory', e.target.value as any)}
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold outline-none focus-visible:border-amber-500 cursor-pointer"
              >
                <option value="antyodaya_aay">Antyodaya Anna Yojana (AAY - Poorest of the Poor)</option>
                <option value="bpl_priority">Priority Household (PHH / BPL White Card)</option>
                <option value="apl">APL / Non-Priority (Pink Card)</option>
                <option value="none">No Ration Card currently held</option>
              </select>
            </div>

            {/* Domestic LPG Connection Check */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Does any member of your household have an active domestic LPG cylinder connection?</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">(PM Ujjwala Exclusion)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateAnswer('hasLpgConnectionInHousehold', true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.hasLpgConnectionInHousehold === true
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (Already have Gas Connection)
                </button>
                <button
                  type="button"
                  onClick={() => updateAnswer('hasLpgConnectionInHousehold', false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.hasLpgConnectionInHousehold === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No (Deposit-Free LPG Needed)
                </button>
              </div>
            </div>

            {/* Senior 70+ in family */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Is there any member in your family aged 70 years or above?</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">(Ayushman Vaya Vandana)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateAnswer('isSeniorCitizen70PlusInFamily', true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.isSeniorCitizen70PlusInFamily === true
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (Aged 70+)
                </button>
                <button
                  type="button"
                  onClick={() => updateAnswer('isSeniorCitizen70PlusInFamily', false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.isSeniorCitizen70PlusInFamily === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Institutional Exclusions & DBT Verification */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{t('stepExclusions')}</span>
            </h4>

            {/* Income Tax Payer Exclusion */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Did you or your spouse pay Income Tax in the previous assessment year?</span>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">(Statutory Exclusion)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateAnswer('paysIncomeTax', true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.paysIncomeTax === true
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (Income Tax Payer)
                </button>
                <button
                  type="button"
                  onClick={() => updateAnswer('paysIncomeTax', false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.paysIncomeTax === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No (Non-Taxpayer)
                </button>
              </div>
            </div>

            {/* Government Employee / Pensioner Exclusion */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Is any member of your household a serving/retired government official (Group A, B, C) or monthly pensioner ≥ ₹10,000?</span>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">(Exclusion)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateAnswer('isGovtEmployeeOrPensionerInFamily', true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.isGovtEmployeeOrPensionerInFamily === true
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (Govt Employee in family)
                </button>
                <button
                  type="button"
                  onClick={() => updateAnswer('isGovtEmployeeOrPensionerInFamily', false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.isGovtEmployeeOrPensionerInFamily === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 4-Wheeler / Tractor Ownership */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Does your family own a motorized four-wheeler (car/jeep) or agricultural tractor?</span>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">(PMAY / NFSA Exclusion)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateAnswer('ownsMotorizedFourWheelerOrTractor', true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.ownsMotorizedFourWheelerOrTractor === true
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (Own 4-Wheeler / Tractor)
                </button>
                <button
                  type="button"
                  onClick={() => updateAnswer('ownsMotorizedFourWheelerOrTractor', false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.ownsMotorizedFourWheelerOrTractor === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* DBT Active Bank Account */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Do you have an active bank account linked to Aadhaar with DBT (Direct Benefit Transfer) enabled?</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">(PM-KISAN DBT)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateAnswer('hasAadhaarLinkedBankDbt', true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.hasAadhaarLinkedBankDbt === true
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (DBT Enabled)
                </button>
                <button
                  type="button"
                  onClick={() => updateAnswer('hasAadhaarLinkedBankDbt', false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.hasAadhaarLinkedBankDbt === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No / Not Sure
                </button>
              </div>
            </div>

            {/* MGNREGA manual labor willingness */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Are adult household members willing to undertake unskilled manual physical work on public infrastructure?</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">(MGNREGA Guarantee)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateAnswer('willingForUnskilledManualWork', true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.willingForUnskilledManualWork === true
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Yes (Willing for Manual Work)
                </button>
                <button
                  type="button"
                  onClick={() => updateAnswer('willingForUnskilledManualWork', false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    answers.willingForUnskilledManualWork === false
                      ? 'bg-amber-500 text-neutral-950 border-amber-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" />
                <span>{t('stepReview')}</span>
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Verify your declarations before running the deterministic evaluation engine.
              </p>
            </div>

            {/* Answer Summary Card */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 divide-y divide-neutral-200 dark:divide-neutral-700/60 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-500">Applicant:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {answers.age} yrs, {answers.gender}, {answers.areaType === 'rural' ? 'Rural' : 'Urban'} ({answers.state})
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-500">Occupation & Income:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {answers.occupation} — ₹{answers.annualFamilyIncome?.toLocaleString('en-IN') || 0}/yr
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-500">Cultivable Landholding:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {answers.ownsCultivableLand ? `Yes (${answers.landHoldingAcres || 1} Acres)` : 'No Land'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-500">Pucca House Ownership:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {answers.ownsPuccaHouse ? 'Yes (Owns Pucca House)' : 'No (Homeless / Kutcha House)'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-500">Ration Card & LPG:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {answers.rationCardCategory?.replace('_', ' ').toUpperCase()} | LPG: {answers.hasLpgConnectionInHousehold ? 'Yes' : 'None'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-500">Income Tax & Govt Job:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  Tax: {answers.paysIncomeTax ? 'Yes (Excluded)' : 'No'} | Govt Job: {answers.isGovtEmployeeOrPensionerInFamily ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Wizard Footer Navigation */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('previousStep')}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {t('close')}
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
            >
              <span>{t('nextStep')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('submitAssessment')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
