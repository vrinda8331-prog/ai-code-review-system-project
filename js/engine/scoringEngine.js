/**
 * CodeLens AI - Scoring Engine
 * Computes category breakdown and overall code quality score (100 pts scale).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ScoringEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const WEIGHTS = {
    Security: 40,
    Bugs: 30,
    Quality: 20,
    Maintainability: 10
  };

  const PENALTIES = {
    Critical: 20,
    High: 10,
    Medium: 6,
    Low: 3,
    Info: 1
  };

  function calculateScore(issues = []) {
    let securityPenalty = 0;
    let bugPenalty = 0;
    let qualityPenalty = 0;
    let maintainabilityPenalty = 0;

    const severityCounts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Info: 0
    };

    issues.forEach((issue) => {
      const sev = issue.severity || 'Medium';
      if (severityCounts[sev] !== undefined) {
        severityCounts[sev]++;
      }

      const penalty = PENALTIES[sev] || 4;

      if (issue.category === 'Security Scanner') {
        securityPenalty += penalty;
      } else if (issue.category === 'Bug Detection') {
        bugPenalty += penalty;
      } else if (issue.category === 'Maintainability') {
        maintainabilityPenalty += penalty;
      } else {
        qualityPenalty += penalty;
      }
    });

    const securityScore = Math.max(0, WEIGHTS.Security - securityPenalty);
    const bugScore = Math.max(0, WEIGHTS.Bugs - bugPenalty);
    const qualityScore = Math.max(0, WEIGHTS.Quality - qualityPenalty);
    const maintainabilityScore = Math.max(0, WEIGHTS.Maintainability - maintainabilityPenalty);

    const totalScore = Math.round(securityScore + bugScore + qualityScore + maintainabilityScore);

    let grade = 'A+';
    let gradeLabel = 'Excellent (Production Ready)';
    let gradeColor = '#10b981'; // Green

    if (totalScore >= 90) {
      grade = 'A+';
      gradeLabel = 'Excellent (Clean & Secure)';
      gradeColor = '#10b981';
    } else if (totalScore >= 80) {
      grade = 'A';
      gradeLabel = 'Good (Minor improvements recommended)';
      gradeColor = '#34d399';
    } else if (totalScore >= 70) {
      grade = 'B';
      gradeLabel = 'Fair (Review recommended)';
      gradeColor = '#38bdf8';
    } else if (totalScore >= 60) {
      grade = 'C';
      gradeLabel = 'Needs Attention (Multiple warnings)';
      gradeColor = '#f59e0b';
    } else if (totalScore >= 45) {
      grade = 'D';
      gradeLabel = 'High Risk (Bugs / Vulnerabilities)';
      gradeColor = '#f97316';
    } else {
      grade = 'F';
      gradeLabel = 'Critical Risk (Do Not Deploy)';
      gradeColor = '#ef4444';
    }

    return {
      totalScore,
      grade,
      gradeLabel,
      gradeColor,
      breakdown: {
        security: { score: securityScore, max: WEIGHTS.Security, penalty: securityPenalty },
        bugs: { score: bugScore, max: WEIGHTS.Bugs, penalty: bugPenalty },
        quality: { score: qualityScore, max: WEIGHTS.Quality, penalty: qualityPenalty },
        maintainability: { score: maintainabilityScore, max: WEIGHTS.Maintainability, penalty: maintainabilityPenalty }
      },
      severityCounts,
      totalIssues: issues.length
    };
  }

  return { calculateScore, WEIGHTS, PENALTIES };
});
