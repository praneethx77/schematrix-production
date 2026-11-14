'use client';

// ==============================================================================
// SCHEMATRIX - VoiceAssistantPanel
// Optional end-to-end voice conversation mode for AI Sahayak.
//
// Flow: user taps "Start Voice Assistant" -> speaks a question -> speech is
// transcribed in the browser -> the SAME /api/sahayak route answers -> the reply
// is spoken aloud. Listening is always user-initiated; there is no continuous
// background microphone.
// ==============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSpeechInput } from '@/lib/hooks/useSpeechInput';
import { useSpeechOutput } from '@/lib/hooks/useSpeechOutput';
import { detectLanguage } from '@/lib/sahayak';
import { SPEECH_RECOGNITION_LANG } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/types';
import {
  AlertCircle,
  Bot,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Play,
  Square,
  Volume2,
} from 'lucide-react';

interface VoiceAssistantPanelProps {
  /** Current preferred language, used for recognition and playback. */
  language: SupportedLanguage;
  /** Called with the assistant's reply so the chat transcript can show it too. */
  onAssistantReply?: (
    text: string,
    sources: { label: string; url?: string }[],
    mode?: 'live' | 'demo',
  ) => void;
}

type VoicePhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export function VoiceAssistantPanel({
  language,
  onAssistantReply,
}: VoiceAssistantPanelProps): React.ReactElement {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  const speechIn = useSpeechInput(language);
  const speechOut = useSpeechOutput();
  // Set once a transcript is accepted for answering, cleared when a new
  // microphone turn starts. Prevents reset() (which clears the transcript) from
  // cancelling an in-flight Gemini request.
  const processingRef = useRef(false);
  // Identifies the current request. Bumped only when the turn is abandoned
  // (user ends voice mode or starts speaking again).
  const turnTokenRef = useRef(0);

  const activeRef = useRef(active);
  activeRef.current = active;

  // Reflect recognizer status into the phase machine. Only an actively
  // listening recognizer drives the phase; a settled (stopped/idle) status must
  // never drag the panel back from 'thinking' or 'speaking'.
  useEffect(() => {
    if (!active) return;
    if (speechIn.status === 'listening') {
      setPhase('listening');
      return;
    }
    if (speechIn.error === 'denied') {
      setErrorText(t('sahayakMicDenied'));
      setPhase('error');
      return;
    }
    if (speechIn.error === 'no-speech') {
      setErrorText(t('sahayakNoSpeech'));
      return;
    }
    if (speechIn.error === 'not-supported') {
      setErrorText(t('sahayakSpeechUnsupported'));
      setPhase('error');
      return;
    }
    if (speechIn.error && speechIn.error !== 'aborted') {
      setErrorText(t('sahayakMicError'));
    }
  }, [speechIn.status, speechIn.error, active, t]);

  // When a final transcript lands, send it to the existing Gemini route.
  // A turn token keeps the in-flight request alive across re-renders caused by
  // the recognizer resetting its own buffer; the token is only invalidated when
  // the user explicitly ends voice mode or starts a new microphone turn.
  useEffect(() => {
    if (!active) return;
    if (processingRef.current) return;

    const text = speechIn.transcript.trim();
    if (!text) return;
    // Wait until the recognizer has produced a final result (stopped/errored),
    // so we never send a half-heard sentence.
    if (speechIn.status === 'listening') return;

    processingRef.current = true;
    const turn = turnTokenRef.current;
    const stillCurrent = () => turn === turnTokenRef.current;

    const run = async () => {
      setQuestion(text);
      setErrorText(null);
      setPhase('thinking');
      // Clear the recognizer's buffer now that the text is captured locally.
      speechIn.reset();

      try {
        const res = await fetch('/api/sahayak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language: 'auto',
            history: history.slice(-10),
          }),
        });

        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errBody.error || `Request failed (${res.status})`);
        }

        const data = (await res.json()) as {
          text?: string;
          sources?: { label: string; url?: string }[];
          mode?: 'live' | 'demo';
          error?: string;
          notice?: string;
        };

        if (!stillCurrent()) return;

        const reply = (data.text || '').trim();
        setAnswer(reply);
        setHistory((prev) => [
          ...prev,
          { role: 'user', text },
          { role: 'assistant', text: reply },
        ]);
        onAssistantReply?.(reply, Array.isArray(data.sources) ? data.sources : [], data.mode);

        if (reply) {
          // Speak in the language Gemini actually wrote in (native script),
          // not necessarily the UI language.
          const replyLanguage = detectLanguage(reply);
          speechOut.speak(reply, replyLanguage);
          setPhase('speaking');
        } else {
          setErrorText(data.notice || t('sahayakMicError'));
          setPhase('error');
        }
      } catch (e) {
        if (!stillCurrent()) return;
        setErrorText(e instanceof Error ? e.message : t('sahayakMicError'));
        setPhase('error');
      } finally {
        if (stillCurrent()) processingRef.current = false;
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechIn.transcript, speechIn.status]);

  // Leaving voice mode releases every resource and abandons any pending turn.
  // Only the `active` flag drives this, so re-renders from the speech hooks do
  // not repeatedly cancel speech that is currently playing.
  useEffect(() => {
    if (active) return;
    turnTokenRef.current += 1;
    processingRef.current = false;
    speechIn.cancel();
    speechOut.stop();
    setPhase('idle');
    setQuestion('');
    setAnswer('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    return () => {
      speechOut.stop();
    };
  }, [speechOut]);

  const start = useCallback(() => {
    if (!speechIn.supported) {
      setErrorText(t('sahayakSpeechUnsupported'));
      setPhase('error');
      return;
    }
    setActive(true);
    setErrorText(null);
    setQuestion('');
    setAnswer('');
    speechOut.stop();
    setPhase('idle');
  }, [speechIn.supported, speechOut, t]);

  const end = useCallback(() => {
    setActive(false);
    setErrorText(null);
    speechIn.cancel();
    speechOut.stop();
    setPhase('idle');
  }, [speechIn, speechOut]);

  const toggleMic = useCallback(() => {
    if (speechIn.status === 'listening') {
      speechIn.stop();
      return;
    }
    if (phase === 'speaking' || phase === 'thinking') {
      speechOut.stop();
      setPhase('idle');
      return;
    }
    // A new microphone turn starts here; abandon the previous answer's request.
    turnTokenRef.current += 1;
    processingRef.current = false;
    setAnswer('');
    setQuestion('');
    setErrorText(null);
    speechIn.start();
  }, [phase, speechIn, speechOut]);

  const listening = phase === 'listening';
  const thinking = phase === 'thinking';
  const speaking = phase === 'speaking';

  return (
    <section
      id="voice-assistant"
      aria-label={t('sahayakVoiceActive')}
      className="rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-neutral-900 p-4 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
              {t('sahayakVoiceActive')}
            </h3>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
              {SPEECH_RECOGNITION_LANG[language]} · {t('sahayakVoiceIdle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {active ? (
            <button
              type="button"
              onClick={end}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-xs font-bold min-h-[44px] transition-colors"
            >
              <PhoneOff className="w-4 h-4" aria-hidden="true" />
              <span>{t('sahayakVoiceEnd')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold min-h-[44px] transition-colors"
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
              <span>{t('sahayakVoiceStart')}</span>
            </button>
          )}
        </div>
      </div>

      {!speechIn.supported && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t('sahayakSpeechUnsupported')}</span>
        </p>
      )}

      {active && (
        <div className="mt-5 flex flex-col items-center gap-4">
          {/* Large microphone control */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={!speechIn.supported || thinking}
            aria-label={listening ? t('sahayakStopListening') : t('sahayakStartListening')}
            aria-pressed={listening}
            className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all focus-visible:ring-4 focus-visible:ring-emerald-500/30 outline-none ${
              listening
                ? 'bg-red-600 text-white shadow-lg scale-105'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            } ${!speechIn.supported || thinking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {listening && (
              <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" aria-hidden="true" />
            )}
            {listening ? (
              <Square className="w-10 h-10 relative" aria-hidden="true" />
            ) : thinking ? (
              <Loader2 className="w-10 h-10 animate-spin relative" aria-hidden="true" />
            ) : speaking ? (
              <Volume2 className="w-10 h-10 relative" aria-hidden="true" />
            ) : (
              <Mic className="w-10 h-10 relative" aria-hidden="true" />
            )}
          </button>

          {/* Listening / thinking / speaking indicators */}
          <div className="min-h-[1.5rem] text-center" aria-live="polite">
            {listening && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300">
                <span className="flex items-end gap-0.5 h-4" aria-hidden="true">
                  <span className="w-1 h-2 bg-red-500 rounded animate-pulse" />
                  <span className="w-1 h-4 bg-red-500 rounded animate-pulse [animation-delay:120ms]" />
                  <span className="w-1 h-3 bg-red-500 rounded animate-pulse [animation-delay:240ms]" />
                </span>
                {t('sahayakListening')}
              </span>
            )}
            {thinking && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                {t('sahayakVoiceThinking')}
              </span>
            )}
            {speaking && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                {t('sahayakVoiceSpeaking')}
              </span>
            )}
            {phase === 'error' && !listening && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errorText || t('sahayakMicError')}
              </span>
            )}
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center max-w-md">
            {listening ? t('sahayakListeningHint') : t('sahayakVoiceIdle')}
          </p>

          {/* Recognized transcript */}
          {question && (
            <div className="w-full rounded-2xl bg-white dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t('sahayakVoiceTranscript')}
              </p>
              <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                {question}
              </p>
            </div>
          )}

          {/* AI answer text + playback controls */}
          {answer && (
            <div className="w-full rounded-2xl bg-white dark:bg-neutral-950/60 border border-emerald-200 dark:border-emerald-900/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {t('sahayakVoiceAnswer')}
                </p>
                {speechOut.supported || speechOut.voices.length > 0 ? (
                  <span className="flex items-center gap-1">
                    {speechOut.status === 'speaking' && (
                      <button
                        type="button"
                        onClick={speechOut.pause}
                        aria-label={t('sahayakPause')}
                        className="rounded-full border border-neutral-300 dark:border-neutral-700 p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {speechOut.status === 'paused' && (
                      <button
                        type="button"
                        onClick={speechOut.resume}
                        aria-label={t('sahayakResume')}
                        className="rounded-full border border-neutral-300 dark:border-neutral-700 p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={speechOut.stop}
                      aria-label={t('sahayakStop')}
                      className="rounded-full border border-neutral-300 dark:border-neutral-700 p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {t('sahayakSpeakUnsupported')}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                {answer}
              </p>
              {speechOut.missingVoice && (
                <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-400">
                  {t('sahayakNoVoiceInstalled')}
                </p>
              )}
            </div>
          )}

          {errorText && phase === 'error' && (
            <p className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-700 dark:text-red-300 max-w-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorText}</span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default VoiceAssistantPanel;