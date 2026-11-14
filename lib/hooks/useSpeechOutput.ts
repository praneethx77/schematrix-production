'use client';

// ==============================================================================
// SCHEMATRIX - SpeechSynthesis hook (voice output)
// Wraps the browser SpeechSynthesis API with real support detection, a matching
// voice per language (en-IN / hi-IN / te-IN), single-session enforcement,
// pause/resume/stop controls and honest reporting when no voice is installed.
// ==============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { pickVoice, SPEECH_RECOGNITION_LANG } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/types';

export type SpeechPlaybackStatus = 'idle' | 'speaking' | 'paused';

export interface SpeechOutputState {
  /** Whether this browser exposes the Web Speech synthesis API. */
  supported: boolean;
  status: SpeechPlaybackStatus;
  /** Language of the utterance currently loaded (for the UI label). */
  activeLanguage: SupportedLanguage | null;
  /** True when the requested language has no installed voice. */
  missingVoice: boolean;
  /** Browser voices, refreshed when the engine finishes loading them. */
  voices: SpeechSynthesisVoice[];
  speak: (text: string, language: SupportedLanguage) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useSpeechOutput(): SpeechOutputState {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<SpeechPlaybackStatus>('idle');
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage | null>(null);
  const [missingVoice, setMissingVoice] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mountedRef = useRef(true);
  const sessionRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    const available = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setSupported(available);

    if (!available) return;

    const load = () => {
      if (mountedRef.current) setVoices(window.speechSynthesis.getVoices());
    };
    load();
    // Chrome populates voices asynchronously.
    window.speechSynthesis.addEventListener?.('voiceschanged', load);

    // Some browsers (e.g. iPadOS Safari) expose the API immediately but
    // populate voices a moment later and never fire `voiceschanged`. Poll
    // briefly so the first utterance still gets a matching voice.
    let attempts = 0;
    const poll = window.setInterval(() => {
      attempts += 1;
      const list = window.speechSynthesis.getVoices();
      if (mountedRef.current) setVoices(list);
      if (list.length > 0 || attempts >= 20) window.clearInterval(poll);
    }, 250);

    return () => {
      mountedRef.current = false;
      window.clearInterval(poll);
      window.speechSynthesis.removeEventListener?.('voiceschanged', load);
      sessionRef.current += 1;
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Nothing was playing.
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    sessionRef.current += 1;
    utteranceRef.current = null;
    // Avoid cancelling when nothing is active, which keeps the engine quiet.
    try {
      const synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) synth.cancel();
    } catch {
      // Nothing was playing.
    }
    if (mountedRef.current) {
      setStatus('idle');
      setActiveLanguage(null);
      setMissingVoice(false);
    }
  }, []);

  const speak = useCallback((text: string, language: SupportedLanguage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const synth = window.speechSynthesis;

    // Single-session guarantee: cancel whatever is speaking before starting.
    sessionRef.current += 1;
    const session = sessionRef.current;
    try {
      if (synth.speaking || synth.pending) synth.cancel();
    } catch {
      // Nothing was speaking.
    }

    const start = () => {
      // A newer session began while waiting: never speak a stale turn.
      if (session !== sessionRef.current || !mountedRef.current) return;

      const available = synth.getVoices();
      setVoices(available);
      const voice = pickVoice(available, language);

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = SPEECH_RECOGNITION_LANG[language] || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;

      const isStale = () => session !== sessionRef.current || !mountedRef.current;

      utterance.onstart = () => {
        if (isStale()) return;
        setStatus('speaking');
        setActiveLanguage(language);
        // The engine started speaking, so a usable voice exists even when the
        // voice list was still empty at call time (iPadOS Safari behaviour).
        setMissingVoice(false);
      };
      utterance.onend = () => {
        if (isStale()) return;
        setStatus('idle');
        setActiveLanguage(null);
        setMissingVoice(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        if (isStale()) return;
        setStatus('idle');
        setActiveLanguage(null);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      // Only claim "no voice installed" when the browser reports a voice list
      // and none of those voices match the requested language. An empty list is
      // inconclusive (voices may load late), so wait for onstart instead.
      setMissingVoice(available.length > 0 && !voice);
      setStatus('speaking');
      setActiveLanguage(language);
      synth.speak(utterance);
    };

    // Some browsers (iPadOS Safari) expose the API before populating voices,
    // and only fill the list after the first user gesture. Wait for it.
    if (synth.getVoices().length === 0) {
      let waited = 0;
      const timer = window.setInterval(() => {
        if (session !== sessionRef.current) {
          window.clearInterval(timer);
          return;
        }
        waited += 150;
        if (synth.getVoices().length > 0 || waited >= 3000) {
          window.clearInterval(timer);
          start();
        }
      }, 150);
      return;
    }

    start();
  }, []);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.pause();
    } catch {
      return;
    }
    if (mountedRef.current) setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.resume();
    } catch {
      return;
    }
    if (mountedRef.current) setStatus('speaking');
  }, []);

  return {
    supported,
    status,
    activeLanguage,
    missingVoice,
    voices,
    speak,
    pause,
    resume,
    stop,
  };
}