/**
 * Core type definitions for TestGenius AI
 */

export type TestCategory =
  | 'Functional'
  | 'Validation'
  | 'Negative'
  | 'Boundary'
  | 'Accessibility'
  | 'Security';

export type TestPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TestStatus = 'Not Run' | 'Passed' | 'Failed' | 'Blocked' | 'Skipped';

export type BrowserTarget =
  | 'Chromium'
  | 'Firefox'
  | 'WebKit'
  | 'Mobile Safari'
  | 'Mobile Chrome';

export interface TestCase {
  id: string; // e.g. TG-AUTH-001
  projectId: string;
  title: string;
  objective: string;
  category: TestCategory;
  priority: TestPriority;
  preconditions: string[];
  steps: string[];
  testData: string;
  expectedResult: string;
  status: TestStatus;
  executionNotes?: string;
  generatedBy: 'gemini' | 'heuristic-engine';
  targetBrowser: BrowserTarget;
  createdAt: string;
  updatedAt: string;
}

export type BugSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type BugCategory =
  | 'Failure Mode'
  | 'Validation Gap'
  | 'Error Handling'
  | 'Security Concern'
  | 'Accessibility Issue';

export interface BugAnalysisItem {
  id: string;
  projectId: string;
  title: string;
  severity: BugSeverity;
  category: BugCategory;
  affectedFeature: string;
  explanation: string;
  reproductionSteps: string[];
  expectedBehavior: string;
  actualBehavior: string; // Note: Labeled as unverified static analysis
  suggestedFix: string;
  suggestedCodeSnippet?: string;
  isStaticInference: boolean; // Always true for static inspection
  createdAt: string;
}

export interface GeneratedScript {
  id: string;
  projectId: string;
  title: string;
  testCaseIds: string[];
  framework: 'playwright-python';
  pythonCode: string;
  assumptions: string[];
  setupInstructions: string;
  targetBrowser: BrowserTarget;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stagingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryActivity {
  id: string;
  projectId: string;
  type:
    | 'generate_tests'
    | 'analyze_bugs'
    | 'generate_script'
    | 'status_change'
    | 'export'
    | 'delete_item';
  summary: string;
  details?: string;
  timestamp: string;
}

export interface GenerateTestsPayload {
  projectId: string;
  featureDescription: string;
  componentCode?: string;
  stagingUrl?: string;
  testTypes: TestCategory[];
  priorityFilter: string; // 'All' | TestPriority
  targetBrowser: BrowserTarget;
  forceDemoMode?: boolean;
}

export interface AnalyzeBugsPayload {
  projectId: string;
  featureDescription: string;
  componentCode?: string;
  stagingUrl?: string;
  forceDemoMode?: boolean;
}

export interface GenerateScriptPayload {
  projectId: string;
  testCases: TestCase[];
  stagingUrl?: string;
  targetBrowser: BrowserTarget;
  includeHeadless: boolean;
  takeScreenshots: boolean;
  forceDemoMode?: boolean;
}

export interface ApiStatusResponse {
  configured: boolean;
  provider: 'gemini' | 'demo';
  model?: string;
  message: string;
}
