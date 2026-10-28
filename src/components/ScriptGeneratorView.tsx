import React, { useState, useEffect } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  Play,
  Terminal,
  FileCode,
  ShieldAlert,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import {
  TestCase,
  GeneratedScript,
  BrowserTarget,
  Project,
} from '../types';
import {
  downloadPythonScript,
  copyToClipboard,
  exportTestCasesToJson,
  exportTestCasesToCsv,
} from '../utils/exporters';

interface ScriptGeneratorViewProps {
  currentProject: Project;
  testCases: TestCase[];
  scripts: GeneratedScript[];
  onGenerateScript: (payload: {
    testCases: TestCase[];
    stagingUrl: string;
    targetBrowser: BrowserTarget;
    includeHeadless: boolean;
    takeScreenshots: boolean;
  }) => Promise<void>;
  isGenerating: boolean;
  initialSelectedCaseIds?: string[];
}

export const ScriptGeneratorView: React.FC<ScriptGeneratorViewProps> = ({
  currentProject,
  testCases,
  scripts,
  onGenerateScript,
  isGenerating,
  initialSelectedCaseIds,
}) => {
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(
    new Set(
      initialSelectedCaseIds && initialSelectedCaseIds.length > 0
        ? initialSelectedCaseIds
        : testCases.slice(0, 4).map((tc) => tc.id)
    )
  );

  const [targetBrowser, setTargetBrowser] = useState<BrowserTarget>('Chromium');
  const [stagingUrl, setStagingUrl] = useState(
    currentProject.stagingUrl || 'https://staging.app.example.com'
  );
  const [includeHeadless, setIncludeHeadless] = useState(false);
  const [takeScreenshots, setTakeScreenshots] = useState(true);

  // Active script viewer
  const [activeScript, setActiveScript] = useState<GeneratedScript | null>(
    scripts.length > 0 ? scripts[0] : null
  );

  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'guide'>('code');

  // Update active script when new ones arrive
  useEffect(() => {
    if (scripts.length > 0) {
      setActiveScript(scripts[0]);
    }
  }, [scripts]);

  const toggleCase = (id: string) => {
    const next = new Set(selectedCaseIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCaseIds(next);
  };

  const selectAll = () => {
    if (selectedCaseIds.size === testCases.length) {
      setSelectedCaseIds(new Set());
    } else {
      setSelectedCaseIds(new Set(testCases.map((tc) => tc.id)));
    }
  };

  const handleGenerate = async () => {
    const selectedCases = testCases.filter((tc) => selectedCaseIds.has(tc.id));
    if (selectedCases.length === 0) return;

    await onGenerateScript({
      testCases: selectedCases,
      stagingUrl: stagingUrl.trim(),
      targetBrowser,
      includeHeadless,
      takeScreenshots,
    });
  };

  const handleCopyCode = async () => {
    if (!activeScript) return;
    const ok = await copyToClipboard(activeScript.pythonCode);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeScript) return;
    const filename = `${activeScript.id.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.py`;
    downloadPythonScript(activeScript.pythonCode, filename);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Disclaimer */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-100">
            Playwright Python Automation Generator (pytest compliant)
          </p>
          <p className="text-slate-400 leading-relaxed">
            Generates copyable, production-ready Python automation suites using pytest fixtures and accessible locators (<code className="text-indigo-300 font-mono">page.get_by_role</code>, <code className="text-indigo-300 font-mono">page.get_by_label</code>).
            These scripts have not been executed against live environments.
          </p>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Test Case Selection & Options */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Select Test Cases to Automate</span>
              </h3>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {selectedCaseIds.size === testCases.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>

            {/* Test Cases Checklist */}
            {testCases.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No test cases available in this project. Generate test cases first.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {testCases.map((tc, index) => {
                  const isSelected = selectedCaseIds.has(tc.id);
                  return (
                    <div
                      key={`${tc.id}_${index}`}
                      onClick={() => toggleCase(tc.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/50 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-indigo-400 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[10px] font-bold text-indigo-300">
                            {tc.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {tc.category}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-200 truncate">
                          {tc.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Script Config Parameters */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Staging Base URL (Placeholder / Env Var)
                </label>
                <input
                  type="text"
                  value={stagingUrl}
                  onChange={(e) => setStagingUrl(e.target.value)}
                  placeholder="https://staging.app.example.com"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Browser
                  </label>
                  <select
                    value={targetBrowser}
                    onChange={(e) =>
                      setTargetBrowser(e.target.value as BrowserTarget)
                    }
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Chromium">Chromium</option>
                    <option value="Firefox">Firefox</option>
                    <option value="WebKit">WebKit (Safari)</option>
                    <option value="Mobile Safari">Mobile Safari</option>
                    <option value="Mobile Chrome">Mobile Chrome</option>
                  </select>
                </div>

                <div className="space-y-1 pt-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHeadless}
                      onChange={(e) => setIncludeHeadless(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-0"
                    />
                    <span>Headless Mode</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={takeScreenshots}
                      onChange={(e) => setTakeScreenshots(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-0"
                    />
                    <span>Capture Screenshots</span>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || selectedCaseIds.size === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compiling Python Script...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    <span>
                      Generate Python Script ({selectedCaseIds.size} Tests)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Previously Compiled Scripts in Project */}
          {scripts.length > 1 && (
            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Compiled Suites History
              </span>
              <div className="space-y-1.5">
                {scripts.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveScript(s)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between ${
                      activeScript?.id === s.id
                        ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{s.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(s.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Python Code Viewer & Cheat Sheet */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col h-full min-h-[580px]">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'code'
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Python Script (.py)</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'guide'
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Setup & Execution Guide</span>
                </button>
              </div>

              {/* Action Buttons */}
              {activeScript && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-cyan-900 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .py</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tab 1: Python Code Display */}
            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col mt-4">
                {activeScript ? (
                  <div className="relative flex-1 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col">
                    <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-300">
                        {activeScript.id.toLowerCase()}.py
                      </span>
                      <span>
                        Framework: pytest + Playwright ({activeScript.targetBrowser})
                      </span>
                    </div>

                    <pre className="p-4 overflow-x-auto text-xs font-mono text-cyan-100 flex-1 leading-relaxed selection:bg-cyan-900">
                      <code>{activeScript.pythonCode}</code>
                    </pre>

                    {/* Assumptions Accordion */}
                    <div className="p-3 bg-slate-900/70 border-t border-slate-800 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Assumptions & Placeholders:{' '}
                      </span>
                      {activeScript.assumptions.join(' • ')}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Terminal className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">
                      No script generated yet
                    </p>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm">
                      Select test cases from the left panel and click "Generate Python Script".
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Setup & Execution Guide */}
            {activeTab === 'guide' && (
              <div className="flex-1 mt-4 space-y-4 text-xs text-slate-300 overflow-y-auto pr-1">
                {/* Step 1: Install Playwright */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200">
                      1. Install Python Dependencies
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Python 3.9+ required
                    </span>
                  </div>
                  <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
                    pip install pytest pytest-playwright playwright
                  </pre>
                </div>

                {/* Step 2: Download Browsers */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200">
                    2. Install Browser Binaries
                  </h4>
                  <p className="text-slate-400">
                    Download Chromium, Firefox, and WebKit binaries into your environment:
                  </p>
                  <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
                    playwright install
                  </pre>
                </div>

                {/* Step 3: Run pytest */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200">
                    3. Run the Automated Test Suite
                  </h4>
                  <p className="text-slate-400">
                    Execute in headed mode to watch browser interactions live:
                  </p>
                  <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
                    pytest -v --headed test_suite.py
                  </pre>
                  <p className="text-slate-400 mt-1">
                    Or run in headless mode for CI/CD pipelines (GitHub Actions, GitLab CI):
                  </p>
                  <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
                    pytest -v test_suite.py
                  </pre>
                </div>

                {/* Step 4: Recommended Locator Strategies */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200">
                    4. Playwright Locator Best Practices
                  </h4>
                  <ul className="space-y-1.5 text-slate-400">
                    <li>
                      <strong className="text-slate-200">getByRole:</strong> Best for buttons, links, headings (<code className="text-cyan-300">page.get_by_role("button", name="Sign in")</code>)
                    </li>
                    <li>
                      <strong className="text-slate-200">getByLabel:</strong> Best for inputs associated with form labels (<code className="text-cyan-300">page.get_by_label("Email")</code>)
                    </li>
                    <li>
                      <strong className="text-slate-200">getByTestId:</strong> For custom UI testing tags (<code className="text-cyan-300">page.get_by_test_id("submit-order")</code>)
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
