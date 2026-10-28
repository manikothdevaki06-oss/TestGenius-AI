import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  Copy,
  Check,
  Download,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Play,
  RotateCcw,
  Plus,
} from 'lucide-react';
import {
  TestCase,
  TestCategory,
  TestPriority,
  TestStatus,
  BrowserTarget,
  Project,
} from '../types';
import { SAMPLE_SCENARIOS, SampleScenario } from '../services/sampleData';
import {
  exportTestCasesToJson,
  exportTestCasesToCsv,
  copyToClipboard,
} from '../utils/exporters';

interface TestCaseGeneratorViewProps {
  currentProject: Project;
  testCases: TestCase[];
  onGenerateTests: (payload: {
    featureDescription: string;
    componentCode?: string;
    stagingUrl?: string;
    testTypes: TestCategory[];
    priorityFilter: string;
    targetBrowser: BrowserTarget;
    forceDemoMode?: boolean;
  }) => Promise<void>;
  onUpdateTestCase: (testCase: TestCase) => void;
  onDeleteTestCase: (id: string) => void;
  onDeleteAllTestCases: () => void;
  onSendToScriptGenerator: (selectedCases: TestCase[]) => void;
  isAiConfigured: boolean;
  isGenerating: boolean;
  onOpenEditModal: (tc: TestCase) => void;
  onAddNewTestCase: () => void;
}

export const TestCaseGeneratorView: React.FC<TestCaseGeneratorViewProps> = ({
  currentProject,
  testCases,
  onGenerateTests,
  onUpdateTestCase,
  onDeleteTestCase,
  onDeleteAllTestCases,
  onSendToScriptGenerator,
  isAiConfigured,
  isGenerating,
  onOpenEditModal,
  onAddNewTestCase,
}) => {
  // Input form state
  const [featureDescription, setFeatureDescription] = useState('');
  const [componentCode, setComponentCode] = useState('');
  const [stagingUrl, setStagingUrl] = useState(currentProject.stagingUrl || '');
  const [selectedTypes, setSelectedTypes] = useState<TestCategory[]>([
    'Functional',
    'Validation',
    'Negative',
    'Boundary',
    'Accessibility',
    'Security',
  ]);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [targetBrowser, setTargetBrowser] = useState<BrowserTarget>('Chromium');
  const [forceDemoMode, setForceDemoMode] = useState(false);
  const [showCodeBox, setShowCodeBox] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // List filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());
  const [expandedCaseIds, setExpandedCaseIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allCategories: TestCategory[] = [
    'Functional',
    'Validation',
    'Negative',
    'Boundary',
    'Accessibility',
    'Security',
  ];

  const browserOptions: BrowserTarget[] = [
    'Chromium',
    'Firefox',
    'WebKit',
    'Mobile Safari',
    'Mobile Chrome',
  ];

  // Handle category toggle
  const toggleType = (cat: TestCategory) => {
    if (selectedTypes.includes(cat)) {
      if (selectedTypes.length === 1) return; // keep at least 1
      setSelectedTypes(selectedTypes.filter((t) => t !== cat));
    } else {
      setSelectedTypes([...selectedTypes, cat]);
    }
  };

  // Submit test generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureDescription.trim()) {
      setFormError('Feature or form description is required.');
      return;
    }
    setFormError(null);

    await onGenerateTests({
      featureDescription: featureDescription.trim(),
      componentCode: componentCode.trim(),
      stagingUrl: stagingUrl.trim(),
      testTypes: selectedTypes,
      priorityFilter,
      targetBrowser,
      forceDemoMode,
    });
  };

  // Preload sample scenario
  const handleLoadSample = (scenario: SampleScenario) => {
    setFeatureDescription(scenario.description);
    setComponentCode(scenario.componentCode);
    setStagingUrl(scenario.stagingUrl);
    setShowCodeBox(true);
    setFormError(null);
  };

  // Toggle single test status
  const handleCycleStatus = (tc: TestCase) => {
    const statuses: TestStatus[] = [
      'Not Run',
      'Passed',
      'Failed',
      'Blocked',
      'Skipped',
    ];
    const currentIndex = statuses.indexOf(tc.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onUpdateTestCase({
      ...tc,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Expand / collapse test details
  const toggleExpand = (id: string) => {
    const next = new Set(expandedCaseIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedCaseIds(next);
  };

  // Selection toggle
  const toggleSelectCase = (id: string) => {
    const next = new Set(selectedCaseIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedCaseIds(next);
  };

  // Filter test cases
  const filteredCases = testCases.filter((tc) => {
    const matchesSearch =
      searchQuery === '' ||
      tc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tc.testData.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || tc.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'All' || tc.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const allFilteredSelected =
    filteredCases.length > 0 &&
    filteredCases.every((tc) => selectedCaseIds.has(tc.id));

  const toggleSelectAllFiltered = () => {
    const next = new Set(selectedCaseIds);
    if (allFilteredSelected) {
      filteredCases.forEach((tc) => next.delete(tc.id));
    } else {
      filteredCases.forEach((tc) => next.add(tc.id));
    }
    setSelectedCaseIds(next);
  };

  const handleCopySingle = async (tc: TestCase) => {
    const text = `Test Case: ${tc.id} - ${tc.title}
Category: ${tc.category} | Priority: ${tc.priority} | Status: ${tc.status}
Objective: ${tc.objective}
Preconditions:
${tc.preconditions.map((p) => `- ${p}`).join('\n')}
Steps:
${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
Test Data: ${tc.testData}
Expected Result: ${tc.expectedResult}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(tc.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopySelectedMarkdown = async () => {
    const targetCases =
      selectedCaseIds.size > 0
        ? testCases.filter((tc) => selectedCaseIds.has(tc.id))
        : filteredCases;

    const md = targetCases
      .map(
        (tc) => `### ${tc.id}: ${tc.title}
- **Category**: ${tc.category} | **Priority**: ${tc.priority} | **Status**: ${tc.status}
- **Objective**: ${tc.objective}
- **Preconditions**: ${tc.preconditions.join('; ')}
- **Steps**:
${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}
- **Test Data**: \`${tc.testData}\`
- **Expected Result**: ${tc.expectedResult}
`
      )
      .join('\n---\n\n');

    await copyToClipboard(md);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Generator Input Section */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 lg:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
              <span>Generate Structured Test Cases</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify feature description and optional HTML to generate positive, negative, boundary, validation, a11y, and security test cases.
            </p>
          </div>

          {/* Quick sample scenario shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick load:</span>
            {SAMPLE_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleLoadSample(sc)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
              >
                {sc.name.split(' ')[0]} {sc.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Feature Description (Required) */}
          <div>
            <label
              htmlFor="feature-desc"
              className="block text-xs font-semibold text-slate-200 mb-1.5"
            >
              Feature or Form Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="feature-desc"
              rows={3}
              required
              value={featureDescription}
              onChange={(e) => {
                setFeatureDescription(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g. User login form requiring work email and min 8-char password, remember me checkbox, show/hide password toggle, and CSRF token header."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all font-sans"
            />
            {formError && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{formError}</p>
            )}
          </div>

          {/* Optional Staging URL (Untrusted input disclaimer) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="staging-url"
                className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <span>Optional Staging URL</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Context only — never visited automatically)
                </span>
              </label>
            </div>
            <div className="relative">
              <input
                id="staging-url"
                type="url"
                value={stagingUrl}
                onChange={(e) => setStagingUrl(e.target.value)}
                placeholder="https://staging.app.example.com/login"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>
                Security Notice: URLs are treated as untrusted context. No external live network hits or form submissions are executed.
              </span>
            </div>
          </div>

          {/* Optional HTML / Component Code Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => setShowCodeBox(!showCodeBox)}
                className="text-xs font-semibold text-slate-200 hover:text-indigo-300 flex items-center gap-1.5"
              >
                <span>Optional HTML or Component Code</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                  {componentCode ? `${componentCode.split('\n').length} lines` : 'empty'}
                </span>
                {showCodeBox ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {componentCode && (
                <button
                  type="button"
                  onClick={() => setComponentCode('')}
                  className="text-[11px] text-slate-500 hover:text-rose-400"
                >
                  Clear Code
                </button>
              )}
            </div>

            {showCodeBox && (
              <textarea
                rows={5}
                value={componentCode}
                onChange={(e) => setComponentCode(e.target.value)}
                placeholder="Paste HTML <form>, React JSX component, or input controls here..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-indigo-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            )}
          </div>

          {/* Test Types Selection (Multi-select pills) */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Test Categories to Cover
            </label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => {
                const isSelected = selectedTypes.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleType(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority, Browser, and Engine Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label
                htmlFor="priority-filter"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Priority Filter
              </label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical Only</option>
                <option value="High">High Only</option>
                <option value="Medium">Medium Only</option>
                <option value="Low">Low Only</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="browser-select"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Target Browser
              </label>
              <select
                id="browser-select"
                value={targetBrowser}
                onChange={(e) => setTargetBrowser(e.target.value as BrowserTarget)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              >
                {browserOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Generation Engine
              </label>
              <label className="flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceDemoMode}
                  onChange={(e) => setForceDemoMode(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span className="truncate">Force Deterministic Engine</span>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
            <div className="text-[11px] text-slate-400">
              {forceDemoMode ? (
                <span className="text-amber-400 font-medium">
                  Using local Deterministic QA Rules Engine (instant, reproducible).
                </span>
              ) : isAiConfigured ? (
                <span className="text-indigo-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Using Gemini 3.8 Flash (Server-Side).
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  Demo Mode Active (Local QA Heuristics Engine).
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Test Cases...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  <span>Generate Test Cases</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Test Cases Results List */}
      <div className="space-y-4">
        {/* Results Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test cases by ID, title, objective, or steps..."
              className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Not Run">Not Run</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Blocked">Blocked</option>
              <option value="Skipped">Skipped</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={onAddNewTestCase}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAllFiltered}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 font-medium"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {selectedCaseIds.size > 0
                  ? `Selected ${selectedCaseIds.size} of ${testCases.length}`
                  : 'Select All'}
              </span>
            </button>

            {selectedCaseIds.size > 0 && (
              <button
                onClick={() => setSelectedCaseIds(new Set())}
                className="text-slate-500 hover:text-slate-300 underline"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedCaseIds.size > 0 && (
              <button
                onClick={() => {
                  const selected = testCases.filter((tc) =>
                    selectedCaseIds.has(tc.id)
                  );
                  onSendToScriptGenerator(selected);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Script Selected ({selectedCaseIds.size})</span>
              </button>
            )}

            <button
              onClick={() => exportTestCasesToJson(filteredCases)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-colors"
              title="Download test cases as JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={() => exportTestCasesToCsv(filteredCases)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-colors"
              title="Download test cases as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleCopySelectedMarkdown}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-colors"
              title="Copy markdown table to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy MD</span>
            </button>

            {testCases.length > 0 && (
              <button
                onClick={onDeleteAllTestCases}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                title="Clear all test cases in current project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Test Cases Cards List */}
        {filteredCases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-950/40">
            <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300">
              No test cases match criteria
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Try adjusting your search query, status, or category filter, or generate new test cases above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setCategoryFilter('All');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs border border-slate-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((tc, index) => {
              const isSelected = selectedCaseIds.has(tc.id);
              const isExpanded = expandedCaseIds.has(tc.id);
              const isCopied = copiedId === tc.id;

              const statusColor =
                tc.status === 'Passed'
                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40'
                  : tc.status === 'Failed'
                  ? 'bg-rose-950/30 text-rose-300 border-rose-500/40'
                  : tc.status === 'Blocked'
                  ? 'bg-amber-950/30 text-amber-300 border-amber-500/40'
                  : tc.status === 'Skipped'
                  ? 'bg-purple-950/30 text-purple-300 border-purple-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              const priorityColor =
                tc.priority === 'Critical'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : tc.priority === 'High'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : tc.priority === 'Medium'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700';

              return (
                <div
                  key={`${tc.id}_${index}`}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900/90 border-indigo-500/60 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start md:items-center gap-3">
                      <button
                        onClick={() => toggleSelectCase(tc.id)}
                        className="mt-0.5 md:mt-0 text-slate-500 hover:text-slate-300"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-800/50 px-2 py-0.5 rounded">
                            {tc.id}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {tc.category}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${priorityColor}`}
                          >
                            {tc.priority}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {tc.targetBrowser}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">
                          {tc.title}
                        </h4>
                      </div>
                    </div>

                    {/* Status Toggle & Quick Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      {/* Interactive Status Pill Button (Click to toggle) */}
                      <button
                        onClick={() => handleCycleStatus(tc)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${statusColor} hover:brightness-125 cursor-pointer`}
                        title="Click to advance status: Not Run -> Passed -> Failed -> Blocked -> Skipped"
                      >
                        {tc.status}
                      </button>

                      <button
                        onClick={() => onOpenEditModal(tc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                        title="Edit test case"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCopySingle(tc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                        title="Copy details"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onSendToScriptGenerator([tc])}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                        title="Generate Playwright script for this test case"
                      >
                        <Code2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTestCase(tc.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Delete test case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(tc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand details'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Objective preview */}
                  <div className="px-4 pb-3 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Objective:</span>{' '}
                    {tc.objective}
                  </div>

                  {/* Expandable Details Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 bg-slate-950/50 p-4 space-y-3.5 text-xs">
                      {/* Preconditions */}
                      {tc.preconditions && tc.preconditions.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Preconditions
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                            {tc.preconditions.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Test Steps */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Step-by-Step Test Execution
                        </span>
                        <ol className="space-y-1 text-slate-300">
                          {tc.steps.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-mono text-indigo-400 font-semibold shrink-0">
                                {idx + 1}.
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Test Data & Expected Result */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Test Input Data
                          </span>
                          <code className="text-xs text-indigo-300 font-mono break-all block">
                            {tc.testData || 'Standard input values'}
                          </code>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Expected Result
                          </span>
                          <p className="text-xs text-emerald-300 font-medium">
                            {tc.expectedResult}
                          </p>
                        </div>
                      </div>

                      {/* Execution Notes (if any) */}
                      {tc.executionNotes && (
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
                          <span className="font-semibold text-slate-300">
                            Tester Notes:{' '}
                          </span>
                          {tc.executionNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
