import React, { useState } from 'react';
import {
  Bug,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Sparkles,
  Info,
  Trash2,
  FileText,
  Search,
} from 'lucide-react';
import { BugAnalysisItem, Project, TestCase, BugSeverity } from '../types';
import { SAMPLE_SCENARIOS, SampleScenario } from '../services/sampleData';
import {
  exportBugsToJson,
  exportBugsToMarkdown,
  copyToClipboard,
} from '../utils/exporters';

interface BugAnalysisViewProps {
  currentProject: Project;
  bugs: BugAnalysisItem[];
  onAnalyzeBugs: (payload: {
    featureDescription: string;
    componentCode?: string;
    stagingUrl?: string;
    forceDemoMode?: boolean;
  }) => Promise<void>;
  onConvertToTestCase: (bug: BugAnalysisItem) => void;
  onDeleteBug: (id: string) => void;
  onClearAllBugs: () => void;
  isAiConfigured: boolean;
  isAnalyzing: boolean;
}

export const BugAnalysisView: React.FC<BugAnalysisViewProps> = ({
  currentProject,
  bugs,
  onAnalyzeBugs,
  onConvertToTestCase,
  onDeleteBug,
  onClearAllBugs,
  isAiConfigured,
  isAnalyzing,
}) => {
  const [featureDescription, setFeatureDescription] = useState('');
  const [componentCode, setComponentCode] = useState('');
  const [stagingUrl, setStagingUrl] = useState(currentProject.stagingUrl || '');
  const [forceDemoMode, setForceDemoMode] = useState(false);
  const [showCodeBox, setShowCodeBox] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedBugIds, setExpandedBugIds] = useState<Set<string>>(
    new Set(bugs.map((b) => b.id))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureDescription.trim()) return;

    await onAnalyzeBugs({
      featureDescription: featureDescription.trim(),
      componentCode: componentCode.trim(),
      stagingUrl: stagingUrl.trim(),
      forceDemoMode,
    });
  };

  const handleLoadSample = (sc: SampleScenario) => {
    setFeatureDescription(sc.description);
    setComponentCode(sc.componentCode);
    setStagingUrl(sc.stagingUrl);
    setShowCodeBox(true);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedBugIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedBugIds(next);
  };

  const handleCopyBug = async (bug: BugAnalysisItem) => {
    const text = `Potential Issue: [${bug.severity}] ${bug.title}
Affected Feature: ${bug.affectedFeature}
Category: ${bug.category}
Explanation: ${bug.explanation}
Reproduction Steps:
${bug.reproductionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
Expected Behavior: ${bug.expectedBehavior}
Actual Behavior: ${bug.actualBehavior}
Suggested Fix: ${bug.suggestedFix}
${bug.suggestedCodeSnippet ? `\nCode:\n${bug.suggestedCodeSnippet}` : ''}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(bug.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      searchQuery === '' ||
      bug.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.affectedFeature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.explanation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === 'All' || bug.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const criticalCount = bugs.filter((b) => b.severity === 'Critical').length;
  const highCount = bugs.filter((b) => b.severity === 'High').length;
  const mediumCount = bugs.filter((b) => b.severity === 'Medium').length;
  const lowCount = bugs.filter((b) => b.severity === 'Low').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Honesty & Security Static Analysis Disclaimer */}
      <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-4 flex items-start gap-3 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">
            Static QA Inspection & Heuristic Inference Notice
          </p>
          <p className="text-amber-200/90 leading-relaxed">
            The failure modes below are inferred from static inspection of the
            supplied description and HTML/component code. No code has been executed
            in live environments, and no external staging URLs were visited or
            attacked. Actual behavior is labeled as unverified static analysis.
          </p>
        </div>
      </div>

      {/* Analysis Trigger Form */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 lg:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-400" />
              <span>Static Bug & Vulnerability Risk Analysis</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect application logic for missing validation, unhandled exceptions, race conditions, and security risks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick load:</span>
            {SAMPLE_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleLoadSample(sc)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors"
              >
                {sc.name.split(' ')[0]} {sc.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="bug-desc"
              className="block text-xs font-semibold text-slate-200 mb-1.5"
            >
              Component Specification or User Flow <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="bug-desc"
              rows={3}
              required
              value={featureDescription}
              onChange={(e) => setFeatureDescription(e.target.value)}
              placeholder="e.g. Checkout payment form collecting card number, CVV, expiry date, and coupon code. Submits to payment gateway without CSRF token."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          {/* Staging URL Context */}
          <div>
            <label
              htmlFor="bug-staging-url"
              className="block text-xs font-semibold text-slate-200 mb-1"
            >
              Target Staging URL (Context Only)
            </label>
            <input
              id="bug-staging-url"
              type="url"
              value={stagingUrl}
              onChange={(e) => setStagingUrl(e.target.value)}
              placeholder="https://staging.app.example.com/checkout"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          {/* HTML / Component Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => setShowCodeBox(!showCodeBox)}
                className="text-xs font-semibold text-slate-200 hover:text-rose-300 flex items-center gap-1.5"
              >
                <span>Component / Form Code</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                  {componentCode ? `${componentCode.split('\n').length} lines` : 'empty'}
                </span>
                {showCodeBox ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            {showCodeBox && (
              <textarea
                rows={5}
                value={componentCode}
                onChange={(e) => setComponentCode(e.target.value)}
                placeholder="Paste HTML <form>, React handler, or API integration snippet..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-indigo-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            )}
          </div>

          {/* Engine & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={forceDemoMode}
                onChange={(e) => setForceDemoMode(e.target.checked)}
                className="rounded text-rose-600 focus:ring-0"
              />
              <span>Force Local Deterministic QA Heuristics Engine</span>
            </label>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Component Logic...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  <span>Run Bug & Risk Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Severity Breakdown Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
              Critical Risk
            </span>
            <span className="text-xl font-extrabold text-white font-mono">
              {criticalCount}
            </span>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              High Severity
            </span>
            <span className="text-xl font-extrabold text-white font-mono">
              {highCount}
            </span>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Medium Concern
            </span>
            <span className="text-xl font-extrabold text-white font-mono">
              {mediumCount}
            </span>
          </div>
          <Info className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Low / Cosmetic
            </span>
            <span className="text-xl font-extrabold text-white font-mono">
              {lowCount}
            </span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Results Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bug findings by title, feature, or description..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>

          <button
            onClick={() => exportBugsToMarkdown(filteredBugs)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={() => exportBugsToJson(filteredBugs)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>JSON</span>
          </button>

          {bugs.length > 0 && (
            <button
              onClick={onClearAllBugs}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
              title="Clear all bug findings"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bugs List */}
      {filteredBugs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-950/40">
          <Bug className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300">
            No static bug risks recorded
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Run an analysis using the form above or load a sample scenario to inspect potential failure modes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBugs.map((bug, index) => {
            const isExpanded = expandedBugIds.has(bug.id);
            const isCopied = copiedId === bug.id;

            const severityBadge =
              bug.severity === 'Critical'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : bug.severity === 'High'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : bug.severity === 'Medium'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700';

            return (
              <div
                key={`${bug.id}_${index}`}
                className="rounded-xl border border-slate-800/80 bg-slate-900/70 hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {bug.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${severityBadge}`}
                      >
                        {bug.severity} Risk
                      </span>
                      <span className="text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                        {bug.category}
                      </span>
                      <span className="text-xs text-indigo-400 font-medium">
                        Feature: {bug.affectedFeature}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{bug.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Convert to Regression Test button */}
                    <button
                      onClick={() => onConvertToTestCase(bug)}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Generate a regression test case for this potential issue"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Convert to Test Case</span>
                    </button>

                    <button
                      onClick={() => handleCopyBug(bug)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Copy bug details"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteBug(bug.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                      title="Delete bug item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleExpand(bug.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Explanation */}
                <div className="px-4 py-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50">
                  <p>{bug.explanation}</p>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-800/60 bg-slate-950/50 p-4 space-y-4 text-xs">
                    {/* Reproduction Steps */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Reproduction Steps (Hypothetical Walkthrough)
                      </span>
                      <ol className="space-y-1 text-slate-300">
                        {bug.reproductionSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-mono text-rose-400 font-semibold shrink-0">
                              {idx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Expected vs Actual Behavior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          Expected Robust Behavior
                        </span>
                        <p className="text-slate-200">{bug.expectedBehavior}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                          Actual Behavior (Static Inspection)
                        </span>
                        <p className="text-amber-200/90 font-mono text-[11px]">
                          {bug.actualBehavior}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Fix */}
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-indigo-900/30">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                        Recommended Remediation
                      </span>
                      <p className="text-slate-200 leading-relaxed mb-2">
                        {bug.suggestedFix}
                      </p>

                      {bug.suggestedCodeSnippet && (
                        <div className="mt-2">
                          <span className="text-[10px] text-slate-400 font-mono block mb-1">
                            Suggested Code Patch:
                          </span>
                          <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto">
                            <code>{bug.suggestedCodeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
