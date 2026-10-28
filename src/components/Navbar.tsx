import React, { useState } from 'react';
import {
  Menu,
  FolderGit2,
  Plus,
  PlayCircle,
  FileCode,
  Download,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Project } from '../types';
import { SAMPLE_SCENARIOS, SampleScenario } from '../services/sampleData';

interface NavbarProps {
  currentProject: Project;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onLoadScenario: (scenario: SampleScenario) => void;
  onOpenExportModal: () => void;
  onOpenGuideModal: () => void;
  onToggleMobileNav: () => void;
  activeTabTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onCreateProject,
  onLoadScenario,
  onOpenExportModal,
  onOpenGuideModal,
  onToggleMobileNav,
  activeTabTitle,
}) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile menu toggle & Active Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base lg:text-lg font-bold text-slate-100 tracking-tight">
            {activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Center/Right: Project Switcher & Quick Scenario Loader */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Sample Scenario Quick Loader */}
        <div className="relative">
          <button
            onClick={() => {
              setShowScenarioDropdown(!showScenarioDropdown);
              setShowProjectDropdown(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/30 transition-all shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Load Sample</span>
            <span className="sm:hidden">Sample</span>
            <ChevronDown className="w-3 h-3 text-violet-400" />
          </button>

          {showScenarioDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant QA Scenarios
              </div>
              <div className="space-y-1">
                {SAMPLE_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      onLoadScenario(sc);
                      setShowScenarioDropdown(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors flex flex-col group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300">
                        {sc.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {sc.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {sc.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProjectDropdown(!showProjectDropdown);
              setShowScenarioDropdown(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[110px] sm:max-w-[160px] truncate">
              {currentProject.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProjectDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Projects
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                      proj.id === currentProject.id
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    {proj.id === currentProject.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 mt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowProjectDropdown(false);
                    onCreateProject();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-950/40 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Project</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Playwright Python Setup Quick Guide */}
        <button
          onClick={onOpenGuideModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Playwright & pytest setup guidelines"
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Playwright Guide</span>
        </button>

        {/* Global Export Modal */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-900 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Suite</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>
    </header>
  );
};
