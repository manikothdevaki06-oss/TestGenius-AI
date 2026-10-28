import React from 'react';
import { X, FileCode, Terminal, BookOpen, Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/exporters';

interface PlaywrightGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlaywrightGuideModal: React.FC<PlaywrightGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-slate-100">
              Playwright Python & pytest Automation Guide
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Section 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">
                1. Install Packages
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    'install',
                    'pip install pytest pytest-playwright playwright'
                  )
                }
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedSection === 'install' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
              pip install pytest pytest-playwright playwright
            </pre>
          </div>

          {/* Section 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">
                2. Install Browsers
              </span>
              <button
                onClick={() => handleCopy('browsers', 'playwright install')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedSection === 'browsers' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
              playwright install
            </pre>
            <p className="text-[11px] text-slate-400">
              This downloads Chromium, Firefox, and WebKit binaries into your local Playwright cache.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">
                3. Run Tests with pytest
              </span>
              <button
                onClick={() =>
                  handleCopy('run', 'pytest -v --headed test_suite.py')
                }
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedSection === 'run' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
              pytest -v --headed test_suite.py
            </pre>
            <p className="text-[11px] text-slate-400">
              Omit <code className="text-cyan-300">--headed</code> to run headlessly in CI/CD pipelines (GitHub Actions, GitLab, Docker).
            </p>
          </div>

          {/* Section 4: Recommended Locators */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-200 block">
              4. Playwright Preferred Locators
            </span>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500"># Role:</span>
                <p className="text-cyan-300">
                  page.get_by_role("button", name="Submit Order")
                </p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500"># Label:</span>
                <p className="text-cyan-300">
                  page.get_by_label("Work Email Address")
                </p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500"># Placeholder:</span>
                <p className="text-cyan-300">
                  page.get_by_placeholder("name@company.com")
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
