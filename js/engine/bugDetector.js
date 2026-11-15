/**
 * CodeLens AI - Bug Detection Engine
 * Scans code for logical bugs, runtime hazards, unhandled paths, and anti-patterns.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BugDetector = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function scan(code, language = 'JavaScript') {
    const issues = [];
    if (!code || typeof code !== 'string') return issues;

    const lines = code.split('\n');

    // Rule 1: Assignment in conditional (if (a = b))
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) return;

      // Check if (x = y) where it's not == or === or <= or >= or !=
      const ifAssignMatch = line.match(/\bif\s*\(\s*([a-zA-Z_$][\w$]*)\s*=(?!=)\s*([^;=)]+)\)/);
      if (ifAssignMatch && !/[=<>!]/.test(ifAssignMatch[0].replace('=', ''))) {
        issues.push({
          id: `BUG-ASSIGN-${lineNum}`,
          title: 'Accidental Assignment in Conditional',
          category: 'Bug Detection',
          severity: 'High',
          line: lineNum,
          snippet: line.trim(),
          explanation: `Assignment operator '=' was used inside 'if (...)'. This assigns '${ifAssignMatch[2].trim()}' to '${ifAssignMatch[1]}' instead of testing for equality.`,
          fix: line.replace(/=(?!=)/, '===')
        });
      }
    });

    // Rule 2: Empty catch blocks
    const emptyCatchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g;
    let match;
    while ((match = emptyCatchRegex.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      issues.push({
        id: `BUG-EMPTY-CATCH-${lineNum}`,
        title: 'Empty Catch Block (Silent Error Swallowing)',
        category: 'Bug Detection',
        severity: 'Medium',
        line: lineNum,
        snippet: match[0],
        explanation: 'Errors are caught but completely ignored without logging or recovery, concealing fatal failures.',
        fix: 'catch (err) {\n    console.error("Operation failed:", err);\n    // handle error or rethrow\n  }'
      });
    }

    // Rule 3: Unreachable code after return / throw / break
    let sawReturn = false;
    let returnDepth = -1;
    let currentDepth = 0;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;

      // If we exit the scope where the return happened, reset sawReturn
      if (sawReturn && returnDepth !== -1 && (currentDepth - closes) < returnDepth) {
        sawReturn = false;
        returnDepth = -1;
      }

      // Check if statement is unreachable
      if (
        sawReturn &&
        trimmed.length > 0 &&
        trimmed !== '}' &&
        trimmed !== ');' &&
        !trimmed.startsWith('.') &&
        !trimmed.startsWith('case ') &&
        !trimmed.startsWith('default:')
      ) {
        issues.push({
          id: `BUG-UNREACHABLE-${lineNum}`,
          title: 'Unreachable Code Detected',
          category: 'Bug Detection',
          severity: 'Medium',
          line: lineNum,
          snippet: trimmed,
          explanation: `This statement appears immediately after a return or throw statement in the same scope and will never be executed.`,
          fix: '// Remove or relocate unreachable code before return/throw'
        });
        sawReturn = false;
        returnDepth = -1;
      }

      // Check for return / throw / break / continue
      if (/^\s*(return|throw\s+new\s+\w+|break|continue)\b[^;]*;?$/.test(trimmed)) {
        sawReturn = true;
        returnDepth = currentDepth + opens;
      }

      currentDepth += opens - closes;
      if (currentDepth < 0) currentDepth = 0;
    });

    // Rule 4: Loose equality checks (== instead of ===) in JavaScript/TypeScript
    const isJsLike = /JavaScript|TypeScript/i.test(language) || !language;
    if (isJsLike) {
      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

        if (/\s==\s(?!=)/.test(line) && !/typeof\s/.test(line)) {
          issues.push({
            id: `BUG-LOOSE-EQ-${lineNum}`,
            title: 'Loose Equality Operator (==)',
            category: 'Bug Detection',
            severity: 'Low',
            line: lineNum,
            snippet: trimmed,
            explanation: 'Using loose equality (==) causes implicit type coercion in JavaScript. Use strict equality (===).',
            fix: line.replace(/==(?!=)/g, '===')
          });
        }
        if (/\s!=\s(?!=)/.test(line)) {
          issues.push({
            id: `BUG-LOOSE-NEQ-${lineNum}`,
            title: 'Loose Inequality Operator (!=)',
            category: 'Bug Detection',
            severity: 'Low',
            line: lineNum,
            snippet: trimmed,
            explanation: 'Using loose inequality (!=) causes unexpected type conversions. Use strict inequality (!==).',
            fix: line.replace(/!=(?!=)/g, '!==')
          });
        }
      });
    }

    // Rule 5: NaN comparison (x === NaN)
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (/===?\s*NaN\b|\bNaN\s*===?/.test(line)) {
        issues.push({
          id: `BUG-NAN-${lineNum}`,
          title: 'Direct Comparison with NaN',
          category: 'Bug Detection',
          severity: 'High',
          line: lineNum,
          snippet: line.trim(),
          explanation: 'Comparing directly to NaN always evaluates to false because NaN !== NaN. Use Number.isNaN(val) instead.',
          fix: line.replace(/([a-zA-Z_$][\w$]*)\s*===?\s*NaN/, 'Number.isNaN($1)')
        });
      }
    });

    // Rule 6: Unused variables
    const declaredVars = [];
    const varDeclRegex = /\b(let|const|var)\s+([a-zA-Z_$][\w$]*)\s*=/g;
    let varMatch;
    while ((varMatch = varDeclRegex.exec(code)) !== null) {
      const varName = varMatch[2];
      const lineNum = code.substring(0, varMatch.index).split('\n').length;
      declaredVars.push({ name: varName, lineNum, index: varMatch.index });
    }

    declaredVars.forEach(({ name, lineNum, index }) => {
      // Exclude common export / ignore patterns
      if (name.startsWith('_') || name === 'req' || name === 'res' || name === 'next') return;
      const restOfCode = code.substring(index + name.length + 5);
      const usageRegex = new RegExp(`\\b${name}\\b`);
      if (!usageRegex.test(restOfCode)) {
        issues.push({
          id: `BUG-UNUSED-VAR-${lineNum}`,
          title: `Unused Variable '${name}'`,
          category: 'Bug Detection',
          severity: 'Low',
          line: lineNum,
          snippet: lines[lineNum - 1]?.trim() || `${name}`,
          explanation: `Variable '${name}' is declared but never referenced again in the scope.`,
          fix: `// Remove unused variable '${name}' or prefix with '_' if required`
        });
      }
    });

    // Rule 7: Self-assignment (x = x)
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      const selfAssign = trimmed.match(/^([a-zA-Z_$][\w$]*)\s*=\s*\1\s*(?:;|\s*$)/);
      if (selfAssign) {
        issues.push({
          id: `BUG-SELF-ASSIGN-${lineNum}`,
          title: 'Redundant Self-Assignment',
          category: 'Bug Detection',
          severity: 'Medium',
          line: lineNum,
          snippet: trimmed,
          explanation: `Variable '${selfAssign[1]}' is assigned to itself with no effect.`,
          fix: `// Remove redundant assignment ${selfAssign[0]}`
        });
      }
    });

    return issues;
  }

  return { scan };
});
