/**
 * CodeLens AI - Security & Sanitization Layer
 * Provides secret redaction, XSS sanitization, payload validation, and push protection checks.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SecurityLayer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Secret Detection Patterns for Redaction & Push-Protection
  const SECRET_PATTERNS = [
    {
      name: 'Stripe API Key',
      regex: new RegExp('sk_(?:live|test)_[0-9a-zA-Z]{24,}', 'g'),
      redact: '[REDACTED_STRIPE_API_KEY]'
    },
    {
      name: 'AWS Access Key ID',
      regex: new RegExp('AKIA[0-9A-Z]{16}', 'g'),
      redact: '[REDACTED_AWS_ACCESS_KEY]'
    },
    {
      name: 'Generic Bearer / Auth Token',
      regex: new RegExp('(Bearer\\s+)(?!DEMO|TEST|MOCK)[a-zA-Z0-9_\\-\\.~+/]{25,}', 'gi'),
      redact: '$1[REDACTED_BEARER_TOKEN]'
    },
    {
      name: 'Generic API Key / Secret Literal',
      regex: new RegExp('(api[_-]?key|secret|password|passwd|auth[_-]?token)\\s*[:=]\\s*["\'](?!DEMO|TEST|MOCK|EXAMPLE|YOUR)[^"\']{20,}["\']', 'gi'),
      redact: '$1: "[REDACTED_SECRET]"'
    },
    {
      name: 'GitHub Personal Access Token',
      regex: new RegExp('gh[pousr]_[A-Za-z0-9_]{36,}', 'g'),
      redact: '[REDACTED_GITHUB_TOKEN]'
    }
  ];

  /**
   * Redacts live secrets from code or text
   */
  function redactSecrets(text) {
    if (!text || typeof text !== 'string') return text;
    let sanitized = text;

    SECRET_PATTERNS.forEach((item) => {
      sanitized = sanitized.replace(item.regex, item.redact);
    });

    return sanitized;
  }

  /**
   * Scans text for any potential secret leaks
   * Returns list of detected secret types
   */
  function detectSecretLeaks(text) {
    if (!text || typeof text !== 'string') return [];
    const leaks = [];

    SECRET_PATTERNS.forEach((item) => {
      // Create fresh non-global regex copy for testing
      const testRegex = new RegExp(item.regex.source, item.regex.flags.replace('g', ''));
      if (testRegex.test(text)) {
        leaks.push({
          type: item.name,
          warning: `Potential secret leak detected matching ${item.name}`
        });
      }
    });

    return leaks;
  }

  /**
   * HTML escape to prevent XSS injection
   */
  function escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Validates and cleans untrusted source code input
   */
  function sanitizeInput(code, maxSizeBytes = 2 * 1024 * 1024) {
    if (typeof code !== 'string') {
      throw new Error('Invalid input: Expected string of code');
    }

    if (code.length > maxSizeBytes) {
      throw new Error(`Payload too large: Max allowed code size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
    }

    // Strip toxic null-bytes
    const cleaned = code.replace(/\0/g, '');

    return {
      cleanedCode: cleaned,
      leaksDetected: detectSecretLeaks(cleaned)
    };
  }

  return {
    redactSecrets,
    detectSecretLeaks,
    escapeHTML,
    sanitizeInput,
    SECRET_PATTERNS
  };
});
