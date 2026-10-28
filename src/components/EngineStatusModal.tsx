import React from 'react';
import { X, Sparkles, Cpu, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface EngineStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAiConfigured: boolean;
  statusMessage: string;
}

export const EngineStatusModal: React.FC<EngineStatusModalProps> = ({
  isOpen,
  onClose,
  isAiConfigured,
  statusMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-slate-100">
              AI & Generation Engine Architecture
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isAiConfigured
                ? 'bg-indigo-950/20 border-indigo-500/40'
                : 'bg-amber-950/20 border-amber-500/30'
            }`}
          >
            {isAiConfigured ? (
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            ) : (
              <Cpu className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-slate-100">
                  {isAiConfigured
                    ? 'Gemini 3.8 Flash (Server-Side)'
                    : 'Deterministic QA Heuristics Engine'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isAiConfigured
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {isAiConfigured ? 'Active Provider' : 'Demo Mode Active'}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{statusMessage}</p>
            </div>
          </div>

          {/* Honest Disclosure Box */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200">
              Deterministic Mode Honesty & Transparency
            </h4>
            <p className="text-slate-400 leading-relaxed">
              When running without an active Gemini API key, TestGenius AI runs
              in <strong>Deterministic Demo Mode</strong> using our built-in
              expert QA heuristic engine. It extracts HTML DOM tags, input
              attributes (<code className="text-indigo-300">required</code>,{' '}
              <code className="text-indigo-300">minlength</code>,{' '}
              <code className="text-indigo-300">pattern</code>), and user story
              keywords to generate complete, high-standard test cases and static
              bug analysis locally. Demo results are never falsely labeled as AI.
            </p>
          </div>

          {/* How to configure API key */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">
              How to Connect Gemini AI
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>
                In Google AI Studio, ensure <code className="text-indigo-300">GEMINI_API_KEY</code> is set in the Secrets panel.
              </li>
              <li>
                Or set <code className="text-indigo-300">GEMINI_API_KEY="your_api_key"</code> in your local <code className="text-indigo-300">.env</code> file.
              </li>
              <li>
                Calls are proxied strictly server-side through <code className="text-indigo-300">server.ts</code> — API keys are never exposed to browser bundles.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
