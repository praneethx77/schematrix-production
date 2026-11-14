'use client';

// ==============================================================================
// SCHEMATRIX - GovTech Accessibility Control Toolbar
// Provides instantaneous trilingual switching, text scaling, contrast & voice
// ==============================================================================

import React from 'react';
import { useLanguage, TextSize } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { SupportedLanguage } from '@/lib/types';
import { Volume2, VolumeX, Eye, Languages } from 'lucide-react';

export function AccessibilityBar() {
  const {
    language,
    setLanguage,
    highContrast,
    toggleHighContrast,
    textSize,
    setTextSize,
    voiceAudioEnabled,
    toggleVoiceAudio,
    t,
  } = useLanguage();

  const handleLanguageChange = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  const handleTextSizeChange = (size: TextSize) => {
    setTextSize(size);
  };

  return (
    <nav
      aria-label={t('accessibility')}
      className="bg-neutral-900 text-white text-xs py-1.5 px-4 border-b border-neutral-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indian GovTech Identity Tag */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium tracking-wide text-neutral-300">
            {t('govIndiaPortal')}
          </span>
        </div>

        {/* Right: Accessibility Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3" role="toolbar" aria-label="Accessibility settings">
          {/* 1. Trilingual Language Switcher */}
          <div className="flex items-center gap-1 bg-neutral-800/80 rounded-md p-0.5 border border-neutral-700">
            <Languages className="w-3.5 h-3.5 ml-1 text-neutral-400" aria-hidden="true" />
            <span className="sr-only">{t('languageSelect')}</span>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  aria-pressed={isActive}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
                  }`}
                >
                  {lang.nativeLabel}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-neutral-700 hidden sm:block" aria-hidden="true" />

          {/* 2. Text Scaling Controls */}
          <div className="flex items-center gap-1 bg-neutral-800/80 rounded-md p-0.5 border border-neutral-700">
            <span className="text-[10px] text-neutral-400 px-1 font-semibold uppercase tracking-wider">
              {t('textSize')}:
            </span>
            <button
              type="button"
              onClick={() => handleTextSizeChange('normal')}
              aria-label={t('normalText')}
              aria-pressed={textSize === 'normal'}
              className={`px-1.5 py-0.5 rounded text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
                textSize === 'normal'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleTextSizeChange('large')}
              aria-label={t('largeText')}
              aria-pressed={textSize === 'large'}
              className={`px-1.5 py-0.5 rounded text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
                textSize === 'large'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleTextSizeChange('xlarge')}
              aria-label={t('xlargeText')}
              aria-pressed={textSize === 'xlarge'}
              className={`px-1.5 py-0.5 rounded text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
                textSize === 'xlarge'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
              }`}
            >
              A+
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-700 hidden sm:block" aria-hidden="true" />

          {/* 3. High Contrast Mode Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            title={highContrast ? t('highContrastOn') : t('highContrastOff')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-all focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('highContrast')}</span>
          </button>

          {/* 4. Voice Read-Aloud Toggle */}
          <button
            type="button"
            onClick={toggleVoiceAudio}
            aria-pressed={voiceAudioEnabled}
            title={voiceAudioEnabled ? t('voiceAudioOn') : t('voiceAudioOff')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-all focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
              voiceAudioEnabled
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            {voiceAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
            )}
            <span className="hidden md:inline">{t('voiceAudio')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
