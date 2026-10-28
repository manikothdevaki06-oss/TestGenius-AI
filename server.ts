import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  generateDeterministicTestCases,
  analyzeDeterministicBugs,
  generatePlaywrightPythonScript,
} from './src/services/heuristicEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security and parser middleware
app.use(express.json({ limit: '10mb' }));

// Detect if Gemini API Key is configured and not default placeholder
const rawApiKey = process.env.GEMINI_API_KEY;
const isGeminiConfigured = Boolean(
  rawApiKey &&
    rawApiKey.trim() !== '' &&
    rawApiKey !== 'MY_GEMINI_API_KEY' &&
    rawApiKey !== 'undefined'
);

let aiClient: GoogleGenAI | null = null;
if (isGeminiConfigured) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: rawApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

/**
 * GET /api/status
 * Returns current AI provider configuration status
 */
app.get('/api/status', (req, res) => {
  res.json({
    configured: isGeminiConfigured && aiClient !== null,
    provider: isGeminiConfigured && aiClient !== null ? 'gemini' : 'demo',
    model: 'gemini-3.8-flash',
    message:
      isGeminiConfigured && aiClient !== null
        ? 'Gemini 3.8 Flash connected server-side'
        : 'Deterministic Demo Mode active (Local QA Heuristics Engine)',
  });
});

/**
 * POST /api/generate-tests
 * Generates structured test cases via Gemini or falls back to Heuristic Engine
 */
app.post('/api/generate-tests', async (req, res) => {
  try {
    const {
      projectId,
      featureDescription,
      componentCode = '',
      stagingUrl = '',
      testTypes = [
        'Functional',
        'Validation',
        'Negative',
        'Boundary',
        'Accessibility',
        'Security',
      ],
      priorityFilter = 'All',
      targetBrowser = 'Chromium',
      forceDemoMode = false,
    } = req.body;

    if (!featureDescription || typeof featureDescription !== 'string') {
      res.status(400).json({ error: 'Feature or form description is required.' });
      return;
    }

    // If client requested deterministic mode or no Gemini client is configured
    if (forceDemoMode || !aiClient) {
      const demoCases = generateDeterministicTestCases({
        projectId: projectId || 'proj-default',
        featureDescription,
        componentCode,
        stagingUrl,
        testTypes,
        priorityFilter,
        targetBrowser,
      });

      res.json({
        provider: 'demo',
        testCases: demoCases,
        message: 'Generated using Deterministic QA Heuristics Engine',
      });
      return;
    }

    // Call Gemini 3.8 Flash with structured schema
    const prompt = `You are a Principal QA Automation Engineer.
Generate comprehensive, realistic, and production-grade web test cases for the following application feature.

FEATURE DESCRIPTION:
${featureDescription}

${componentCode ? `OPTIONAL COMPONENT/HTML CODE:\n${componentCode}\n` : ''}
${stagingUrl ? `TARGET STAGING URL (Untrusted - do not execute):\n${stagingUrl}\n` : ''}

REQUESTED TEST CATEGORIES:
${testTypes.join(', ')}

TARGET BROWSER:
${targetBrowser}

REQUIREMENTS:
- Return 6 to 10 high-value test cases covering Happy Path (Functional), Input Validation, Negative Failure Scenarios, Boundary Conditions, Accessibility (WCAG 2.1), and Security Checks (XSS, CSRF, sensitive data masking).
- Each test case must have an explicit ID (e.g. TG-FUNC-001, TG-VAL-001, etc.), clear title, objective, preconditions list, numbered step-by-step instructions, concrete test data, expected result, priority ("Critical"|"High"|"Medium"|"Low"), and category ("Functional"|"Validation"|"Negative"|"Boundary"|"Accessibility"|"Security").
- Status must initially be "Not Run".
- Do not claim external live URL execution occurred.
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              objective: { type: Type.STRING },
              category: {
                type: Type.STRING,
                description:
                  'Functional, Validation, Negative, Boundary, Accessibility, or Security',
              },
              priority: {
                type: Type.STRING,
                description: 'Critical, High, Medium, or Low',
              },
              preconditions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              testData: { type: Type.STRING },
              expectedResult: { type: Type.STRING },
            },
            required: [
              'id',
              'title',
              'objective',
              'category',
              'priority',
              'steps',
              'expectedResult',
            ],
          },
        },
      },
    });

    const rawJson = response.text ? response.text.trim() : '[]';
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      console.warn('Failed to parse Gemini JSON response, falling back to heuristics.');
      parsed = [];
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const fallbackCases = generateDeterministicTestCases({
        projectId: projectId || 'proj-default',
        featureDescription,
        componentCode,
        stagingUrl,
        testTypes,
        priorityFilter,
        targetBrowser,
      });
      res.json({
        provider: 'demo-fallback',
        testCases: fallbackCases,
        message: 'Gemini returned empty results; applied Deterministic QA Engine fallback.',
      });
      return;
    }

    const now = new Date().toISOString();
    const formattedCases = parsed.map((item, index) => ({
      id: item.id || `TG-AI-${String(index + 1).padStart(3, '0')}`,
      projectId: projectId || 'proj-default',
      title: item.title || 'Untitled Test Case',
      objective: item.objective || 'Verify system behavior',
      category: item.category || 'Functional',
      priority: item.priority || 'Medium',
      preconditions: Array.isArray(item.preconditions) ? item.preconditions : [],
      steps: Array.isArray(item.steps) ? item.steps : [item.steps || 'Perform step'],
      testData: item.testData || 'Valid test data',
      expectedResult: item.expectedResult || 'Expected system outcome',
      status: 'Not Run' as const,
      generatedBy: 'gemini' as const,
      targetBrowser: targetBrowser || 'Chromium',
      createdAt: now,
      updatedAt: now,
    }));

    res.json({
      provider: 'gemini',
      testCases: formattedCases,
      message: 'Generated successfully with Gemini 3.8 Flash',
    });
  } catch (error: any) {
    console.error('Error generating tests:', error);
    // Safe deterministic fallback
    const fallbackCases = generateDeterministicTestCases({
      projectId: req.body?.projectId || 'proj-default',
      featureDescription: req.body?.featureDescription || 'Fallback Feature',
      componentCode: req.body?.componentCode || '',
      stagingUrl: req.body?.stagingUrl || '',
      testTypes: req.body?.testTypes || ['Functional', 'Validation'],
      priorityFilter: req.body?.priorityFilter || 'All',
      targetBrowser: req.body?.targetBrowser || 'Chromium',
    });

    res.json({
      provider: 'demo-fallback',
      testCases: fallbackCases,
      warning:
        'AI provider error encountered. Gracefully fell back to Deterministic QA Heuristics.',
      errorDetails: error?.message || 'Server error',
    });
  }
});

/**
 * POST /api/analyze-bugs
 * Performs static analysis for plausible failure modes, validation gaps, and security concerns
 */
app.post('/api/analyze-bugs', async (req, res) => {
  try {
    const {
      projectId,
      featureDescription,
      componentCode = '',
      stagingUrl = '',
      forceDemoMode = false,
    } = req.body;

    if (!featureDescription || typeof featureDescription !== 'string') {
      res.status(400).json({ error: 'Feature description is required.' });
      return;
    }

    if (forceDemoMode || !aiClient) {
      const demoBugs = analyzeDeterministicBugs({
        projectId: projectId || 'proj-default',
        featureDescription,
        componentCode,
        stagingUrl,
      });

      res.json({
        provider: 'demo',
        bugs: demoBugs,
        message: 'Static analysis inferred via Deterministic QA Engine',
      });
      return;
    }

    const prompt = `You are a Principal QA Security & Reliability Engineer performing STATIC CODE AND SPECIFICATION ANALYSIS.

FEATURE SPECIFICATION:
${featureDescription}

${componentCode ? `COMPONENT / HTML CODE (Untrusted input):\n${componentCode}\n` : ''}
${stagingUrl ? `TARGET STAGING URL (Untrusted - not executed):\n${stagingUrl}\n` : ''}

TASK:
Analyze the description and optional code for plausible failure modes, missing validation, inconsistent error handling, accessibility gaps, and potential security concerns.

CRITICAL INSTRUCTIONS & HONESTY RULES:
- Clearly distinguish potential issues inferred from static analysis from confirmed bugs.
- Label the actual behavior explicitly as "(Inferred from static code inspection - unverified on live servers)".
- Do not claim to have tested or executed the URL or code.
- Provide actionable reproduction steps and a concrete suggested fix with code snippet where applicable.
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              severity: {
                type: Type.STRING,
                description: 'Critical, High, Medium, or Low',
              },
              category: {
                type: Type.STRING,
                description:
                  'Failure Mode, Validation Gap, Error Handling, Security Concern, or Accessibility Issue',
              },
              affectedFeature: { type: Type.STRING },
              explanation: { type: Type.STRING },
              reproductionSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              expectedBehavior: { type: Type.STRING },
              actualBehavior: { type: Type.STRING },
              suggestedFix: { type: Type.STRING },
              suggestedCodeSnippet: { type: Type.STRING },
            },
            required: [
              'id',
              'title',
              'severity',
              'category',
              'affectedFeature',
              'explanation',
              'reproductionSteps',
              'expectedBehavior',
              'actualBehavior',
              'suggestedFix',
            ],
          },
        },
      },
    });

    const rawJson = response.text ? response.text.trim() : '[]';
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      console.warn('Failed to parse Gemini bug analysis JSON, using fallback.');
      parsed = [];
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const fallbackBugs = analyzeDeterministicBugs({
        projectId: projectId || 'proj-default',
        featureDescription,
        componentCode,
        stagingUrl,
      });
      res.json({
        provider: 'demo-fallback',
        bugs: fallbackBugs,
        message: 'Gemini returned empty results; applied Deterministic QA Engine fallback.',
      });
      return;
    }

    const now = new Date().toISOString();
    const formattedBugs = parsed.map((item, index) => ({
      id: item.id || `BUG-AI-${String(index + 1).padStart(3, '0')}`,
      projectId: projectId || 'proj-default',
      title: item.title || 'Potential Issue Identified',
      severity: item.severity || 'Medium',
      category: item.category || 'Failure Mode',
      affectedFeature: item.affectedFeature || 'Form Component',
      explanation: item.explanation || 'Static analysis detected potential risk.',
      reproductionSteps: Array.isArray(item.reproductionSteps)
        ? item.reproductionSteps
        : ['Inspect component markup', 'Submit invalid test data'],
      expectedBehavior: item.expectedBehavior || 'Expected robust validation',
      actualBehavior:
        item.actualBehavior ||
        '(Inferred from static code inspection - unverified on live servers)',
      suggestedFix: item.suggestedFix || 'Add client & server validation guards.',
      suggestedCodeSnippet: item.suggestedCodeSnippet || '',
      isStaticInference: true,
      createdAt: now,
    }));

    res.json({
      provider: 'gemini',
      bugs: formattedBugs,
      message: 'Bug analysis performed via Gemini 3.8 Flash',
    });
  } catch (error: any) {
    console.error('Error in bug analysis:', error);
    const fallbackBugs = analyzeDeterministicBugs({
      projectId: req.body?.projectId || 'proj-default',
      featureDescription: req.body?.featureDescription || 'Fallback Feature',
      componentCode: req.body?.componentCode || '',
      stagingUrl: req.body?.stagingUrl || '',
    });

    res.json({
      provider: 'demo-fallback',
      bugs: fallbackBugs,
      warning:
        'AI provider error encountered. Gracefully fell back to Deterministic QA Heuristics.',
      errorDetails: error?.message || 'Server error',
    });
  }
});

/**
 * POST /api/generate-script
 * Produces clean, readable Playwright Python test automation script
 */
app.post('/api/generate-script', async (req, res) => {
  try {
    const {
      projectId,
      testCases = [],
      stagingUrl = 'https://staging.app.example.com',
      targetBrowser = 'Chromium',
      includeHeadless = false,
      takeScreenshots = true,
      forceDemoMode = false,
    } = req.body;

    if (!Array.isArray(testCases) || testCases.length === 0) {
      res.status(400).json({ error: 'At least one test case is required to generate a script.' });
      return;
    }

    // Generate robust script via deterministic generator
    const script = generatePlaywrightPythonScript({
      projectId: projectId || 'proj-default',
      testCases,
      stagingUrl,
      targetBrowser,
      includeHeadless,
      takeScreenshots,
      forceDemoMode,
    });

    res.json({
      provider: 'playwright-generator',
      script,
      message: 'Playwright Python test suite compiled successfully',
    });
  } catch (error: any) {
    console.error('Error generating script:', error);
    res.status(500).json({
      error: 'Failed to generate Playwright Python test suite',
      details: error?.message,
    });
  }
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Serving
// -----------------------------------------------------------------------------
async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TestGenius AI server running at http://0.0.0.0:${PORT}`);
    console.log(`Gemini API Key configured: ${isGeminiConfigured}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
