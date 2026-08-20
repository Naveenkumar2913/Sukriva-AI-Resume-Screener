import { useCallback, useRef, useState } from 'react';
import { FileUp, FileText, X, CheckCircle2, Type } from 'lucide-react';
import { extractResumeText, detectResumeType } from '../lib/extractResume';

interface ResumeUploaderProps {
  fileName: string | null;
  onExtracted: (payload: { text: string; fileName: string }) => void;
  onClear: () => void;
  disabled?: boolean;
}

export default function ResumeUploader({
  fileName,
  onExtracted,
  onClear,
  disabled,
}: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setError(null);

      if (!detectResumeType(file)) {
        setError('Unsupported file. Please upload PDF, DOCX, or TXT.');
        return;
      }

      setExtracting(true);
      try {
        const result = await extractResumeText(file);
        onExtracted({ text: result.text, fileName: result.fileName });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to extract resume text. Try pasting the text manually.'
        );
      } finally {
        setExtracting(false);
      }
    },
    [onExtracted]
  );

  const handlePasteSubmit = () => {
    if (pastedText.trim().length < 20) {
      setError('Please paste at least 20 characters of resume text.');
      return;
    }
    setError(null);
    onExtracted({ text: pastedText.trim(), fileName: 'pasted-resume.txt' });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-white/5 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              setError(null);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              mode === 'upload' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="h-3.5 w-3.5" />
            Upload File (PDF / DOCX)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('paste');
              setError(null);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              mode === 'paste' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            Paste Text
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled) processFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
            dragging
              ? 'border-accent-400 bg-accent-500/10'
              : 'border-white/15 bg-white/[0.03] hover:border-brand-400/40'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
            <FileUp className="h-7 w-7" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">Upload resume file</h3>
          <p className="mt-1 text-sm text-slate-400">
            PDF, DOCX, or TXT — text is extracted automatically
          </p>
          <button
            type="button"
            disabled={disabled || extracting}
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition enabled:hover:from-brand-400 enabled:hover:to-brand-500 disabled:opacity-50"
          >
            {extracting ? 'Extracting text…' : 'Choose file'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(e) => processFile(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <div className="glass rounded-2xl p-5">
          <label className="mb-2 block text-xs font-semibold text-white uppercase tracking-wider">
            Paste Resume Text Directly
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={8}
            placeholder="Paste candidate resume text here..."
            className="scrollbar-thin w-full resize-y rounded-xl border border-white/10 bg-surface-900/80 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={handlePasteSubmit}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-500"
          >
            Use Pasted Text
          </button>
        </div>
      )}

      {fileName && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate font-medium">{fileName}</span>
            <span className="text-emerald-300/70">ready for analysis</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg p-1.5 text-emerald-200/80 hover:bg-white/10"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <p>{error}</p>
          {error.includes('scanned') && (
            <button
              type="button"
              onClick={() => {
                setMode('paste');
                setError(null);
              }}
              className="mt-2 text-xs font-semibold text-accent-300 underline"
            >
              Switch to manual text paste →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
