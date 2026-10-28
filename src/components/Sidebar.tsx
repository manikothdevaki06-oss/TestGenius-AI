import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Bug,
  Code2,
  History,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'generator'
  | 'bugs'
  | 'scripts'
  | 'history';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isAiConfigured: boolean;
  onOpenEngineModal: () => void;
  testCasesCount: number;
  bugsCount: number;
  scriptsCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isAiConfigured,
  onOpenEngineModal,
  testCasesCount,
  bugsCount,
  scriptsCount,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'generator' as NavTab,
      label: 'Generate Tests',
      icon: FlaskConical,
      badge: testCasesCount > 0 ? testCasesCount : null,
    },
    {
      id: 'bugs' as NavTab,
      label: 'Bug Analysis',
      icon: Bug,
      badge: bugsCount > 0 ? bugsCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'scripts' as NavTab,
      label: 'Script Generator',
      icon: Code2,
      badge: scriptsCount > 0 ? scriptsCount : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'history' as NavTab,
      label: 'History & Projects',
      icon: History,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } backdrop-blur-xl`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-100 tracking-tight">
                  TestGenius
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                QA & Test Automation Suite
              </p>
            </div>
          </div>
        </div>

        {/* Engine status pill button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onOpenEngineModal}
            className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
              isAiConfigured
                ? 'bg-indigo-950/30 border-indigo-500/30 hover:border-indigo-500/60 text-indigo-200'
                : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isAiConfigured ? (
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
              ) : (
                <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div className="truncate">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAiConfigured
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-ping'
                        : 'bg-amber-400'
                    }`}
                  />
                  {isAiConfigured ? 'Gemini 3.8 Flash' : 'Demo Mode (Heuristics)'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {isAiConfigured ? 'AI Powered Server' : 'Deterministic QA Engine'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-transparent border border-indigo-500/40 text-white shadow-sm shadow-indigo-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                      item.badgeColor ||
                      'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Playwright Python Badge / Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
              <span>Playwright Python</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                pytest
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Export production-ready, readable tests with reliable page selectors.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
