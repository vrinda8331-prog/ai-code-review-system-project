/**
 * CodeLens AI - Code Quality & Maintainability Checker
 * Evaluates function length, nesting complexity, naming conventions, and code hygiene.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QualityChecker = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function scan(code, language = 'JavaScript') {
    const issues = [];
    if (!code || typeof code !== 'string') return issues;

    const lines = code.split('\n');

    // Rule 1: Forgotten console.log / debugger / alert
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      if (/\bconsole\.(log|debug|dir)\s*\(/.test(line)) {
        issues.push({
          id: `QLT-CONSOLE-${lineNum}`,
          title: 'Leftover Debugging Log (console.log)',
          category: 'Code Quality',
          severity: 'Low',
          line: lineNum,
          snippet: trimmed,
          explanation: 'Production code should avoid excessive console.log statements to prevent leaking internal debug information and performance overhead.',
          fix: '// Remove debug logging or use a formal structured logger'
        });
      }

      if (/\bdebugger\s*;?$/.test(trimmed)) {
        issues.push({
          id: `QLT-DEBUGGER-${lineNum}`,
          title: 'Debugger Breakpoint in Code',
          category: 'Code Quality',
          severity: 'Medium',
          line: lineNum,
          snippet: trimmed,
          explanation: 'debugger statements cause browser devtools to pause execution, halting user experience if left in production.',
          fix: '// Remove debugger statement'
        });
      }

      if (/\balert\s*\([^)]*\)/.test(line)) {
        issues.push({
          id: `QLT-ALERT-${lineNum}`,
          title: 'Synchronous window.alert() Call',
          category: 'Code Quality',
          severity: 'Low',
          line: lineNum,
          snippet: trimmed,
          explanation: 'alert() blocks the main thread and halts browser rendering. Use non-blocking modal dialogs or toast notifications.',
          fix: 'showNotification("Message here"); // Replace alert with modern UI toast'
        });
      }
    });

    // Rule 2: Excessive Nesting Depth (> 3 levels)
    let currentIndent = 0;
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      // Count open vs close braces
      const opens = (line.match(/\{/g) || []).length;
      const closes = (line.match(/\}/g) || []).length;

      if (currentIndent >= 4 && opens > 0) {
        issues.push({
          id: `QLT-NESTING-${lineNum}`,
          title: `Deeply Nested Control Flow (Depth ${currentIndent + 1})`,
          category: 'Maintainability',
          severity: 'Medium',
          line: lineNum,
          snippet: trimmed,
          explanation: 'Deep nesting creates high cognitive complexity ("Pyramid of Doom"). Refactor using early return guards or helper functions.',
          fix: '// Invert condition and return early:\nif (!isValid) return;\n// continue processing flatly'
        });
      }

      currentIndent = Math.max(0, currentIndent + opens - closes);
    });

    // Rule 3: Function Length Analysis (> 30 lines)
    let funcStart = null;
    let funcBraces = 0;
    let funcName = '';

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const funcMatch = line.match(/\bfunction\s+([a-zA-Z_$][\w$]*)|const\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);

      if (funcMatch && funcStart === null) {
        funcStart = lineNum;
        funcName = funcMatch[1] || funcMatch[2] || 'anonymous';
        funcBraces = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      } else if (funcStart !== null) {
        funcBraces += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (funcBraces <= 0) {
          const length = lineNum - funcStart + 1;
          if (length > 35) {
            issues.push({
              id: `QLT-FUNCLEN-${funcStart}`,
              title: `Long Function '${funcName}' (${length} lines)`,
              category: 'Maintainability',
              severity: 'Low',
              line: funcStart,
              snippet: lines[funcStart - 1]?.trim(),
              explanation: `Function '${funcName}' is ${length} lines long. Recommended practice is under 30 lines to adhere to the Single Responsibility Principle.`,
              fix: `// Split '${funcName}' into smaller, focused helper subroutines`
            });
          }
          funcStart = null;
        }
      }
    });

    // Rule 4: Poor or cryptic naming (e.g. single letters outside loops)
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (
        trimmed.startsWith('for ') ||
        trimmed.startsWith('for(') ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('#')
      ) return;

      const crypticMatch = trimmed.match(/^(?:(?:let|const|var)\s+)?([a-hj-km-z])\s*=\s*[^=;]+/);
      if (crypticMatch) {
        const varName = crypticMatch[1];
        issues.push({
          id: `QLT-NAMING-${lineNum}`,
          title: `Cryptic Variable Name '${varName}'`,
          category: 'Code Quality',
          severity: 'Info',
          line: lineNum,
          snippet: trimmed,
          explanation: `Single-letter identifier '${varName}' reduces code clarity. Use a descriptive name such as 'price', 'totalCount', or 'userData'.`,
          fix: trimmed.replace(new RegExp(`\\b${varName}\\b`), `${varName}Descriptive`)
        });
      }
    });

    // Rule 5: Magic Numbers
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('const ') || trimmed.startsWith('for')) return;

      const magicMatch = line.match(/(?:[=!<>+\-*/]\s*)([2-9]\d{2,}|86400|3600|60000)\b/);
      if (magicMatch && !/port|status|px|vw|vh/i.test(line)) {
        issues.push({
          id: `QLT-MAGIC-NUM-${lineNum}`,
          title: `Magic Number (${magicMatch[1]}) Found`,
          category: 'Code Quality',
          severity: 'Info',
          line: lineNum,
          snippet: trimmed,
          explanation: `Direct numeric literal '${magicMatch[1]}' should be extracted into a well-named descriptive constant.`,
          fix: `const MAX_TIMEOUT_MS = ${magicMatch[1]};`
        });
      }
    });

    return issues;
  }

  return { scan };
});
