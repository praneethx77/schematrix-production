'use client';

// ==============================================================================
// SCHEMATRIX - ResponseSpeaker
// Real text-to-speech controls attached to a single AI Sahayak response:
// read aloud / pause / resume / stop, with honest handling when the browser has
// no speech synthesis or no voice installed for that language.
// ==============================================================================

import React, { useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { pickVoice } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/types';
import { Pause, Play, Square, Volume2 } from 'lucide-react';

interface ResponseSpeakerProps {
  /** Response text to read aloud. */
  text: string;
  /** Language the response is written in. */
  language: SupportedLanguage;
}

export function ResponseSpeaker({ text, language }: ResponseSpeakerProps): React.ReactElement | null {
  const { t } = useLanguage();
  const [status, setStatus] = React.useState<'idle' | 'speaking' | 'paused'>('idle');
  const [supported, setSupported] = React.useState(true);
  const [missingVoice, setMissingVoice] = React.useState(false);
  const sessionRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
    }
    const session = sessionRef.current;
    return () => {
      // Release this response's speech when it unmounts.
      if (sessionRef.current === session) {
        sessionRef.current += 1;
        try {
          window.speechSynthesis?.cancel();
        } catch {
          // Nothing was speaking.
        }
      }
    };
  }, []);

  const stopLocal = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    sessionRef.current += 1;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Nothing was speaking.
    }
    setStatus('idle');
  }, []);

  const speakLocal = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    const synth = window.speechSynthesis;
    sessionRef.current += 1;
    const session = sessionRef.current;
    try {
      synth.cancel();
    } catch {
      // Nothing was speaking.
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    const voice = pickVoice(synth.getVoices(), language);
    utterance.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    if (voice) utterance.voice = voice;

    const stale = () => session !== sessionRef.current;

    utterance.onstart = () => {
      if (!stale()) setStatus('speaking');
    };
    utterance.onend = () => {
      if (!stale()) setStatus('idle');
    };
    utterance.onerror = () => {
      if (!stale()) setStatus('idle');
    };

    setMissingVoice(synth.getVoices().length > 0 && !voice);
    setStatus('speaking');
    synth.speak(utterance);
  }, [language, text]);

  const toggle = useCallback(() => {
    if (status === 'speaking') {
      stopLocal();
      return;
    }
    speakLocal();
  }, [speakLocal, status, stopLocal]);

  if (!supported) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400"
        title={t('sahayakSpeakUnsupported')}
      >
        <Volume2 className="w-3 h-3" aria-hidden="true" />
        <span className="sr-only">{t('sahayakSpeakUnsupported')}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={status === 'speaking' ? t('sahayakStop') : t('sahayakPlay')}
        title={status === 'speaking' ? t('sahayakStop') : t('sahayakPlay')}
        className="inline-flex items-center gap-1 rounded-full border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {status === 'speaking' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        <span>{status === 'speaking' ? t('sahayakStop') : t('sahayakPlay')}</span>
      </button>

      {status === 'speaking' && (
        <button
          type="button"
          onClick={() => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            window.speechSynthesis.pause();
            setStatus('paused');
          }}
          aria-label={t('sahayakPause')}
          title={t('sahayakPause')}
          className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 p-1 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Pause className="w-3 h-3" />
        </button>
      )}

      {status === 'paused' && (
        <button
          type="button"
          onClick={() => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            window.speechSynthesis.resume();
            setStatus('speaking');
          }}
          aria-label={t('sahayakResume')}
          title={t('sahayakResume')}
          className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 p-1 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Play className="w-3 h-3" />
        </button>
      )}

      {missingVoice && (
        <span
          className="text-[10px] text-amber-700 dark:text-amber-400"
          title={t('sahayakNoVoiceInstalled')}
        >
          {t('sahayakNoVoiceInstalled')}
        </span>
      )}
    </span>
  );
}

export default ResponseSpeaker;