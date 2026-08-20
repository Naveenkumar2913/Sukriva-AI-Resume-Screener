import { FormEvent, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { askAIApi } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import type { AdviserMessage, GeminiAnalysis } from '../lib/types';

interface AIAdviserProps {
  resumeText: string;
  analysis: GeminiAnalysis | null;
}

const SUGGESTIONS = [
  'How can I improve my ATS score?',
  'What skills should I add for my target role?',
  'Rewrite my summary to be stronger.',
  'Which job roles fit me best and why?',
];

export default function AIAdviser({ resumeText, analysis }: AIAdviserProps) {
  const [messages, setMessages] = useState<AdviserMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const canAsk = resumeText.trim().length >= 40 && !loading;

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || !canAsk) return;

    setError(null);
    const userMsg: AdviserMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await askAIApi({
        question: q,
        resumeText,
        analysisContext: analysis,
        history,
      });

      const assistantMsg: AdviserMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: res.timestamp || Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'AI Adviser is unavailable. Check your Gemini API configuration.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="glass flex h-full min-h-[420px] flex-col rounded-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-500/20">
          <Bot className="h-5 w-5 text-brand-300" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white">Sukriva AI Adviser</h3>
          <p className="text-xs text-slate-500">
            Powered by Gemini 2.5 Flash · answers grounded in your uploaded resume
          </p>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
            <p className="mb-3 flex items-center gap-2 text-slate-300">
              <Sparkles className="h-4 w-4 text-accent-400" />
              Ask anything about this resume — improvements, role fit, ATS tips, rewrites.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={!canAsk}
                  onClick={() => void send(s)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[92%] rounded-2xl px-4 py-3 ${
              m.role === 'user'
                ? 'ml-auto bg-brand-600/30 text-sm text-white'
                : 'mr-auto border border-white/10 bg-white/5'
            }`}
          >
            {m.role === 'assistant' ? (
              <div className="space-y-1">{renderMarkdown(m.content)}</div>
            ) : (
              m.content
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
            Gemini is analyzing your resume…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-5 mb-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!resumeText || loading}
            placeholder={
              resumeText
                ? 'Ask about this resume…'
                : 'Upload a resume first to enable AI Adviser'
            }
            className="flex-1 rounded-xl border border-white/10 bg-surface-900/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canAsk || !input.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-3.5 text-white transition enabled:hover:bg-brand-500 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
