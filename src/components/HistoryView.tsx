import React, { useState } from 'react';
import {
  History,
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  Download,
  RotateCcw,
  Clock,
  HardDrive,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Project, HistoryActivity } from '../types';
import { downloadFile } from '../utils/exporters';

interface HistoryViewProps {
  projects: Project[];
  currentProject: Project;
  history: HistoryActivity[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onResetWorkspace: () => void;
  onExportFullWorkspace: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  projects,
  currentProject,
  history,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onResetWorkspace,
  onExportFullWorkspace,
}) => {
  const [filterType, setFilterType] = useState<string>('All');

  const filteredHistory = history.filter((item) => {
    if (filterType === 'All') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Row: Project Manager & Workspace Storage Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects Manager */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span>Projects & Suites Directory</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Organize tests and bug reports per application or feature flow.
              </p>
            </div>

            <button
              onClick={onCreateProject}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.map((proj) => {
              const isCurrent = proj.id === currentProject.id;
              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-indigo-950/20 border-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-200 truncate">
                        {proj.name}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Active Project
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {proj.description || 'No description provided.'}
                    </p>
                    {proj.stagingUrl && (
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {proj.stagingUrl}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isCurrent && (
                      <button
                        onClick={() => onSelectProject(proj.id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                      >
                        Switch To
                      </button>
                    )}

                    {projects.length > 1 && (
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Workspace Storage & Backup */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Workspace & Persistence</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Storage engine:</span>
                <span className="text-slate-200 font-mono">Browser LocalStorage</span>
              </div>
              <div className="flex justify-between">
                <span>Total Projects:</span>
                <span className="text-slate-200 font-mono">{projects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Activity Entries:</span>
                <span className="text-slate-200 font-mono">{history.length}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              All project specifications, test cases, bug evaluations, and Playwright scripts are stored locally in your browser. No private passwords or secrets are retained.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={onExportFullWorkspace}
              className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Workspace (JSON)</span>
            </button>

            <button
              onClick={onResetWorkspace}
              className="w-full py-2 rounded-lg bg-slate-950 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Audit Trail */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Activity Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of generation runs, bug detections, and export events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="All">All Events</option>
              <option value="generate_tests">Test Generation</option>
              <option value="analyze_bugs">Bug Analysis</option>
              <option value="generate_script">Script Generation</option>
              <option value="status_change">Status Updates</option>
              <option value="export">Exports</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No events match the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto pr-1">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded font-mono ${
                        item.type === 'generate_tests'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : item.type === 'analyze_bugs'
                          ? 'bg-rose-500/20 text-rose-300'
                          : item.type === 'generate_script'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {item.summary}
                    </span>
                  </div>
                  {item.details && (
                    <p className="text-slate-400 text-[11px] pl-1">
                      {item.details}
                    </p>
                  )}
                </div>

                <span className="text-[11px] text-slate-500 font-mono shrink-0">
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
