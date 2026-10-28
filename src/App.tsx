/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TestCaseGeneratorView } from './components/TestCaseGeneratorView';
import { BugAnalysisView } from './components/BugAnalysisView';
import { ScriptGeneratorView } from './components/ScriptGeneratorView';
import { HistoryView } from './components/HistoryView';
import { EditTestCaseModal } from './components/EditTestCaseModal';
import { ExportModal } from './components/ExportModal';
import { PlaywrightGuideModal } from './components/PlaywrightGuideModal';
import { EngineStatusModal } from './components/EngineStatusModal';
import { NewProjectModal } from './components/NewProjectModal';

import {
  TestCase,
  BugAnalysisItem,
  GeneratedScript,
  Project,
  HistoryActivity,
  TestCategory,
  BrowserTarget,
} from './types';
import {
  loadStoredData,
  saveStoredData,
  logActivity,
  resetToDefaults,
} from './services/storage';
import {
  fetchApiStatus,
  requestGenerateTests,
  requestAnalyzeBugs,
  requestGenerateScript,
} from './services/apiClient';
import { SampleScenario } from './services/sampleData';
import { downloadFile } from './utils/exporters';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
}

export default function App() {
  // Global persisted data
  const [data, setData] = useState(() => loadStoredData());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Engine status
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [engineMessage, setEngineMessage] = useState(
    'Checking AI provider status...'
  );

  // Loading states
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [isAnalyzingBugs, setIsAnalyzingBugs] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Selection state for passing to Script Generator
  const [scriptInitialCaseIds, setScriptInitialCaseIds] = useState<string[]>([]);

  // Modals
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    type: 'success' | 'info' | 'warning',
    title: string,
    message?: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Sync data with localStorage whenever data state changes
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  // Check server API status on mount
  useEffect(() => {
    fetchApiStatus()
      .then((status) => {
        setIsAiConfigured(status.configured);
        setEngineMessage(status.message);
      })
      .catch(() => {
        setIsAiConfigured(false);
        setEngineMessage(
          'Deterministic Demo Mode active (Local QA Heuristics Engine)'
        );
      });
  }, []);

  // Current project calculation
  const currentProject = useMemo(() => {
    const found = data.projects.find((p) => p.id === data.currentProjectId);
    return found || data.projects[0];
  }, [data.projects, data.currentProjectId]);

  // Project-filtered items
  const projectTestCases = useMemo(() => {
    return data.testCases.filter((tc) => tc.projectId === currentProject.id);
  }, [data.testCases, currentProject.id]);

  const projectBugs = useMemo(() => {
    return data.bugs.filter((b) => b.projectId === currentProject.id);
  }, [data.bugs, currentProject.id]);

  const projectScripts = useMemo(() => {
    return data.scripts.filter((s) => s.projectId === currentProject.id);
  }, [data.scripts, currentProject.id]);

  const projectHistory = useMemo(() => {
    return data.history.filter((h) => h.projectId === currentProject.id);
  }, [data.history, currentProject.id]);

  // Title for top navbar
  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Project Dashboard',
    generator: 'Test Case Generator',
    bugs: 'Bug & Vulnerability Analysis',
    scripts: 'Playwright Python Generator',
    history: 'History & Projects',
  };

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handleGenerateTests = async (payload: {
    featureDescription: string;
    componentCode?: string;
    stagingUrl?: string;
    testTypes: TestCategory[];
    priorityFilter: string;
    targetBrowser: BrowserTarget;
    forceDemoMode?: boolean;
  }) => {
    setIsGeneratingTests(true);
    try {
      const result = await requestGenerateTests({
        projectId: currentProject.id,
        ...payload,
      });

      const newCases = result.testCases;
      setData((prev) => {
        const existingIds = new Set(prev.testCases.map((c) => c.id));
        const uniqueNewCases = newCases.map((tc) => {
          let id = tc.id;
          let counter = 1;
          while (existingIds.has(id)) {
            id = `${tc.id}-${counter++}`;
          }
          existingIds.add(id);
          return { ...tc, id };
        });

        const nextCases = [...uniqueNewCases, ...prev.testCases];
        const newActivity: HistoryActivity = {
          id: `hist-${Date.now()}`,
          projectId: currentProject.id,
          type: 'generate_tests',
          summary: `Generated ${uniqueNewCases.length} test cases`,
          details: `Provider: ${result.provider} | Types: ${payload.testTypes.join(', ')}`,
          timestamp: new Date().toISOString(),
        };
        return {
          ...prev,
          testCases: nextCases,
          history: [newActivity, ...prev.history],
        };
      });

      addToast(
        'success',
        `Generated ${newCases.length} Test Cases!`,
        result.message
      );
    } catch (err: any) {
      addToast('warning', 'Generation failed', err?.message);
    } finally {
      setIsGeneratingTests(false);
    }
  };

  const handleAnalyzeBugs = async (payload: {
    featureDescription: string;
    componentCode?: string;
    stagingUrl?: string;
    forceDemoMode?: boolean;
  }) => {
    setIsAnalyzingBugs(true);
    try {
      const result = await requestAnalyzeBugs({
        projectId: currentProject.id,
        ...payload,
      });

      const newBugs = result.bugs;
      setData((prev) => {
        const existingBugIds = new Set(prev.bugs.map((b) => b.id));
        const uniqueNewBugs = newBugs.map((bug) => {
          let id = bug.id;
          let counter = 1;
          while (existingBugIds.has(id)) {
            id = `${bug.id}-${counter++}`;
          }
          existingBugIds.add(id);
          return { ...bug, id };
        });

        const nextBugs = [...uniqueNewBugs, ...prev.bugs];
        const newActivity: HistoryActivity = {
          id: `hist-${Date.now()}`,
          projectId: currentProject.id,
          type: 'analyze_bugs',
          summary: `Identified ${uniqueNewBugs.length} potential failure modes`,
          details: `Static heuristic analysis on ${currentProject.name}`,
          timestamp: new Date().toISOString(),
        };
        return {
          ...prev,
          bugs: nextBugs,
          history: [newActivity, ...prev.history],
        };
      });

      addToast(
        'success',
        `Analysis Complete: ${newBugs.length} Items Identified`,
        'Static QA heuristic evaluation recorded.'
      );
    } catch (err: any) {
      addToast('warning', 'Bug analysis failed', err?.message);
    } finally {
      setIsAnalyzingBugs(false);
    }
  };

  const handleGenerateScript = async (payload: {
    testCases: TestCase[];
    stagingUrl: string;
    targetBrowser: BrowserTarget;
    includeHeadless: boolean;
    takeScreenshots: boolean;
  }) => {
    setIsGeneratingScript(true);
    try {
      const result = await requestGenerateScript({
        projectId: currentProject.id,
        ...payload,
      });

      const script = result.script;
      setData((prev) => {
        const nextScripts = [script, ...prev.scripts];
        const newActivity: HistoryActivity = {
          id: `hist-${Date.now()}`,
          projectId: currentProject.id,
          type: 'generate_script',
          summary: `Compiled Playwright Python suite (${payload.testCases.length} tests)`,
          details: `Target browser: ${payload.targetBrowser}`,
          timestamp: new Date().toISOString(),
        };
        return {
          ...prev,
          scripts: nextScripts,
          history: [newActivity, ...prev.history],
        };
      });

      addToast(
        'success',
        'Playwright Python Suite Compiled',
        'Ready for execution via pytest or CI download.'
      );
    } catch (err: any) {
      addToast('warning', 'Script compilation failed', err?.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleUpdateTestCase = (updated: TestCase) => {
    setData((prev) => {
      const old = prev.testCases.find((tc) => tc.id === updated.id);
      const isStatusChanged = old && old.status !== updated.status;

      let historyUpdate = prev.history;
      if (isStatusChanged) {
        const act: HistoryActivity = {
          id: `hist-${Date.now()}`,
          projectId: currentProject.id,
          type: 'status_change',
          summary: `${updated.id} status changed to ${updated.status}`,
          details: `Title: ${updated.title}`,
          timestamp: new Date().toISOString(),
        };
        historyUpdate = [act, ...prev.history];
      }

      return {
        ...prev,
        testCases: prev.testCases.map((tc) =>
          tc.id === updated.id ? updated : tc
        ),
        history: historyUpdate,
      };
    });

    addToast('info', `Test Case ${updated.id} Updated`, `Status: ${updated.status}`);
  };

  const handleDeleteTestCase = (id: string) => {
    setData((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((tc) => tc.id !== id),
    }));
    addToast('info', 'Test Case Deleted', `Removed ${id}`);
  };

  const handleDeleteAllTestCases = () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all test cases in this project?'
      )
    ) {
      return;
    }
    setData((prev) => ({
      ...prev,
      testCases: prev.testCases.filter(
        (tc) => tc.projectId !== currentProject.id
      ),
    }));
    addToast('info', 'Test Cases Cleared', 'All project test cases removed.');
  };

  const handleConvertToTestCase = (bug: BugAnalysisItem) => {
    const now = new Date().toISOString();
    const newCase: TestCase = {
      id: `TG-REG-${Date.now().toString().slice(-4)}`,
      projectId: currentProject.id,
      title: `Regression: ${bug.title}`,
      objective: `Verify remediation for potential issue: ${bug.explanation.slice(0, 100)}...`,
      category:
        bug.category === 'Security Concern'
          ? 'Security'
          : bug.category === 'Accessibility Issue'
          ? 'Accessibility'
          : 'Negative',
      priority: bug.severity === 'Critical' ? 'Critical' : 'High',
      preconditions: [
        `Navigate to ${currentProject.stagingUrl || 'target staging endpoint'}`,
        'Inspect component state and security headers',
      ],
      steps: [
        ...bug.reproductionSteps,
        'Verify fix is in place and robust behavior is preserved',
      ],
      testData: 'Automated regression test input',
      expectedResult: bug.expectedBehavior,
      status: 'Not Run',
      generatedBy: 'heuristic-engine',
      targetBrowser: 'Chromium',
      createdAt: now,
      updatedAt: now,
    };

    setData((prev) => ({
      ...prev,
      testCases: [newCase, ...prev.testCases],
      history: [
        {
          id: `hist-${Date.now()}`,
          projectId: currentProject.id,
          type: 'generate_tests',
          summary: `Converted ${bug.id} to Regression Test Case ${newCase.id}`,
          timestamp: now,
        },
        ...prev.history,
      ],
    }));

    addToast(
      'success',
      'Converted to Regression Test!',
      `Created ${newCase.id}. View in Test Case Generator.`
    );
  };

  const handleDeleteBug = (id: string) => {
    setData((prev) => ({
      ...prev,
      bugs: prev.bugs.filter((b) => b.id !== id),
    }));
  };

  const handleClearAllBugs = () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all bug findings for this project?'
      )
    ) {
      return;
    }
    setData((prev) => ({
      ...prev,
      bugs: prev.bugs.filter((b) => b.projectId !== currentProject.id),
    }));
  };

  const handleSendToScriptGenerator = (selectedCases: TestCase[]) => {
    setScriptInitialCaseIds(selectedCases.map((tc) => tc.id));
    setActiveTab('scripts');
    addToast(
      'info',
      'Loaded into Script Generator',
      `${selectedCases.length} test cases selected for Python compilation.`
    );
  };

  const handleLoadScenario = (sc: SampleScenario) => {
    // Check if a project exists for this scenario or create/switch
    let targetProj = data.projects.find((p) => p.name.includes(sc.name.split(' ')[0]));
    if (!targetProj) {
      const newProj: Project = {
        id: `proj-${sc.id}`,
        name: sc.name,
        description: sc.description,
        stagingUrl: sc.stagingUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        projects: [...prev.projects, newProj],
        currentProjectId: newProj.id,
      }));
    } else {
      setData((prev) => ({
        ...prev,
        currentProjectId: targetProj!.id,
      }));
    }

    setActiveTab('generator');
    addToast('success', 'Scenario Loaded', sc.name);
  };

  const handleSelectProject = (id: string) => {
    setData((prev) => ({ ...prev, currentProjectId: id }));
  };

  const handleCreateProject = (
    name: string,
    description: string,
    stagingUrl: string
  ) => {
    const now = new Date().toISOString();
    const newProj: Project = {
      id: `proj-${Date.now().toString(36)}`,
      name,
      description,
      stagingUrl: stagingUrl || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
      currentProjectId: newProj.id,
    }));
    addToast('success', 'Project Created', name);
  };

  const handleDeleteProject = (id: string) => {
    if (data.projects.length <= 1) {
      alert('Cannot delete the only project in the workspace.');
      return;
    }
    if (!window.confirm('Delete this project and its test cases?')) return;

    setData((prev) => {
      const remaining = prev.projects.filter((p) => p.id !== id);
      return {
        ...prev,
        projects: remaining,
        currentProjectId: remaining[0].id,
        testCases: prev.testCases.filter((tc) => tc.projectId !== id),
        bugs: prev.bugs.filter((b) => b.projectId !== id),
        scripts: prev.scripts.filter((s) => s.projectId !== id),
        history: prev.history.filter((h) => h.projectId !== id),
      };
    });
    addToast('info', 'Project Deleted');
  };

  const handleResetWorkspace = () => {
    if (
      !window.confirm(
        'Reset workspace to sample defaults? All current test cases and projects will be replaced.'
      )
    ) {
      return;
    }
    const fresh = resetToDefaults();
    setData(fresh);
    addToast('info', 'Workspace Reset', 'Loaded sample defaults.');
  };

  const handleExportFullWorkspace = () => {
    const backupJson = JSON.stringify(data, null, 2);
    downloadFile(
      backupJson,
      `testgenius-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    addToast('success', 'Backup Downloaded');
  };

  const handleAddNewTestCase = () => {
    const now = new Date().toISOString();
    const customCase: TestCase = {
      id: `TG-CUSTOM-${Date.now().toString().slice(-4)}`,
      projectId: currentProject.id,
      title: 'New Custom Test Case',
      objective: 'Define test objective...',
      category: 'Functional',
      priority: 'Medium',
      preconditions: ['Navigate to application'],
      steps: ['Step 1: Enter valid input', 'Step 2: Submit form'],
      testData: 'Sample test input',
      expectedResult: 'System transitions as expected',
      status: 'Not Run',
      generatedBy: 'heuristic-engine',
      targetBrowser: 'Chromium',
      createdAt: now,
      updatedAt: now,
    };

    setEditingTestCase(customCase);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-200 ${
              t.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
                : t.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/95 border-indigo-500/50 text-indigo-200'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : t.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 min-w-0">
              <h5 className="font-bold text-xs text-slate-100">{t.title}</h5>
              {t.message && (
                <p className="text-[11px] text-slate-300 leading-snug">
                  {t.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAiConfigured={isAiConfigured}
          onOpenEngineModal={() => setShowEngineModal(true)}
          testCasesCount={projectTestCases.length}
          bugsCount={projectBugs.length}
          scriptsCount={projectScripts.length}
          isOpenMobile={isMobileNavOpen}
          setIsOpenMobile={setIsMobileNavOpen}
        />

        {/* Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          <Navbar
            currentProject={currentProject}
            projects={data.projects}
            onSelectProject={handleSelectProject}
            onCreateProject={() => setShowNewProjectModal(true)}
            onLoadScenario={handleLoadScenario}
            onOpenExportModal={() => setShowExportModal(true)}
            onOpenGuideModal={() => setShowGuideModal(true)}
            onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
            activeTabTitle={tabTitles[activeTab]}
          />

          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                currentProject={currentProject}
                testCases={projectTestCases}
                bugs={projectBugs}
                scripts={projectScripts}
                history={projectHistory}
                onNavigateTab={setActiveTab}
                onOpenScenarioModal={() => {}}
              />
            )}

            {activeTab === 'generator' && (
              <TestCaseGeneratorView
                currentProject={currentProject}
                testCases={projectTestCases}
                onGenerateTests={handleGenerateTests}
                onUpdateTestCase={handleUpdateTestCase}
                onDeleteTestCase={handleDeleteTestCase}
                onDeleteAllTestCases={handleDeleteAllTestCases}
                onSendToScriptGenerator={handleSendToScriptGenerator}
                isAiConfigured={isAiConfigured}
                isGenerating={isGeneratingTests}
                onOpenEditModal={(tc) => setEditingTestCase(tc)}
                onAddNewTestCase={handleAddNewTestCase}
              />
            )}

            {activeTab === 'bugs' && (
              <BugAnalysisView
                currentProject={currentProject}
                bugs={projectBugs}
                onAnalyzeBugs={handleAnalyzeBugs}
                onConvertToTestCase={handleConvertToTestCase}
                onDeleteBug={handleDeleteBug}
                onClearAllBugs={handleClearAllBugs}
                isAiConfigured={isAiConfigured}
                isAnalyzing={isAnalyzingBugs}
              />
            )}

            {activeTab === 'scripts' && (
              <ScriptGeneratorView
                currentProject={currentProject}
                testCases={projectTestCases}
                scripts={projectScripts}
                onGenerateScript={handleGenerateScript}
                isGenerating={isGeneratingScript}
                initialSelectedCaseIds={scriptInitialCaseIds}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                projects={data.projects}
                currentProject={currentProject}
                history={projectHistory}
                onSelectProject={handleSelectProject}
                onCreateProject={() => setShowNewProjectModal(true)}
                onDeleteProject={handleDeleteProject}
                onResetWorkspace={handleResetWorkspace}
                onExportFullWorkspace={handleExportFullWorkspace}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <EditTestCaseModal
        testCase={editingTestCase}
        isOpen={editingTestCase !== null}
        onClose={() => setEditingTestCase(null)}
        onSave={(updated) => {
          // If this was a new case not in list, append it
          const exists = data.testCases.some((tc) => tc.id === updated.id);
          if (exists) {
            handleUpdateTestCase(updated);
          } else {
            setData((prev) => ({
              ...prev,
              testCases: [updated, ...prev.testCases],
            }));
            addToast('success', 'Custom Test Case Created', updated.id);
          }
        }}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        testCases={projectTestCases}
        latestScript={projectScripts.length > 0 ? projectScripts[0] : null}
      />

      <PlaywrightGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      <EngineStatusModal
        isOpen={showEngineModal}
        onClose={() => setShowEngineModal(false)}
        isAiConfigured={isAiConfigured}
        statusMessage={engineMessage}
      />

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
