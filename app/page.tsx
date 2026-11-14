'use client';

// ==============================================================================
// SCHEMATRIX - Home / Gateway View
// Preserves the trilingual hero + accessibility status card and presents each
// capability as a card that links to its dedicated route.
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  ArrowRight,
  Languages,
  Eye,
  Sliders,
  Landmark,
  Compass,
  FileCheck,
  Navigation,
  FolderLock,
  Bot,
  GraduationCap,
  LogIn,
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    href: '/schemes',
    labelKey: 'schemes' as const,
    title: 'Welfare Schemes Directory',
    description:
      'Search, filter, and explore central and state government schemes with mother-tongue translation.',
    icon: Compass,
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    href: '/scholarships',
    labelKey: 'scholarships' as const,
    title: 'Student Scholarships',
    description:
      'Discover verified government scholarships and match your eligibility as a student.',
    icon: GraduationCap,
    accent: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    href: '/services',
    labelKey: 'services' as const,
    title: 'Public Services Directory',
    description:
      'Discover citizen-facing government services and their required documents and fees.',
    icon: Landmark,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    href: '/offices',
    labelKey: 'offices' as const,
    title: 'Government Office Locator',
    description:
      'Find the nearest Gram Panchayat, Mandal office, CSC, and more using live GPS distance.',
    icon: Navigation,
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    href: '/eligibility',
    labelKey: 'checker' as const,
    title: 'Eligibility Assessment',
    description:
      'Answer simple questions to get a deterministic, rule-based entitlement check.',
    icon: FileCheck,
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    href: '/sahayak',
    labelKey: 'sahayak' as const,
    title: 'AI Sahayak Assistant',
    description:
      'Ask questions in your language and get scheme, service, and office guidance.',
    icon: Bot,
    accent: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    href: '/vault',
    labelKey: 'vault' as const,
    title: 'Document Vault',
    description:
      'Store your certificates securely. Sign in to access your private document library.',
    icon: FolderLock,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
];

export default function Home() {
  const {
    t,
    language,
    highContrast,
    toggleHighContrast,
    textSize,
    setTextSize,
    voiceAudioEnabled,
    speak,
    stopVoice,
    isSpeaking,
  } = useLanguage();

  const handleSpeak = (text: string) => {
    speak(text);
  };

  const heroSpeech = `${t('appName')}. ${t('appTagline')}. ${t('subtitle')}`;

  return (
    <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
      {/* 1. Hero Section with Live Trilingual Content & Voice Assistant */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-background to-background py-12 sm:py-16 md:py-20 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading, Subtitle & Voice Read-Aloud */}
            <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('govIndiaPortal')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
                {t('appName')}
              </h1>

              <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
                {t('appTagline')}
              </p>

              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
                {t('subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => (isSpeaking ? stopVoice() : handleSpeak(heroSpeech))}
                  aria-label={isSpeaking ? t('stopVoice') : t('listenVoice')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${
                    isSpeaking
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>{t('stopVoice')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>{t('listenVoice')}</span>
                    </>
                  )}
                </button>

                <Link
                  href="/eligibility"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{t('checkEligibility')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/schemes"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Schemes</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Live Accessibility Status Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-500" />
                    <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
                      {t('accessibility')} (WCAG AAA)
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                    Live
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                    <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Languages className="w-4 h-4 text-amber-500" />
                      <span>Active Language:</span>
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white uppercase bg-amber-500/20 px-2 py-0.5 rounded">
                      {language === 'en' ? 'English (en)' : language === 'hi' ? 'हिन्दी (hi)' : 'తెలుగు (te)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                    <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Eye className="w-4 h-4 text-amber-500" />
                      <span>{t('highContrast')}:</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleHighContrast}
                      className={`font-bold px-2 py-0.5 rounded transition-colors ${
                        highContrast
                          ? 'bg-yellow-400 text-black'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {highContrast ? 'ON (High Contrast)' : 'OFF (Standard)'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {t('textSize')}:
                    </span>
                    <div className="flex items-center gap-1">
                      {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setTextSize(sz)}
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            textSize === sz
                              ? 'bg-amber-500 text-neutral-950'
                              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {sz === 'normal' ? '100%' : sz === 'large' ? '115%' : '130%'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                    <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Volume2 className="w-4 h-4 text-emerald-500" />
                      <span>Speech Synthesis:</span>
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {voiceAudioEnabled ? 'Web Speech API Ready' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                  {t('statusDisclaimer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Capability Overview Cards (link to dedicated routes) */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Everything a Citizen Needs, One Place
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Explore schemes, services, and offices, verify your eligibility, and store your
            documents — all in your preferred language.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-amber-500/60 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.accent}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                  <span>Open</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('login')}</span>
          </Link>
          <Link
            href="/vault"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none"
          >
            <FolderLock className="w-4 h-4" />
            <span>My Document Vault</span>
          </Link>
        </div>
      </section>

      {/* 3. Footer */}
      <footer className="mt-auto py-8 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              SCHEMATRIX GovTech
            </span>
            <span>—</span>
            <span>{t('govIndiaPortal')}</span>
          </div>

          <p className="text-center sm:text-right">
            Designed for rural citizens, high accessibility, and trilingual inclusion.
          </p>
        </div>
      </footer>
    </main>
  );
}