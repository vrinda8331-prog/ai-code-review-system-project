/**
 * CodeLens AI - Language Detector
 * Detects programming language from filename extension and code syntax patterns.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LanguageDetector = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EXTENSION_MAP = {
    js: 'JavaScript',
    jsx: 'JavaScript (React)',
    mjs: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript (React)',
    py: 'Python',
    html: 'HTML',
    htm: 'HTML',
    css: 'CSS',
    json: 'JSON',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    php: 'PHP',
    rb: 'Ruby',
    go: 'Go',
    sql: 'SQL',
    sh: 'Bash / Shell',
    rs: 'Rust'
  };

  const HEURISTICS = [
    {
      lang: 'JSON',
      test: (code) => {
        const trimmed = code.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            JSON.parse(trimmed);
            return 0.95;
          } catch (_) {
            return 0;
          }
        }
        return 0;
      }
    },
    {
      lang: 'HTML',
      test: (code) => {
        let score = 0;
        if (/<!DOCTYPE\s+html/i.test(code)) score += 0.8;
        if (/<html[\s>]/i.test(code)) score += 0.5;
        if (/<head[\s>]/i.test(code) && /<\/head>/i.test(code)) score += 0.4;
        if (/<body[\s>]/i.test(code)) score += 0.4;
        if (/<div[\s>]/i.test(code) || /<span[\s>]/i.test(code)) score += 0.3;
        return Math.min(score, 1);
      }
    },
    {
      lang: 'CSS',
      test: (code) => {
        let score = 0;
        if (/@media[^{]+\{/i.test(code)) score += 0.5;
        if (/[a-zA-Z0-9_\-\.#:]+\s*\{\s*([a-zA-Z\-]+:\s*[^;]+;?\s*)+\}/g.test(code)) score += 0.6;
        if (/display\s*:\s*(flex|grid|block|none|inline)/i.test(code)) score += 0.3;
        if (/var\(--[a-zA-Z0-9_\-]+\)/.test(code)) score += 0.3;
        return Math.min(score, 1);
      }
    },
    {
      lang: 'Python',
      test: (code) => {
        let score = 0;
        if (/\bdef\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*:/m.test(code)) score += 0.6;
        if (/\bimport\s+[a-zA-Z_]\w*(\s*,\s*[a-zA-Z_]\w*)*\b/m.test(code)) score += 0.3;
        if (/\bfrom\s+[a-zA-Z_.]+\s+import\s+/m.test(code)) score += 0.4;
        if (/\belif\s+.*:/m.test(code)) score += 0.5;
        if (/if\s+__name__\s*==\s*['"]__main__['"]\s*:/m.test(code)) score += 0.8;
        if (/\bprint\s*\(/m.test(code) && !/console\.log/.test(code)) score += 0.3;
        return Math.min(score, 1);
      }
    },
    {
      lang: 'JavaScript',
      test: (code) => {
        let score = 0;
        if (/\b(const|let|var)\s+[a-zA-Z_$][\w$]*\s*=/m.test(code)) score += 0.5;
        if (/\bfunction\s+[a-zA-Z_$][\w$]*\s*\([^)]*\)\s*\{/m.test(code)) score += 0.5;
        if (/=>\s*\{?/.test(code)) score += 0.3;
        if (/console\.(log|warn|error|info)\s*\(/m.test(code)) score += 0.4;
        if (/document\.(getElementById|querySelector|addEventListener)/m.test(code)) score += 0.6;
        if (/export\s+(default\s+)?(function|class|const|let)/m.test(code)) score += 0.5;
        return Math.min(score, 1);
      }
    },
    {
      lang: 'Java',
      test: (code) => {
        let score = 0;
        if (/public\s+class\s+[A-Z]\w*/m.test(code)) score += 0.7;
        if (/public\s+static\s+void\s+main\s*\(/m.test(code)) score += 0.8;
        if (/System\.out\.println\s*\(/m.test(code)) score += 0.6;
        return Math.min(score, 1);
      }
    },
    {
      lang: 'C++',
      test: (code) => {
        let score = 0;
        if (/#include\s+<iostream>/m.test(code)) score += 0.8;
        if (/#include\s+<[a-z_]+>/m.test(code)) score += 0.5;
        if (/std::cout\s*<</m.test(code)) score += 0.7;
        if (/int\s+main\s*\([^)]*\)\s*\{/m.test(code)) score += 0.4;
        return Math.min(score, 1);
      }
    }
  ];

  function detectLanguage(code, filename) {
    if (filename) {
      const parts = filename.split('.');
      if (parts.length > 1) {
        const ext = parts.pop().toLowerCase();
        if (EXTENSION_MAP[ext]) {
          return { language: EXTENSION_MAP[ext], confidence: 0.99, source: 'extension' };
        }
      }
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return { language: 'Plain Text', confidence: 0.1, source: 'default' };
    }

    let bestLang = 'JavaScript';
    let highestScore = 0;

    for (const h of HEURISTICS) {
      const score = h.test(code);
      if (score > highestScore) {
        highestScore = score;
        bestLang = h.lang;
      }
    }

    if (highestScore >= 0.3) {
      return { language: bestLang, confidence: Math.round(highestScore * 100) / 100, source: 'pattern' };
    }

    return { language: 'JavaScript', confidence: 0.5, source: 'fallback' };
  }

  return {
    detect: detectLanguage,
    EXTENSION_MAP
  };
});
