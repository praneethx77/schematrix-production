'use client';

// ==============================================================================
// SCHEMATRIX - SpeechRecognition hook (voice input)
// Wraps the browser SpeechRecognition API with real support detection, permission
// handling, listening/stop/cancel states and full resource cleanup.
//
// Nothing is faked: when the browser has no SpeechRecognition support the hook
// reports `supported: false` and the UI explains that voice input is unavailable
// instead of showing a decorative microphone.
// ==============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { SPEECH_RECOGNITION_LANG } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/types';

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'stopped' | 'error' | 'unsupported';

export type SpeechErrorReason =
  | 'not-supported'
  | 'denied'
  | 'no-speech'
  | 'aborted'
  | 'network'
  | 'unknown';

export interface SpeechInputState {
  /** Whether this browser exposes a usable SpeechRecognition implementation. */
  supported: boolean;
  status: SpeechRecognitionStatus;
  /** Final + interim transcript produced by the recognizer. */
  transcript: string;
  /** Why the last attempt ended, when it did. */
  error: SpeechErrorReason | null;
  start: () => void;
  stop: () => void;
  cancel: () => void;
  /** Clear the transcript and any error. */
  reset: () => void;
}

interface RecognitionAlternativeLike {
  transcript: string;
}
interface RecognitionResultLike {
  isFinal: boolean;
  0: RecognitionAlternativeLike;
  length: number;
}
interface RecognitionResultListLike {
  length: number;
  [index: number]: RecognitionResultLike;
}
interface RecognitionEventLike {
  resultIndex: number;
  results: RecognitionResultListLike;
}
interface RecognitionErrorEventLike {
  error: string;
}
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: RecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Start listening in `language` (en-IN / hi-IN / te-IN). Only called from an
 * explicit user gesture, so the browser prompt appears at that moment.
 */
export function useSpeechInput(language: SupportedLanguage): SpeechInputState {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<SpeechErrorReason | null>(null);

  const recognitionRef = useRef<RecognitionLike | null>(null);
  const finalRef = useRef('');
  const mountedRef = useRef(true);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Always release the microphone when the component unmounts.
  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      if (rec) {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.onstart = null;
        try {
          rec.abort();
        } catch {
          // Already stopped.
        }
      }
    };
  }, []);

  const reset = useCallback(() => {
    finalRef.current = '';
    setTranscript('');
    setError(null);
    setStatus('idle');
  }, []);

  const cancel = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      rec.onstart = null;
      try {
        rec.abort();
      } catch {
        // Already stopped.
      }
    }
    finalRef.current = '';
    setTranscript('');
    setError(null);
    setStatus('idle');
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      setStatus((s) => (s === 'listening' ? 'stopped' : s));
      return;
    }
    try {
      rec.stop();
    } catch {
      // Already stopped.
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      setStatus('unsupported');
      setError('not-supported');
      return;
    }

    // Never run two recognizers at once.
    const existing = recognitionRef.current;
    if (existing) {
      existing.onresult = null;
      existing.onerror = null;
      existing.onend = null;
      existing.onstart = null;
      try {
        existing.abort();
      } catch {
        // Already stopped.
      }
      recognitionRef.current = null;
    }

    const rec = new Ctor();
    recognitionRef.current = rec;
    finalRef.current = '';
    setTranscript('');
    setError(null);
    setStatus('listening');

    rec.lang = SPEECH_RECOGNITION_LANG[language] || 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      if (mountedRef.current) setStatus('listening');
    };

    rec.onresult = (event) => {
      let interim = '';
      let finalText = finalRef.current;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const chunk = result?.[0]?.transcript ?? '';
        if (result.isFinal) {
          finalText += chunk;
        } else {
          interim += chunk;
        }
      }
      finalRef.current = finalText;
      if (mountedRef.current) {
        setTranscript((finalText + interim).trim());
      }
    };

    rec.onerror = (event) => {
      const reason = event.error;
      const mapped: SpeechErrorReason =
        reason === 'not-allowed' || reason === 'service-not-allowed'
          ? 'denied'
          : reason === 'no-speech'
            ? 'no-speech'
            : reason === 'aborted'
              ? 'aborted'
              : reason === 'network'
                ? 'network'
                : 'unknown';
      if (mountedRef.current) {
        setError(mapped);
        setStatus(mapped === 'aborted' ? 'idle' : 'error');
      }
    };

    rec.onend = () => {
      recognitionRef.current = null;
      if (!mountedRef.current) return;
      setStatus((prev) => {
        if (prev === 'error') return 'error';
        const hasText = (finalRef.current || '').trim().length > 0;
        return hasText ? 'stopped' : 'idle';
      });
    };

    try {
      rec.start();
    } catch {
      // start() throws if it is already running; treat as an honest failure.
      recognitionRef.current = null;
      if (mountedRef.current) {
        setError('unknown');
        setStatus('error');
      }
    }
  }, [language]);

  return { supported, status, transcript, error, start, stop, cancel, reset };
}