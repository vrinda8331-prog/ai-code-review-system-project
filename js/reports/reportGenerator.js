/**
 * CodeLens AI - Report Generator
 * Exports analysis results as standalone HTML, structured JSON, or Print-to-PDF.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ReportGenerator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function exportJSON(review) {
    if (!review) return;
    const jsonStr = JSON.stringify(review, null, 2);
    const filename = `codelens-report-${review.filename || 'review'}-${Date.now()}.json`;
    downloadFile(jsonStr, filename, 'application/json');
  }

  function exportHTML(review) {
    if (!review) return;

    const issuesHtml = (review.issues || []).map((issue, idx) => `
      <div class="issue-card ${issue.severity ? issue.severity.toLowerCase() : 'medium'}">
        <div class="issue-header">
          <span class="issue-badge ${issue.severity ? issue.severity.toLowerCase() : 'medium'}">${issue.severity || 'Medium'}</span>
          <span class="issue-category">${issue.category}</span>
          <span class="issue-line">Line ${issue.line || 1}</span>
          <h3 class="issue-title">${issue.title}</h3>
        </div>
        <p class="issue-desc">${issue.explanation}</p>
        <div class="code-box">
          <div class="code-title">Problematic Code:</div>
          <pre><code>${escapeHtml(issue.snippet || '')}</code></pre>
        </div>
        <div class="fix-box">
          <div class="fix-title">Suggested Remediation:</div>
          <pre><code>${escapeHtml(issue.remediation || issue.fix || '')}</code></pre>
        </div>
      </div>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeLens AI - Code Review Report (${review.filename || 'Source Code'})</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --text-muted: #8b949e;
      --primary: #58a6ff;
      --success: #238636;
      --warning: #d29922;
      --danger: #da3633;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 30px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title { font-size: 26px; font-weight: 700; color: #58a6ff; margin: 0; }
    .meta { font-size: 14px; color: var(--text-muted); margin-top: 5px; }
    .score-banner {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 30px;
    }
    .score-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 4px solid ${review.gradeColor || '#58a6ff'};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: bold;
      color: ${review.gradeColor || '#58a6ff'};
    }
    .score-details h2 { margin: 0 0 5px 0; font-size: 22px; }
    .stat-pills { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
    .pill {
      background: #21262d;
      border: 1px solid var(--border);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
    }
    .issue-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      border-left: 4px solid var(--primary);
    }
    .issue-card.critical { border-left-color: #ef4444; }
    .issue-card.high { border-left-color: #f97316; }
    .issue-card.medium { border-left-color: #f59e0b; }
    .issue-card.low { border-left-color: #38bdf8; }
    .issue-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .issue-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      background: #30363d;
      color: #fff;
    }
    .issue-badge.critical { background: #b91c1c; }
    .issue-badge.high { background: #c2410c; }
    .issue-badge.medium { background: #b45309; }
    .issue-badge.low { background: #0369a1; }
    .issue-title { margin: 0; font-size: 16px; font-weight: 600; flex: 1; }
    .issue-line { font-family: monospace; font-size: 13px; color: var(--text-muted); }
    .issue-category { font-size: 12px; color: var(--text-muted); background: #21262d; padding: 2px 6px; border-radius: 4px; }
    .issue-desc { margin: 6px 0 12px 0; font-size: 14px; }
    .code-box, .fix-box {
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;
      font-family: Consolas, "Courier New", monospace;
      font-size: 13px;
    }
    .fix-box { border-left: 3px solid #238636; }
    .code-title, .fix-title { font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 4px; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-all; }
    @media print {
      body { background: #fff; color: #000; padding: 10px; }
      .issue-card { background: #f8fafc; border: 1px solid #cbd5e1; color: #000; break-inside: avoid; }
      .score-banner { background: #f8fafc; border: 1px solid #cbd5e1; color: #000; }
      .code-box, .fix-box { background: #f1f5f9; color: #000; border-color: #cbd5e1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">CodeLens AI Review Report</h1>
        <div class="meta">Analyzed: ${review.filename || 'Source Code'} &bull; Language: ${review.language || 'JS'} &bull; ${new Date(review.timestamp || Date.now()).toLocaleString()}</div>
      </div>
    </div>

    <div class="score-banner">
      <div class="score-circle">
        <span>${review.score || 100}</span>
      </div>
      <div class="score-details">
        <h2>Grade: ${review.grade || 'A+'} (${review.gradeLabel || 'Approved'})</h2>
        <p>Lines of Code: <strong>${review.linesOfCode || 0}</strong> &bull; Total Findings: <strong>${review.issues ? review.issues.length : 0}</strong></p>
        <div class="stat-pills">
          <span class="pill">Security: ${review.metrics?.security?.score ?? 40}/40</span>
          <span class="pill">Bugs: ${review.metrics?.bugs?.score ?? 30}/30</span>
          <span class="pill">Quality: ${review.metrics?.quality?.score ?? 20}/20</span>
          <span class="pill">Maintainability: ${review.metrics?.maintainability?.score ?? 10}/10</span>
        </div>
      </div>
    </div>

    <h2>Findings & Fix Recommendations (${review.issues ? review.issues.length : 0})</h2>
    ${issuesHtml.length > 0 ? issuesHtml : '<p>Awesome! No bugs or security issues detected.</p>'}
  </div>
</body>
</html>`;

    const filename = `codelens-audit-${(review.filename || 'report').replace(/\.[^/.]+$/, '')}.html`;
    downloadFile(htmlContent, filename, 'text/html');
  }

  function printPDF() {
    window.print();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    exportJSON,
    exportHTML,
    printPDF
  };
});

