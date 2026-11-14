'use client';

// ==============================================================================
// SCHEMATRIX - Language & GovTech Accessibility Context
// Persistent trilingual i18n, high-contrast, font-scaling, and voice synthesis
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage } from '@/lib/types';
import { translations, TranslationKey, t as translateFn, speakText, stopSpeaking } from '@/lib/i18n';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  voiceAudioEnabled: boolean;
  setVoiceAudioEnabled: (val: boolean) => void;
  toggleVoiceAudio: () => void;
  t: (key: TranslationKey) => string;
  speak: (text: string) => void;
  stopVoice: () => void;
  isSpeaking: boolean;
  isMounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'schematrix_preferred_language',
  CONTRAST: 'schematrix_high_contrast',
  TEXT_SIZE: 'schematrix_text_size',
  VOICE: 'schematrix_voice_enabled',
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [textSize, setTextSizeState] = useState<TextSize>('normal');
  const [voiceAudioEnabled, setVoiceAudioEnabledState] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Hydrate from localStorage once mounted on client
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedLang = localStorage.getItem(STORAGE_KEYS.LANG) as SupportedLanguage;
      if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'te')) {
        setLanguageState(savedLang);
      }

      const savedContrast = localStorage.getItem(STORAGE_KEYS.CONTRAST);
      if (savedContrast !== null) {
        setHighContrastState(savedContrast === 'true');
      }

      const savedSize = localStorage.getItem(STORAGE_KEYS.TEXT_SIZE) as TextSize;
      if (savedSize && (savedSize === 'normal' || savedSize === 'large' || savedSize === 'xlarge')) {
        setTextSizeState(savedSize);
      }

      const savedVoice = localStorage.getItem(STORAGE_KEYS.VOICE);
      if (savedVoice !== null) {
        setVoiceAudioEnabledState(savedVoice === 'true');
      }
    } catch {
      // LocalStorage might be disabled in private browsing
    }
  }, []);

  // Synchronize document attributes with accessibility preferences
  useEffect(() => {
    if (!isMounted) return;

    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('data-text-size', textSize);

    // Apply root font size for text scaling
    if (textSize === 'large') {
      root.style.fontSize = '18px';
    } else if (textSize === 'xlarge') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }

    // Toggle high-contrast class on root
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [language, textSize, highContrast, isMounted]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch {}
  }, []);

  const setHighContrast = useCallback((val: boolean) => {
    setHighContrastState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRAST, String(val));
    } catch {}
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrastState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.CONTRAST, String(next));
      } catch {}
      return next;
    });
  }, []);

  const setTextSize = useCallback((size: TextSize) => {
    setTextSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size);
    } catch {}
  }, []);

  const setVoiceAudioEnabled = useCallback((val: boolean) => {
    setVoiceAudioEnabledState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.VOICE, String(val));
    } catch {}
    if (!val) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  }, []);

  const toggleVoiceAudio = useCallback(() => {
    setVoiceAudioEnabledState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.VOICE, String(next));
      } catch {}
      if (!next) {
        stopSpeaking();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translateFn(key, language);
    },
    [language]
  );

  const speak = useCallback(
    (text: string) => {
      if (!voiceAudioEnabled || typeof window === 'undefined') return;
      setIsSpeaking(true);
      speakText(text, language);

      // Periodically check speech synthesis speaking state
      const interval = setInterval(() => {
        if (!window.speechSynthesis?.speaking) {
          setIsSpeaking(false);
          clearInterval(interval);
        }
      }, 300);
    },
    [voiceAudioEnabled, language]
  );

  const stopVoice = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        textSize,
        setTextSize,
        voiceAudioEnabled,
        setVoiceAudioEnabled,
        toggleVoiceAudio,
        t,
        speak,
        stopVoice,
        isSpeaking,
        isMounted,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
