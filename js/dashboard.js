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
          <td><span class="file-name-cell"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#38bdf8" stroke-width="2" style="margin-right: 6px; vertical-align: -2px;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> ${escapeHtml(rev.filename || 'snippet.js')}</span></td>
          <td><span class="lang-pill">${escapeHtml(rev.language || 'JS')}</span></td>
          <td>
            <span class="score-badge" style="background: ${rev.gradeColor}22; color: ${rev.gradeColor}; border: 1px solid ${rev.gradeColor}66;">
              ${rev.score} / 100 (${rev.grade})
            </span>
          </td>
          <td>${rev.totalIssues} issues</td>
          <td class="text-muted text-sm">${dateStr}</td>
          <td>
            <button class="btn-sm btn-outline view-rev-btn" data-id="${rev.id}"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Inspect</button>
            <button class="btn-sm btn-icon-danger delete-rev-btn" data-id="${rev.id}" title="Delete"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </td>
        </tr>
      `;
    }).join('');

    containerEl.innerHTML = `
      <div class="dashboard-grid">
        <!-- Quick Stats Cards with direct crisp SVGs -->
        <div class="stat-card">
          <div class="stat-icon" style="color: #38bdf8;">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Code Scans</span>
            <span class="stat-value">${stats.totalReviews}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: ${scoreColor};">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Average Quality Score</span>
            <span class="stat-value" style="color: ${scoreColor}">${stats.totalReviews > 0 ? stats.averageScore + '/100' : 'N/A'}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: #ef4444;">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Critical Vulnerabilities</span>
            <span class="stat-value" style="color: #ef4444">${stats.criticalIssues}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: #f59e0b;">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"></rect><path d="m19 7-3 2"></path><path d="m5 7 3 2"></path><path d="m19 19-3-2"></path><path d="m5 19 3-2"></path><path d="M20 13h-4"></path><path d="M4 13h4"></path><path d="m10 4 1 2"></path><path d="m14 4-1 2"></path></svg>
          </div>
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
            <button class="btn btn-primary" id="dash-new-scan-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Start New Code Analysis</button>
            <button class="btn btn-secondary" id="dash-load-sample-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg> Load Sample Code</button>
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
          <h3><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#38bdf8" stroke-width="2" style="margin-right: 8px; vertical-align: -2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Recent Reviews & Audits</h3>
          ${reviews.length > 0 ? `<button class="btn-sm btn-outline" id="dash-clear-history-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Clear All</button>` : ''}
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
              <div class="empty-icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg></div>
              <h4>No Code Reviews Yet</h4>
              <p>Upload a file or paste code into the analyzer to see audit reports and metrics here.</p>
              <button class="btn btn-primary btn-sm" id="empty-scan-btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> Open Code Analyzer</button>
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
        if (window.App && window.App.startNewAnalysis) {
          window.App.startNewAnalysis();
        } else if (window.App && window.App.switchTab) {
          window.App.switchTab('analyzer');
        }
      });
    }
    if (emptyScanBtn) {
      emptyScanBtn.addEventListener('click', () => {
        if (window.App && window.App.startNewAnalysis) {
          window.App.startNewAnalysis();
        } else if (window.App && window.App.switchTab) {
          window.App.switchTab('analyzer');
        }
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

