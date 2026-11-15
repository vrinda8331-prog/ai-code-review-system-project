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
      let icon = '<i class="fa-solid fa-circle-info"></i>';
      let tagClass = 'tag-medium';

      if (issue.severity === 'Critical') {
        icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        tagClass = 'tag-critical';
      } else if (issue.severity === 'High') {
        icon = '<i class="fa-solid fa-circle-exclamation"></i>';
        tagClass = 'tag-high';
      } else if (issue.severity === 'Medium') {
        icon = '<i class="fa-solid fa-bell"></i>';
        tagClass = 'tag-medium';
      } else if (issue.severity === 'Low') {
        icon = '<i class="fa-solid fa-lightbulb"></i>';
        tagClass = 'tag-low';
      } else {
        icon = '<i class="fa-solid fa-circle-info"></i>';
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

