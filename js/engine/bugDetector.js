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
    let inFunction = false;
    let sawReturn = false;
    let blockDepth = 0;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      if (trimmed.includes('{')) blockDepth += (trimmed.match(/\{/g) || []).length;
      if (trimmed.includes('}')) {
        blockDepth -= (trimmed.match(/\}/g) || []).length;
        if (blockDepth <= 1) sawReturn = false;
      }

      if (sawReturn && trimmed.length > 0 && trimmed !== '}' && !trimmed.startsWith('case ') && !trimmed.startsWith('default:')) {
        issues.push({
          id: `BUG-UNREACHABLE-${lineNum}`,
          title: 'Unreachable Code Detected',
          category: 'Bug Detection',
          severity: 'Medium',
          line: lineNum,
          snippet: trimmed,
          explanation: `This code appears immediately after a return/throw statement inside the same scope and will never execute.`,
          fix: '// Remove or move unreachable statement before return'
        });
        sawReturn = false;
      }

      if (/^\s*(return|throw\s+new\s+\w+|break|continue)\b[^;]*;?$/.test(trimmed)) {
        sawReturn = true;
      }
    });

    // Rule 4: Loose equality checks (== instead of ===)
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
          explanation: 'Using loose equality (==) causes implicit type coercion, leading to unexpected truthy/falsy behavior. Use strict equality (===).',
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
      const selfAssign = line.match(/\b([a-zA-Z_$][\w$]*)\s*=\s*\1\s*;/);
      if (selfAssign) {
        issues.push({
          id: `BUG-SELF-ASSIGN-${lineNum}`,
          title: 'Redundant Self-Assignment',
          category: 'Bug Detection',
          severity: 'Medium',
          line: lineNum,
          snippet: line.trim(),
          explanation: `Variable '${selfAssign[1]}' is assigned to itself with no effect.`,
          fix: `// Remove redundant assignment ${selfAssign[0]}`
        });
      }
    });

    return issues;
  }

  return { scan };
});
