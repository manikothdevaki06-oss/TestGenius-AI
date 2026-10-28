# TestGenius AI — AI-Powered Web Test Case & Bug Script Generator

> A production-grade web QA developer dashboard that transforms component specifications and HTML into structured positive, negative, boundary, validation, accessibility, and security test cases, static bug risk assessments, and executable Playwright Python test automation suites.

---

## 🚀 Key Features

1. **Structured Test Case Generator**
   - Inputs: Feature description (required), optional HTML/component markup, optional staging URL, test category checklist, priority filter, and browser target.
   - Generates structured test cases with IDs, titles, objectives, preconditions, numbered test steps, concrete test data, expected results, priority, and category.
   - Interactive status lifecycle: cycle tests through **Not Run → Passed → Failed → Blocked → Skipped** with live metric counters updated on the dashboard.
   - Search, multi-criteria filtering, full test editing modal, and single or bulk export (JSON, CSV, Markdown).

2. **Static Bug & Risk Analysis**
   - Heuristic inspection for plausible failure modes, missing validation, inconsistent error handling, double-submission race conditions, missing ARIA live regions, and CSRF/security risks.
   - **Honesty & Transparency Guarantee**: All actual behaviors are clearly labeled as `(Inferred from static code inspection - unverified on live servers)`. No live servers are touched or attacked.
   - One-click **Convert to Regression Test Case** action that feeds findings directly into the QA test suite.
   - Export bug analysis reports in Markdown or JSON.

3. **Playwright Python Automation Suite Generator**
   - Converts selected test cases into copyable and downloadable Python scripts (`.py`).
   - Uses `pytest` fixtures, browser context isolation, explicit assertions (`expect(...)`), and accessible locator prioritization (`page.get_by_role`, `page.get_by_label`, `page.locator`).
   - Includes full setup instructions for running locally or in CI/CD (`pip install pytest pytest-playwright playwright && playwright install`).

4. **Dual Engine Architecture (Gemini AI + Deterministic Local QA Engine)**
   - **Gemini 3.8 Flash (Server-Side)**: When `GEMINI_API_KEY` is configured, calls are executed server-side via Express with structured JSON schema validation. API keys are never exposed to browser bundles.
   - **Deterministic QA Heuristics Engine (Demo Mode)**: If no API key is configured or if the user clicks "Force Deterministic Engine", the built-in deterministic heuristic engine parses HTML inputs, attributes (`required`, `minlength`, `pattern`, password fields), and keywords locally. Results are never falsely labeled as AI.

5. **Project Management & Local Persistence**
   - Organize test cases by project or feature flow (e.g. *SaaS Auth Suite*, *E-Commerce Checkout*).
   - Real-time audit activity trail logging generation runs, bug detections, and status changes.
   - Safe local storage persistence without storing private credentials.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, tsx
- **AI Integration**: Google Gen AI TypeScript SDK (`@google/genai`) using `gemini-3.8-flash`
- **Automation Framework**: Playwright (Python) + pytest

---

## ⚙️ Environment Variables & Configuration

Copy `.env.example` to `.env`:

```bash
# GEMINI_API_KEY: Optional. Enables server-side Gemini 3.8 Flash test case and bug generation.
# If omitted or left as placeholder, TestGenius AI runs seamlessly in Deterministic Demo Mode.
GEMINI_API_KEY="your_gemini_api_key_here"

# PORT: The port to run the Express and Vite server on (default 3000)
PORT=3000
```

> **Note**: In AI Studio, the `GEMINI_API_KEY` is automatically injected from the Secrets panel. In local development, simply set it in `.env`.

---

## 🏃 Getting Started

### Development
Start the unified full-stack server (runs on `http://localhost:3000`):

```bash
npm run dev
```

### Production Build
Build client assets:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Type Checking & Lint
```bash
npm run lint
```

---

## 🎭 Running Generated Playwright Python Scripts

1. Ensure Python 3.9+ is installed:
   ```bash
   python --version
   ```

2. Install Playwright and pytest dependencies:
   ```bash
   pip install pytest pytest-playwright playwright
   ```

3. Download browser binaries:
   ```bash
   playwright install chromium
   ```

4. Run the downloaded test suite in headed mode:
   ```bash
   pytest -v --headed test_suite.py
   ```

5. Run in headless mode for CI/CD pipelines:
   ```bash
   pytest -v test_suite.py
   ```

---

## 🔒 Security & Safe Practice

- All HTML inputs, component snippets, and staging URLs are treated as untrusted context.
- Untrusted user code is never evaluated with `eval()` or executed in the browser DOM.
- No network requests or form submissions are dispatched to external staging URLs.
- No secrets, tokens, or passwords are saved to localStorage.
