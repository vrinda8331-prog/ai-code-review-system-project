/**
 * CodeLens AI - Master Analysis Coordinator
 * Combines language detection, static scans, scoring, and remediation suggestions.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const LanguageDetector = require('./languageDetector');
    const BugDetector = require('./bugDetector');
    const SecurityScanner = require('./securityScanner');
    const QualityChecker = require('./qualityChecker');
    const ScoringEngine = require('./scoringEngine');
    const SuggestionEngine = require('./suggestionEngine');
    module.exports = factory(LanguageDetector, BugDetector, SecurityScanner, QualityChecker, ScoringEngine, SuggestionEngine);
  } else {
    root.Analyzer = factory(
      root.LanguageDetector,
      root.BugDetector,
      root.SecurityScanner,
      root.QualityChecker,
      root.ScoringEngine,
      root.SuggestionEngine
    );
  }
})(typeof self !== 'undefined' ? self : this, function (
  LanguageDetector,
  BugDetector,
  SecurityScanner,
  QualityChecker,
  ScoringEngine,
  SuggestionEngine
) {
  'use strict';

  function analyze(code, filename = 'code.js', options = {}) {
    const startTime = Date.now();

    if (!code || typeof code !== 'string' || !code.trim()) {
      return {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
        filename,
        language: 'Plain Text',
        code: '',
        linesOfCode: 0,
        characterCount: 0,
        score: 100,
        grade: 'A+',
        gradeLabel: 'No code provided',
        gradeColor: '#10b981',
        metrics: {
          security: { score: 40, max: 40 },
          bugs: { score: 30, max: 30 },
          quality: { score: 20, max: 20 },
          maintainability: { score: 10, max: 10 }
        },
        severityCounts: { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 },
        issues: [],
        durationMs: 0
      };
    }

    // 1. Language Detection
    const detected = LanguageDetector ? LanguageDetector.detect(code, filename) : { language: 'JavaScript' };
    const language = options.overrideLanguage || detected.language || 'JavaScript';

    // 2. Run Detectors
    const rawIssues = [];

    if (SecurityScanner && options.skipSecurity !== true) {
      const secIssues = SecurityScanner.scan(code, language);
      rawIssues.push(...secIssues);
    }

    if (BugDetector && options.skipBugs !== true) {
      const bugIssues = BugDetector.scan(code, language);
      rawIssues.push(...bugIssues);
    }

    if (QualityChecker && options.skipQuality !== true) {
      const qualIssues = QualityChecker.scan(code, language);
      rawIssues.push(...qualIssues);
    }

    // 3. Scoring
    const scoringResult = ScoringEngine
      ? ScoringEngine.calculateScore(rawIssues)
      : { totalScore: 100, grade: 'A+', gradeLabel: 'OK', gradeColor: '#10b981', breakdown: {}, severityCounts: {} };

    // 4. Suggestions & Enhancement
    const enhancedIssues = SuggestionEngine ? SuggestionEngine.enhanceIssues(rawIssues) : rawIssues;

    const lines = code.split('\n');
    const linesOfCode = lines.length;
    const durationMs = Date.now() - startTime;

    return {
      id: `scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      filename,
      language,
      languageConfidence: detected.confidence,
      code,
      linesOfCode,
      characterCount: code.length,
      score: scoringResult.totalScore,
      grade: scoringResult.grade,
      gradeLabel: scoringResult.gradeLabel,
      gradeColor: scoringResult.gradeColor,
      metrics: scoringResult.breakdown,
      severityCounts: scoringResult.severityCounts,
      issues: enhancedIssues,
      durationMs
    };
  }

  return { analyze };
});

