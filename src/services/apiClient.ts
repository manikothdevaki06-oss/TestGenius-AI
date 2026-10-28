/**
 * API Client for TestGenius AI
 * Dispatches requests to the server endpoints with automatic failover to client-side heuristics.
 */

import {
  TestCase,
  BugAnalysisItem,
  GeneratedScript,
  GenerateTestsPayload,
  AnalyzeBugsPayload,
  GenerateScriptPayload,
  ApiStatusResponse,
} from '../types';
import {
  generateDeterministicTestCases,
  analyzeDeterministicBugs,
  generatePlaywrightPythonScript,
} from './heuristicEngine';

export async function fetchApiStatus(): Promise<ApiStatusResponse> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      provider: 'demo',
      message: 'Running in Local Deterministic QA Mode (Server unreachable or key absent)',
    };
  }
}

export async function requestGenerateTests(
  payload: GenerateTestsPayload
): Promise<{ provider: string; testCases: TestCase[]; message: string; warning?: string }> {
  try {
    const res = await fetch('/api/generate-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.testCases) && data.testCases.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API request failed, falling back to local heuristic engine:', err);
  }

  // Client-side fallback
  const testCases = generateDeterministicTestCases(payload);
  return {
    provider: 'demo',
    testCases,
    message: 'Generated via Local Deterministic QA Engine',
    warning: payload.forceDemoMode
      ? undefined
      : 'Executed via Local QA Engine (server unreachable or API offline).',
  };
}

export async function requestAnalyzeBugs(
  payload: AnalyzeBugsPayload
): Promise<{ provider: string; bugs: BugAnalysisItem[]; message: string; warning?: string }> {
  try {
    const res = await fetch('/api/analyze-bugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.bugs) && data.bugs.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend bug analysis failed, falling back to local heuristic engine:', err);
  }

  const bugs = analyzeDeterministicBugs(payload);
  return {
    provider: 'demo',
    bugs,
    message: 'Static analysis inferred via Local Deterministic QA Engine',
  };
}

export async function requestGenerateScript(
  payload: GenerateScriptPayload
): Promise<{ provider: string; script: GeneratedScript; message: string }> {
  try {
    const res = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.script) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend script generation failed, using local builder:', err);
  }

  const script = generatePlaywrightPythonScript(payload);
  return {
    provider: 'playwright-generator',
    script,
    message: 'Playwright Python suite generated locally',
  };
}
