/**
 * CodeLens AI - Suggestion Engine
 * Generates remediation advice, diff previews, and best practices.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SuggestionEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function enhanceIssues(issues = []) {
    return issues.map((issue) => {
      let icon = '⚡';
      let tagClass = 'tag-medium';

      if (issue.severity === 'Critical') {
        icon = '🚨';
        tagClass = 'tag-critical';
      } else if (issue.severity === 'High') {
        icon = '⚠️';
        tagClass = 'tag-high';
      } else if (issue.severity === 'Medium') {
        icon = '🔔';
        tagClass = 'tag-medium';
      } else if (issue.severity === 'Low') {
        icon = '💡';
        tagClass = 'tag-low';
      } else {
        icon = 'ℹ️';
        tagClass = 'tag-info';
      }

      return {
        ...issue,
        icon,
        tagClass,
        remediation: issue.fix || '// No automated fix available; manual review recommended.'
      };
    });
  }

  return { enhanceIssues };
});
