'use client';

// ==============================================================================
// SCHEMATRIX - AI Sahayak Chat Interface
// Chat with message history. Calls the /api/sahayak route (live Gemini when
// configured, otherwise the built-in dataset and is labeled accordingly — never
// presented as live AI). Adds real speech input (Web Speech recognition) and
// real speech output (Web Speech synthesis) plus a response-language selector.
// ==============================================================================

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useSpeechInput } from '@/lib/hooks/useSpeechInput';
import { ResponseSpeaker } from '@/components/sahayak/ResponseSpeaker';
import { VoiceAssistantPanel } from '@/components/sahayak/VoiceAssistantPanel';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { SahayakSource } from '@/lib/sahayak';
import { detectLanguage } from '@/lib/sahayak';
import type { SupportedLanguage } from '@/lib/types';
import {
  AlertCircle,
  Bot,
  Database,
  ExternalLink,
  Globe,
  Loader2,
  Mic,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  User,
} from 'lucide-react';

type ReplyMode = 'auto' | SupportedLanguage;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: SahayakSource[];
  mode?: 'live' | 'demo';
  /** Language the assistant actually wrote the reply in. */
  replyLanguage?: SupportedLanguage;
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text:
    'Namaste! I am AI Sahayak. Ask me about government schemes, eligibility, required documents, public services, or nearby offices — in English, हिन्दी or తెలుగు. Try: "Am I eligible for PM-KISAN?"',
  mode: 'demo',
};

export function AiSahayak(): React.ReactElement {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMode, setReplyMode] = useState<ReplyMode>('auto');
  const [aiMode, setAiMode] = useState<'live' | 'demo' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speech = useSpeechInput(language);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mirror recognized speech into the editable input.
  useEffect(() => {
    if (speech.transcript) {
      setInput(speech.transcript);
      inputRef.current?.focus();
    }
  }, [speech.transcript]);

  // Surface recognition failures honestly.
  useEffect(() => {
    if (speech.error === 'denied') {
      setError(t('sahayakMicDenied'));
    } else if (speech.error === 'no-speech') {
      setError(t('sahayakNoSpeech'));
    } else if (speech.error === 'not-supported') {
      setError(t('sahayakSpeechUnsupported'));
    } else if (speech.error === 'network' || speech.error === 'unknown') {
      setError(t('sahayakMicError'));
    }
  }, [speech.error, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading) return;

      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        role: 'user',
        text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      setError(null);

      try {
        const history = messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({ role: m.role, text: m.text }));

        const res = await fetch('/api/sahayak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language: replyMode,
            history,
            userId: user?.id,
          }),
        });

        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errBody.error || `Request failed (${res.status})`);
        }

        const data = (await res.json()) as {
          text?: string;
          sources?: SahayakSource[];
          mode?: 'live' | 'demo';
          language?: SupportedLanguage;
          error?: string;
          notice?: string;
        };

        setAiMode(data.mode === 'live' ? 'live' : 'demo');
        setError(data.error && data.notice ? data.notice : null);

        const replyLanguage = data.language ?? detectLanguage(data.text || '');
        const assistantMsg: ChatMessage = {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.text || 'Sorry, I could not generate a response.',
          sources: Array.isArray(data.sources) ? data.sources : [],
          mode: data.mode === 'live' ? 'live' : 'demo',
          replyLanguage,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (e: any) {
        setError(e?.message || 'Failed to reach the assistant.');
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, language, replyMode, user]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME]);
    setError(null);
    setInput('');
    speech.cancel();
  };

  const toggleMic = () => {
    setError(null);
    if (speech.status === 'listening') {
      speech.stop();
      return;
    }
    speech.start();
  };

  const replyLabel = useMemo(() => {
    if (replyMode === 'auto') return t('sahayakReplyLanguageAuto');
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === replyMode);
    return found ? found.nativeLabel : t('sahayakReplyLanguageAuto');
  }, [replyMode, t]);

  return (
    <section
      id="sahayak"
      className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            <Bot className="w-4 h-4" />
            <span>{t('sahayak')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            AI Sahayak Assistant
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            {t('sahayakDisclaimer')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-end">
          {aiMode === 'live' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('sahayakLiveAi')}</span>
            </span>
          ) : aiMode === 'demo' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
              <Database className="w-4 h-4" />
              <span>{t('sahayakBuiltIn')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('sahayak')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Reply language selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <label
          htmlFor="sahayak-reply-language"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300"
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
          {t('sahayakReplyLanguage')}
        </label>
        <select
          id="sahayak-reply-language"
          value={replyMode}
          onChange={(e) => setReplyMode(e.target.value as ReplyMode)}
          className="rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-white min-h-[44px] sm:min-h-0 focus-visible:border-amber-500 outline-none"
        >
          <option value="auto">{t('sahayakReplyLanguageAuto')}</option>
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeLabel} ({l.label})
            </option>
          ))}
        </select>
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {t('sahayakReplyLanguageAutoHint')} — {replyLabel}
        </span>
      </div>

      {/* Chat panel */}
      <div className="rounded-3xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden flex flex-col">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-[22rem] max-h-[32rem] overflow-y-auto p-4 sm:p-6 space-y-4"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-emerald-600 text-white'
                }`}
                aria-hidden="true"
              >
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <p className="whitespace-pre-wrap" lang={m.replyLanguage}>
                  {m.text}
                </p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                    {m.sources.map((s, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs">
                        <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                          >
                            {s.label}
                          </a>
                        ) : (
                          <span>{s.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {m.role === 'assistant' && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {m.mode === 'live' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>{t('sahayakLiveAi')}</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3 h-3 text-neutral-500" />
                          <span>{t('sahayakBuiltIn')}</span>
                        </>
                      )}
                    </span>
                    {m.id !== 'welcome' && (
                      <ResponseSpeaker text={m.text} language={m.replyLanguage ?? 'en'} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-emerald-600 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-950/60">
          {!speech.supported && (
            <p className="mb-2 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t('sahayakSpeechUnsupported')}</span>
            </p>
          )}
          <div className="flex items-end gap-2">
            {/* Real microphone control */}
            {speech.supported && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={loading}
                aria-label={speech.status === 'listening' ? t('sahayakStopListening') : t('sahayakStartListening')}
                aria-pressed={speech.status === 'listening'}
                title={speech.status === 'listening' ? t('sahayakStopListening') : t('sahayakStartListening')}
                className={`relative shrink-0 p-3 rounded-2xl border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  speech.status === 'listening'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}
              >
                {speech.status === 'listening' && (
                  <span
                    className="absolute inset-0 rounded-2xl bg-red-500/40 animate-ping"
                    aria-hidden="true"
                  />
                )}
                {speech.status === 'listening' ? (
                  <Square className="w-5 h-5 relative" />
                ) : (
                  <Mic className="w-5 h-5 relative" />
                )}
              </button>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={t('sahayakPlaceholder')}
              aria-label={t('sahayakPlaceholder')}
              className="flex-1 resize-none px-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => void sendMessage(input)}
              disabled={loading || !input.trim()}
              aria-label={t('send')}
              className="shrink-0 p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {speech.status === 'listening' ? t('sahayakListening') : t('sahayakDisclaimer')}
            </p>
            <div className="flex items-center gap-3">
              {speech.status === 'listening' && (
                <button
                  type="button"
                  onClick={speech.cancel}
                  className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
                >
                  {t('sahayakCancelListening')}
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('resetFilters')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full voice conversation mode */}
      <VoiceAssistantPanel
        language={language}
        onAssistantReply={(text, sources, mode) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `v_${Date.now()}`,
              role: 'assistant',
              text,
              sources,
              mode: mode ?? 'demo',
              replyLanguage: detectLanguage(text),
            },
          ]);
        }}
      />
    </section>
  );
}

export default AiSahayak;