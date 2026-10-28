import React from 'react';
import {
  FlaskConical,
  Bug,
  Code2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Terminal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { TestCase, BugAnalysisItem, GeneratedScript, HistoryActivity, Project } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  currentProject: Project;
  testCases: TestCase[];
  bugs: BugAnalysisItem[];
  scripts: GeneratedScript[];
  history: HistoryActivity[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenScenarioModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentProject,
  testCases,
  bugs,
  scripts,
  history,
  onNavigateTab,
  onOpenScenarioModal,
}) => {
  // Real state calculation
  const totalCases = testCases.length;
  const passedCases = testCases.filter((tc) => tc.status === 'Passed').length;
  const failedCases = testCases.filter((tc) => tc.status === 'Failed').length;
  const blockedCases = testCases.filter((tc) => tc.status === 'Blocked').length;
  const notRunCases = testCases.filter((tc) => tc.status === 'Not Run').length;

  const executionRate =
    totalCases > 0
      ? Math.round(((totalCases - notRunCases) / totalCases) * 100)
      : 0;

  const criticalBugs = bugs.filter((b) => b.severity === 'Critical').length;
  const highBugs = bugs.filter((b) => b.severity === 'High').length;
  const mediumBugs = bugs.filter((b) => b.severity === 'Medium').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950 border border-indigo-500/20 p-6 lg:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Project QA Command Center</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {currentProject.name}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentProject.description ||
                'Automated test generation, static failure mode analysis, and Playwright test automation.'}
            </p>
            {currentProject.stagingUrl && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span className="text-slate-500">Target:</span>
                <span className="text-indigo-300 truncate max-w-sm">
                  {currentProject.stagingUrl}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Untrusted Static Context
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('generator')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Generate Test Cases</span>
            </button>
            <button
              onClick={() => onNavigateTab('bugs')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Analyze Bugs</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - All derived strictly from real state */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Test Cases */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Test Cases
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {totalCases}
            </span>
            <span className="text-xs text-slate-400 font-medium">defined</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{passedCases} pass</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{failedCases} fail</span>
            <span>•</span>
            <span className="text-slate-500">{notRunCases} pending</span>
          </div>
        </div>

        {/* Potential Bugs */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Inferred Bug Risks
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {bugs.length}
            </span>
            <span className="text-xs text-rose-300 font-medium">
              {criticalBugs > 0 ? `${criticalBugs} critical` : 'static analysis'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-rose-400">{criticalBugs} crit</span>
            <span>•</span>
            <span className="text-amber-400">{highBugs} high</span>
            <span>•</span>
            <span className="text-cyan-400">{mediumBugs} med</span>
          </div>
        </div>

        {/* Playwright Python Scripts */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Automation Suites
            </span>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {scripts.length}
            </span>
            <span className="text-xs text-cyan-300 font-medium">Python suites</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Ready for pytest / CI</span>
          </div>
        </div>

        {/* Execution Rate */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Execution Progress
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {executionRate}%
            </span>
            <span className="text-xs text-emerald-300 font-medium">executed</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${executionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Row: Quick Launchers & Test Execution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Action Workflows & Test Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Cards */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigateTab('generator')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/10 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    Generate Test Cases
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Positive, negative, boundary, validation, a11y, and security test cases.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-semibold mt-3">
                  <span>Open Generator</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('bugs')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/10 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Bug className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-rose-300">
                    Analyze Plausible Bugs
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Static heuristic check for missing CSRF, unhandled rejections, race conditions.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold mt-3">
                  <span>Run Analysis</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('scripts')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/10 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    Draft Playwright Scripts
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Convert selected test cases into copyable and runnable Playwright Python code.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold mt-3">
                  <span>Build Script</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Test Case Status Breakdown Bar */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Test Case Execution Status
              </h3>
              <button
                onClick={() => onNavigateTab('generator')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>View All ({totalCases})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {totalCases === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No test cases generated yet. Click "Generate Test Cases" or load a sample scenario.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Segmented bar */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  {passedCases > 0 && (
                    <div
                      style={{ width: `${(passedCases / totalCases) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title={`Passed: ${passedCases}`}
                    />
                  )}
                  {failedCases > 0 && (
                    <div
                      style={{ width: `${(failedCases / totalCases) * 100}%` }}
                      className="bg-rose-500 h-full transition-all"
                      title={`Failed: ${failedCases}`}
                    />
                  )}
                  {blockedCases > 0 && (
                    <div
                      style={{ width: `${(blockedCases / totalCases) * 100}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title={`Blocked: ${blockedCases}`}
                    />
                  )}
                  {notRunCases > 0 && (
                    <div
                      style={{ width: `${(notRunCases / totalCases) * 100}%` }}
                      className="bg-slate-700 h-full transition-all"
                      title={`Not Run: ${notRunCases}`}
                    />
                  )}
                </div>

                {/* Legend Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-slate-300">Passed</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {passedCases}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-slate-300">Failed</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-rose-400">
                      {failedCases}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-slate-300">Blocked</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {blockedCases}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-300">Not Run</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {notRunCases}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Activity Timeline */}
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Activity</span>
              </h3>
              <span className="text-[11px] text-slate-500">Real-time log</span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No recent activity recorded.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                {history.slice(0, 8).map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs space-y-1 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded font-mono ${
                          act.type === 'generate_tests'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : act.type === 'analyze_bugs'
                            ? 'bg-rose-500/20 text-rose-300'
                            : act.type === 'generate_script'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {act.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium leading-snug">
                      {act.summary}
                    </p>
                    {act.details && (
                      <p className="text-[11px] text-slate-400">{act.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
