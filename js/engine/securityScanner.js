/**
 * CodeLens AI - Security Scanner Engine
 * Flags security vulnerabilities, credential leaks, injection vectors, and dangerous APIs.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SecurityScanner = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function scan(code, language = 'JavaScript') {
    const issues = [];
    if (!code || typeof code !== 'string') return issues;

    const lines = code.split('\n');

    // Rule 1: eval() & new Function() code injection
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      if (/\beval\s*\([^)]*\)/.test(line)) {
        issues.push({
          id: `SEC-EVAL-${lineNum}`,
          title: 'Dangerous Code Execution with eval()',
          category: 'Security Scanner',
          severity: 'Critical',
          cwe: 'CWE-95',
          line: lineNum,
          snippet: trimmed,
          explanation: 'eval() executes arbitrary strings as code in caller privileges. Malicious inputs can lead to complete application takeover (RCE / XSS).',
          fix: 'JSON.parse(data) // Use structured parsing instead of eval()'
        });
      }

      if (/new\s+Function\s*\(/.test(line)) {
        issues.push({
          id: `SEC-NEW-FUNC-${lineNum}`,
          title: 'Dynamic Code Execution with new Function()',
          category: 'Security Scanner',
          severity: 'Critical',
          cwe: 'CWE-95',
          line: lineNum,
          snippet: trimmed,
          explanation: 'Constructing functions from strings dynamically allows code injection similar to eval().',
          fix: '// Replace dynamic Function creation with static functions or a sandboxed interpreter'
        });
      }
    });

    // Rule 2: Hardcoded Secrets & API Keys
    const secretPatterns = [
      { name: 'Generic API Key / Secret', regex: /['"][a-zA-Z0-9_\-]{32,}['"]/ },
      { name: 'Hardcoded Password', regex: /(password|passwd|pwd|secret|api_key|apiKey|authToken)\s*[:=]\s*['"][^'"]{4,}['"]/i },
      { name: 'OpenAI / Service Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
      { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
      { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
      { name: 'JWT Token Pattern', regex: /eyJ[a-zA-Z0-9-_]{15,}\.eyJ[a-zA-Z0-9-_]{15,}\.[a-zA-Z0-9-_]{10,}/ }
    ];

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      for (const sp of secretPatterns) {
        if (sp.regex.test(line)) {
          // avoid matching common test placeholders like "password123" if dummy
          issues.push({
            id: `SEC-SECRET-${lineNum}`,
            title: `Hardcoded Credential: ${sp.name}`,
            category: 'Security Scanner',
            severity: 'Critical',
            cwe: 'CWE-798',
            line: lineNum,
            snippet: trimmed.replace(/['"][a-zA-Z0-9_\-.]{8,}['"]/g, '"********"'),
            explanation: `Sensitive secrets must never be hardcoded into source code or committed to repositories.`,
            fix: 'const apiKey = process.env.API_KEY || window.__ENV__.API_KEY;'
          });
          break;
        }
      }
    });

    // Rule 3: DOM XSS via innerHTML / outerHTML / document.write
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      if (/\.innerHTML\s*=/.test(line) || /\.outerHTML\s*=/.test(line)) {
        issues.push({
          id: `SEC-XSS-INNERHTML-${lineNum}`,
          title: 'Risky innerHTML Assignment (DOM XSS)',
          category: 'Security Scanner',
          severity: 'High',
          cwe: 'CWE-79',
          line: lineNum,
          snippet: trimmed,
          explanation: 'Assigning unescaped user input to innerHTML exposes the application to Cross-Site Scripting (XSS). An attacker can inject arbitrary script tags.',
          fix: 'element.textContent = sanitizedValue; // or use DOMPurify.sanitize(input)'
        });
      }

      if (/document\.write(ln)?\s*\(/.test(line)) {
        issues.push({
          id: `SEC-DOC-WRITE-${lineNum}`,
          title: 'Dangerous document.write() Invocation',
          category: 'Security Scanner',
          severity: 'High',
          cwe: 'CWE-79',
          line: lineNum,
          snippet: trimmed,
          explanation: 'document.write allows untrusted HTML insertion and degrades performance.',
          fix: 'const el = document.createElement("div"); el.textContent = val; parent.appendChild(el);'
        });
      }
    });

    // Rule 4: Insecure Randomness for Security Tokens
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      if (/\bMath\.random\s*\(\)/.test(line) && /(token|auth|key|id|session|password|salt|hash|otp)/i.test(line)) {
        issues.push({
          id: `SEC-MATH-RAND-${lineNum}`,
          title: 'Insecure PRNG Used for Security Artifact',
          category: 'Security Scanner',
          severity: 'Medium',
          cwe: 'CWE-338',
          line: lineNum,
          snippet: trimmed,
          explanation: 'Math.random() is cryptographically pseudo-random and predictable. Attackers can predict session tokens or OTPs.',
          fix: 'const token = crypto.randomUUID(); // or crypto.getRandomValues(new Uint32Array(1))'
        });
      }
    });

    // Rule 5: Storing sensitive auth tokens in LocalStorage
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) return;

      if (/localStorage\.setItem\s*\(\s*['"](token|jwt|auth|accessToken|refreshToken|secret)['"]/i.test(line)) {
        issues.push({
          id: `SEC-LOCALSTORAGE-AUTH-${lineNum}`,
          title: 'Sensitive Token Stored in LocalStorage',
          category: 'Security Scanner',
          severity: 'Medium',
          cwe: 'CWE-922',
          line: lineNum,
          snippet: trimmed,
          explanation: 'LocalStorage is accessible to any JavaScript running on the page. Any XSS vulnerability will leak authentication tokens.',
          fix: '// Store session tokens in HttpOnly, Secure, SameSite=Strict cookies'
        });
      }
    });

    // Rule 6: SQL Injection string concatenation pattern
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      if (/SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*['"]\s*\+\s*[a-zA-Z_$]/i.test(line) ||
          /INSERT\s+INTO\s+.*VALUES\s*\(.*['"]\s*\+/i.test(line)) {
        issues.push({
          id: `SEC-SQLI-${lineNum}`,
          title: 'SQL Injection via String Concatenation',
          category: 'Security Scanner',
          severity: 'Critical',
          cwe: 'CWE-89',
          line: lineNum,
          snippet: trimmed,
          explanation: 'Concatenating raw variables directly into SQL queries allows attackers to execute unauthorized database queries.',
          fix: 'db.query("SELECT * FROM users WHERE id = $1", [userId]); // Use parameterized queries'
        });
      }
    });

    return issues;
  }

  return { scan };
});
