# CodeLens AI
### Intelligent Code Analysis & Security Review Platform

**CodeLens AI** is a frontend-based code review platform designed to analyze source code, identify potential bugs, detect common security vulnerabilities, evaluate code quality, and generate actionable improvement suggestions.

The platform provides a centralized dashboard where developers can review code, understand detected issues, calculate code quality scores, and export detailed analysis reports.

---

## Project Overview

CodeLens AI aims to simplify the code review process by combining static code analysis, security scanning, and code quality assessment into a single interface.

Users can paste source code or upload files, run automated analysis, inspect detected issues, and generate downloadable reports.

**Phase 1 focuses on a client-side static analysis engine built entirely with HTML, CSS, and Vanilla JavaScript.** AI-powered analysis is planned as a potential future enhancement.

##  Key Features

### 1. Code Analysis
- Paste source code directly into the editor.
- Upload source code files.
- Automatic programming language detection.
- Line-by-line code analysis.
- Identify unused variables and functions.
- Detect unreachable code and empty catch blocks.

### 2. Security Scanner
- Detect potentially unsafe `eval()` usage.
- Identify hardcoded credentials and secrets.
- Detect risky `innerHTML` patterns.
- Identify potential Cross-Site Scripting (XSS) patterns.
- Flag insecure random number generation.

### 3. Code Quality Assessment
- Function length analysis.
- Code duplication detection.
- Nested complexity evaluation.
- Naming convention checks.
- Maintainability assessment.

### 4. Intelligent Review Dashboard
- Overall code quality score.
- Security and bug severity indicators.
- Issue categorization.
- Detailed issue explanations.
- Suggested code improvements.
- Recent review history.

### 5. Report Generation
Export code review results in:
- HTML
- JSON
- PDF through browser print functionality

---

## System Architecture

The application follows a modular frontend architecture.

```text
              ┌──────────────────────┐
              │     CodeLens AI      │
              │      Dashboard       │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │    Code Input        │
              │  Paste / File Upload│
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │ Language Detection   │
              │  & Input Validation  │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │   Analysis Engine    │
              └──────────┬───────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼─────┐  ┌─────▼──────┐ ┌─────▼──────┐
     │   Bug    │  │  Security  │ │   Code     │
     │Detector  │  │  Scanner   │ │  Quality   │
     └────┬─────┘  └─────┬──────┘ └─────┬──────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
              ┌──────────▼───────────┐
              │  Scoring & Suggestion│
              │       Engine         │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │   Review Dashboard   │
              │  Issues & Fixes      │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │   Report Generator   │
              │   HTML / JSON / PDF  │
              └──────────────────────┘
```

## Code Quality Scoring

CodeLens AI uses a weighted scoring system with a maximum score of 100 points.

| Assessment Category | Weight |
|---|---:|
| Security | 40 Points |
| Bug Detection | 30 Points |
| Code Quality | 20 Points |
| Maintainability | 10 Points |
| **Total** | **100 Points** |

**Scoring Formula:**

```text
Final Score = max(0, 100 - Weighted Penalties)
```

Severity-based penalties are configurable and will be calibrated using test projects.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | UI styling and responsive design |
| Vanilla JavaScript | Application logic |
| File API | Source code file uploads |
| LocalStorage | Review history and local data |
| Blob API | Report generation and downloads |
| Canvas API | Browser-based visual elements |

No backend server is required for the initial version.

## Project Structure

```text
CodeLens-AI/
│
├── index.html                     # Main unified application dashboard & UI
├── server.js                      # Native Node.js HTTP server (Zero npm dependencies)
├── package.json                   # Project metadata and run scripts
│
├── pages/                         # Standalone modular page views
│   ├── dashboard.html
│   ├── analyzer.html
│   ├── results.html
│   └── reports.html
│
├── css/
│   └── style.css                  # Modern dark developer theme & responsive styles
│
├── assets/
│   └── images/
│
├── js/
│   ├── app.js                     # Main application controller & tab navigation
│   ├── dashboard.js               # Dashboard statistics & recent audits table
│   ├── editor.js                  # Line numbers, syntax helpers & code presets
│   ├── fileManager.js             # Drag-and-drop file upload & File API reader
│   │
│   ├── engine/
│   │   ├── analyzer.js            # Master analysis coordinator (Browser & Node.js)
│   │   ├── languageDetector.js    # Automatic language detection heuristics
│   │   ├── bugDetector.js         # Logic bugs, unhandled exceptions & dead code
│   │   ├── securityScanner.js     # Vulnerabilities, injection & insecure APIs
│   │   ├── securityLayer.js       # Live secret redaction, input sanitization & shield
│   │   ├── qualityChecker.js      # Nesting depth, function length & code hygiene
│   │   ├── scoringEngine.js       # 100-point score & grade calculator
│   │   └── suggestionEngine.js    # Remediation recommendations & code diffs
│   │
│   ├── reports/
│   │   └── reportGenerator.js     # Standalone HTML report, JSON & Print-to-PDF
│   │
│   └── storage/
│       └── history.js             # LocalStorage & backend history sync
│
├── scripts/
│   └── security-check.js          # Pre-push security auditor (zero leak validator)
│
├── samples/                       # Test files for quick analysis
│   ├── vulnerable-javascript.js   # Insecure JS sample (eval, XSS, loose equality)
│   ├── buggy-python.py            # Python sample (logic flaws, naming issues)
│   └── clean-javascript.js        # Production-grade clean code sample (Grade A+)
│
├── data/
│   └── history.json               # Backend review history persistence
│
└── README.md
```

---

## 🚀 How to Run CodeLens AI

CodeLens AI is built with pure **HTML5, CSS3, and Vanilla JavaScript** with zero mandatory external package installations. You can run it either using the **Native Node.js Server** or directly in your **Web Browser**.

### Prerequisites

- Modern Web Browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).
- *(Optional)* [Node.js](https://nodejs.org/) (v16 or higher) if running the backend server.

---

### Method 1: Using the Native Node.js Server (Recommended)

Running the native backend provides static file hosting, REST API endpoints (`/api/analyze`, `/api/health`, `/api/history`), HTTP security headers, and file-based audit persistence.

**1. Clone the repository:**
```bash
git clone https://github.com/vrinda8331-prog/ai-code-review-system-project.git
cd ai-code-review-system-project
```

**2. Start the server (No `npm install` needed!):**
```bash
node server.js
```
*Alternatively, if npm is configured:*
```bash
npm start
```

**3. Open in your browser:**
Navigate to:
```text
http://localhost:3000
```

> **Note:** The server uses Node's built-in `http`, `fs`, and `path` modules — no external npm dependencies required!

---

### Method 2: Pure Frontend / Direct Browser (No Server Required)

If you don't have Node.js installed or prefer a serverless client-side experience:

1. Clone or download the repository.
2. Double-click **`index.html`** or open it directly in any web browser.
3. *VS Code Users:* Right-click `index.html` and choose **"Open with Live Server"**.

The application automatically falls back to the in-browser client-side static analysis engine and saves review history in `localStorage`.

---

### 🛡️ Running the Pre-Push Security Audit

To ensure no sensitive secrets or credentials are leaked before pushing to GitHub (GitHub Push Protection compliant):

```bash
node scripts/security-check.js
```

This scans all tracked source files and reports any unmasked credentials or token patterns.

---

### 🧪 Testing with Sample Code

You can test the platform instantly using the built-in preset buttons in the editor, or by uploading files from the `samples/` directory:

| Sample File | Language | Purpose | Expected Score |
|---|---|---|:---:|
| `samples/vulnerable-javascript.js` | JavaScript | Tests detection of `eval()`, DOM XSS, unreachable code, loose equality | ~45/100 (Grade D) |
| `samples/buggy-python.py` | Python | Tests Python language detection, self-assignment, cryptic naming | ~73/100 (Grade B) |
| `samples/clean-javascript.js` | JavaScript | Tests clean, production-ready code with input sanitization | 100/100 (Grade A+) |

---

## Development Roadmap

| Phase | Development Focus | Status |
|---|---|---|
| 01 | Dashboard, sidebar and responsive UI | ✅ Completed |
| 02 | Code editor, file uploads and language detection | ✅ Completed |
| 03 | Bug detection engine | ✅ Completed |
| 04 | Security scanning engine & security layer | ✅ Completed |
| 05 | Code quality and maintainability analysis | ✅ Completed |
| 06 | Scoring and fix suggestions | ✅ Completed |
| 07 | Review history and report generation | ✅ Completed |
| 08 | Testing, optimization and deployment | 🔄 Active |
| 09 | Optional AI-powered analysis integration | 🔮 Future |


##  Future Enhancements

Potential future development directions include:

- AI-powered code explanations.
- Context-aware bug detection.
- Automated code fix recommendations.
- Advanced vulnerability analysis.
- Multi-language analysis support.
- GitHub repository integration.
- Pull request review automation.
- AI-generated code quality reports.

## 🎯 Project Objective

The objective of CodeLens AI is to make code reviews more accessible, structured, and efficient by bringing bug detection, security analysis, and code quality assessment into one unified platform.

---

## 👨‍💻 Author
**vrinda8331-prog** & 
**Ayush Gorlawar**

Developer | Technology Enthusiast

- GitHub: [vrinda8331](https://github.com/vrinda8331-prog)
- GitHub: [AyushGorlawar](https://github.com/AyushGorlawar)

---

<p align="center">
  <b>CodeLens AI — See Beyond the Code.</b>
  <br/>
  Built to make code cleaner, safer, and better.
</p>
