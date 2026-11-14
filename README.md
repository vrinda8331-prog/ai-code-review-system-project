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
├── index.html
│
├── pages/
│   ├── dashboard.html
│   ├── analyzer.html
│   ├── results.html
│   └── reports.html
│
├── css/
│   └── style.css
│
├── assets/
│   └── images/
│
├── js/
│   ├── app.js
│   ├── dashboard.js
│   ├── editor.js
│   ├── fileManager.js
│   │
│   ├── engine/
│   │   ├── analyzer.js
│   │   ├── languageDetector.js
│   │   ├── bugDetector.js
│   │   ├── securityScanner.js
│   │   ├── qualityChecker.js
│   │   ├── scoringEngine.js
│   │   └── suggestionEngine.js
│   │
│   ├── reports/
│   │   └── reportGenerator.js
│   │
│   └── storage/
│       └── history.js
│
└── README.md
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, etc.).
- Code editor such as Visual Studio Code.
- Basic understanding of HTML, CSS, and JavaScript.

### Installation

**1. Clone the repository**

**2. Navigate to the project directory**

```bash
cd CodeLens-AI
```

**3. Open the project**

Open `index.html` directly in your browser.

Alternatively, use the VS Code Live Server extension for local development.

No package installation or backend configuration is required for Phase 1.

---

## Development Roadmap

| Phase | Development Focus | Status |
|---|---|---|
| 01 | Dashboard, sidebar and responsive UI | Planned |
| 02 | Code editor, file uploads and language detection | Planned |
| 03 | Bug detection engine | Planned |
| 04 | Security scanning engine | Planned |
| 05 | Code quality and maintainability analysis | Planned |
| 06 | Scoring and fix suggestions | Planned |
| 07 | Review history and report generation | Planned |
| 08 | Testing, optimization and deployment | Planned |
| 09 | Optional AI-powered analysis integration | Future |


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
