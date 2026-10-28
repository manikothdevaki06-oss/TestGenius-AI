/**
 * LocalStorage Persistence and State Manager for TestGenius AI
 * Safe handling of local storage without storing any secrets or credentials.
 */

import {
  Project,
  TestCase,
  BugAnalysisItem,
  GeneratedScript,
  HistoryActivity,
} from '../types';
import { SAMPLE_SCENARIOS } from './sampleData';
import {
  generateDeterministicTestCases,
  analyzeDeterministicBugs,
  generatePlaywrightPythonScript,
} from './heuristicEngine';

const STORAGE_KEY = 'testgenius_ai_v1_store';

interface StoredData {
  currentProjectId: string;
  projects: Project[];
  testCases: TestCase[];
  bugs: BugAnalysisItem[];
  scripts: GeneratedScript[];
  history: HistoryActivity[];
}

function getInitialData(): StoredData {
  const defaultProjectId = 'proj-auth-demo';
  const now = new Date().toISOString();

  const defaultProject: Project = {
    id: defaultProjectId,
    name: 'SaaS Authentication Suite',
    description:
      'End-to-end testing of user login, password rules, CSRF headers, and access controls.',
    stagingUrl: 'https://staging.app.example.com/login',
    createdAt: now,
    updatedAt: now,
  };

  // Seed with realistic test cases using the sample login scenario
  const sample = SAMPLE_SCENARIOS[0];
  const seededCases = generateDeterministicTestCases({
    projectId: defaultProjectId,
    featureDescription: sample.description,
    componentCode: sample.componentCode,
    stagingUrl: sample.stagingUrl,
    testTypes: [
      'Functional',
      'Validation',
      'Negative',
      'Boundary',
      'Accessibility',
      'Security',
    ],
    priorityFilter: 'All',
    targetBrowser: 'Chromium',
  });

  // Mark a few to simulate a real active project state
  if (seededCases.length > 2) {
    seededCases[0].status = 'Passed';
    seededCases[0].executionNotes = 'Verified against staging v2.4 build';
    seededCases[1].status = 'Passed';
    seededCases[2].status = 'Failed';
    seededCases[2].executionNotes = 'Password error label missing aria-live attribute';
  }

  const seededBugs = analyzeDeterministicBugs({
    projectId: defaultProjectId,
    featureDescription: sample.description,
    componentCode: sample.componentCode,
    stagingUrl: sample.stagingUrl,
  });

  const seededScript = generatePlaywrightPythonScript({
    projectId: defaultProjectId,
    testCases: seededCases.slice(0, 3),
    stagingUrl: sample.stagingUrl,
    targetBrowser: 'Chromium',
    includeHeadless: false,
    takeScreenshots: true,
  });

  const initialHistory: HistoryActivity[] = [
    {
      id: 'hist-seed-1',
      projectId: defaultProjectId,
      type: 'generate_tests',
      summary: `Generated ${seededCases.length} test cases for SaaS Auth Suite`,
      details: 'Deterministic QA Heuristics Engine',
      timestamp: now,
    },
    {
      id: 'hist-seed-2',
      projectId: defaultProjectId,
      type: 'analyze_bugs',
      summary: `Identified ${seededBugs.length} potential failure modes from static inspection`,
      timestamp: now,
    },
    {
      id: 'hist-seed-3',
      projectId: defaultProjectId,
      type: 'generate_script',
      summary: 'Generated Playwright Python automation suite with 3 test cases',
      timestamp: now,
    },
  ];

  return {
    currentProjectId: defaultProjectId,
    projects: [defaultProject],
    testCases: seededCases,
    bugs: seededBugs,
    scripts: [seededScript],
    history: initialHistory,
  };
}

function deduplicateTestCases(testCases: TestCase[]): TestCase[] {
  const seenIds = new Set<string>();
  return testCases.map((tc, idx) => {
    let id = tc.id;
    let counter = 1;
    while (seenIds.has(id)) {
      id = `${tc.id}-${counter++}`;
    }
    seenIds.add(id);
    return { ...tc, id };
  });
}

function deduplicateBugs(bugs: BugAnalysisItem[]): BugAnalysisItem[] {
  const seenIds = new Set<string>();
  return bugs.map((bug, idx) => {
    let id = bug.id;
    let counter = 1;
    while (seenIds.has(id)) {
      id = `${bug.id}-${counter++}`;
    }
    seenIds.add(id);
    return { ...bug, id };
  });
}

export function loadStoredData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      saveStoredData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.projects || parsed.projects.length === 0) {
      const initial = getInitialData();
      saveStoredData(initial);
      return initial;
    }

    // Cleanse any duplicate IDs that may have been saved previously
    const sanitizedTestCases = Array.isArray(parsed.testCases)
      ? deduplicateTestCases(parsed.testCases)
      : [];
    const sanitizedBugs = Array.isArray(parsed.bugs)
      ? deduplicateBugs(parsed.bugs)
      : [];

    const sanitizedData: StoredData = {
      ...parsed,
      testCases: sanitizedTestCases,
      bugs: sanitizedBugs,
    };

    return sanitizedData;
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
    return getInitialData();
  }
}

export function saveStoredData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage (quota or disabled):', err);
  }
}

export function logActivity(
  projectId: string,
  type: HistoryActivity['type'],
  summary: string,
  details?: string
): void {
  const data = loadStoredData();
  const newActivity: HistoryActivity = {
    id: `hist-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    projectId,
    type,
    summary,
    details,
    timestamp: new Date().toISOString(),
  };

  data.history = [newActivity, ...data.history.slice(0, 49)]; // keep 50 latest
  saveStoredData(data);
}

export function resetToDefaults(): StoredData {
  const initial = getInitialData();
  saveStoredData(initial);
  return initial;
}
