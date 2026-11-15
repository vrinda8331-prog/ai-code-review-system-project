/**
 * CodeLens AI - Dashboard View Controller
 * Populates overview statistics, recent scan cards, and activity summary.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DashboardView = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function renderDashboard(containerEl, historyStorage, onSelectReview) {
    if (!containerEl) return;

    const stats = historyStorage ? historyStorage.getStats() : { totalReviews: 0, averageScore: 100, totalIssues: 0, criticalIssues: 0 };
    const reviews = historyStorage ? historyStorage.getAll() : [];

    let scoreColor = '#10b981';
    if (stats.averageScore < 60) scoreColor = '#ef4444';
    else if (stats.averageScore < 80) scoreColor = '#f59e0b';

    const recentTableRows = reviews.slice(0, 8).map((rev) => {
      const dateStr = new Date(rev.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
        <tr>
          <td><span class="file-name-cell">📄 ${escapeHtml(rev.filename || 'snippet.js')}</span></td>
          <td><span class="lang-pill">${escapeHtml(rev.language || 'JS')}</span></td>
          <td>
            <span class="score-badge" style="background: ${rev.gradeColor}22; color: ${rev.gradeColor}; border: 1px solid ${rev.gradeColor}66;">
              ${rev.score} / 100 (${rev.grade})
            </span>
          </td>
          <td>${rev.totalIssues} issues</td>
          <td class="text-muted text-sm">${dateStr}</td>
          <td>
            <button class="btn-sm btn-outline view-rev-btn" data-id="${rev.id}">Inspect</button>
            <button class="btn-sm btn-icon-danger delete-rev-btn" data-id="${rev.id}" title="Delete">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    containerEl.innerHTML = `
      <div class="dashboard-grid">
        <!-- Quick Stats Cards -->
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-label">Total Code Scans</span>
            <span class="stat-value">${stats.totalReviews}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <span class="stat-label">Average Quality Score</span>
            <span class="stat-value" style="color: ${scoreColor}">${stats.totalReviews > 0 ? stats.averageScore + '/100' : 'N/A'}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚨</div>
          <div class="stat-info">
            <span class="stat-label">Critical Vulnerabilities</span>
            <span class="stat-value" style="color: #ef4444">${stats.criticalIssues}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🐛</div>
          <div class="stat-info">
            <span class="stat-label">Total Issues Detected</span>
            <span class="stat-value" style="color: #f59e0b">${stats.totalIssues}</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Banner -->
      <div class="hero-banner">
        <div class="hero-content">
          <h2>CodeLens AI Static Review Engine</h2>
          <p>Instant client-side static security analysis, code smells detection, maintainability scoring, and fix recommendations.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" id="dash-new-scan-btn">⚡ Start New Code Analysis</button>
            <button class="btn btn-secondary" id="dash-load-sample-btn">📂 Load Vulnerable Sample</button>
          </div>
        </div>
        <div class="hero-score-preview">
          <div class="circular-score-widget" style="--gauge-color: ${scoreColor};">
            <div class="inner-score">
              <span class="score-number">${stats.totalReviews > 0 ? stats.averageScore : '100'}</span>
              <span class="score-sub">Avg Score</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Reviews Section -->
      <div class="card recent-section">
        <div class="card-header">
          <h3>Recent Reviews & Audits</h3>
          ${reviews.length > 0 ? `<button class="btn-sm btn-outline" id="dash-clear-history-btn">Clear All</button>` : ''}
        </div>
        <div class="card-body">
          ${reviews.length > 0 ? `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>File / Snippet</th>
                    <th>Language</th>
                    <th>Quality Score</th>
                    <th>Findings</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentTableRows}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-icon">📁</div>
              <h4>No Code Reviews Yet</h4>
              <p>Upload a file or paste code into the analyzer to see audit reports and metrics here.</p>
              <button class="btn btn-primary btn-sm" id="empty-scan-btn">Open Code Analyzer</button>
            </div>
          `}
        </div>
      </div>
    `;

    // Attach row events
    containerEl.querySelectorAll('.view-rev-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const rev = reviews.find((r) => r.id === id);
        if (rev && typeof onSelectReview === 'function') {
          onSelectReview(rev);
        }
      });
    });

    containerEl.querySelectorAll('.delete-rev-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (historyStorage) {
          historyStorage.remove(id);
          renderDashboard(containerEl, historyStorage, onSelectReview);
        }
      });
    });

    const clearBtn = containerEl.querySelector('#dash-clear-history-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all code review history?')) {
          if (historyStorage) historyStorage.clear();
          renderDashboard(containerEl, historyStorage, onSelectReview);
        }
      });
    }

    const newScanBtn = containerEl.querySelector('#dash-new-scan-btn');
    const emptyScanBtn = containerEl.querySelector('#empty-scan-btn');
    if (newScanBtn) {
      newScanBtn.addEventListener('click', () => {
        if (window.App && window.App.switchTab) window.App.switchTab('analyzer');
      });
    }
    if (emptyScanBtn) {
      emptyScanBtn.addEventListener('click', () => {
        if (window.App && window.App.switchTab) window.App.switchTab('analyzer');
      });
    }

    const loadSampleBtn = containerEl.querySelector('#dash-load-sample-btn');
    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', () => {
        if (window.App && window.App.loadPresetAndAnalyze) {
          window.App.loadPresetAndAnalyze('vulnerable_js');
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { render: renderDashboard };
});

