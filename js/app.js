/**
 * CodeLens AI - Main Application Coordinator
 * Handles tab navigation, scan triggers, UI binding, and backend API integration.
 */
(function () {
  'use strict';

  let currentReview = null;
  let isBackendConnected = false;
  let activeTab = 'dashboard';
  let activeFilter = 'all';

  let editorManagerInstance = null;
  let fileManagerInstance = null;
  let currentFilename = 'untitled.js';

  // DOM Elements Cache
  const elements = {};

  function init() {
    cacheDOMElements();
    initEditorAndFile();
    initNavigation();
    initActionButtons();
    checkBackendHealth();
    renderDashboardView();
  }

  function cacheDOMElements() {
    elements.navLinks = document.querySelectorAll('.nav-link');
    elements.tabPanes = document.querySelectorAll('.tab-pane');
    elements.backendStatus = document.getElementById('backend-status-text');
    elements.backendDot = document.getElementById('backend-status-dot');

    // Dashboard
    elements.dashboardContainer = document.getElementById('dashboard-view-container');

    // Analyzer
    elements.codeTextarea = document.getElementById('code-editor-textarea');
    elements.lineNumbers = document.getElementById('editor-line-numbers');
    elements.editorStats = document.getElementById('editor-stats');
    elements.dropZone = document.getElementById('code-drop-zone');
    elements.fileInput = document.getElementById('code-file-input');
    elements.langSelect = document.getElementById('language-select');
    elements.btnRunScan = document.getElementById('btn-run-scan');
    elements.btnSampleVulnerable = document.getElementById('btn-sample-vulnerable');
    elements.btnSampleBuggy = document.getElementById('btn-sample-buggy');
    elements.btnSampleClean = document.getElementById('btn-sample-clean');
    elements.btnClearCode = document.getElementById('btn-clear-code');
    elements.activeFileName = document.getElementById('active-file-name');

    // Scanning overlay
    elements.scanOverlay = document.getElementById('scan-overlay');
    elements.scanStepText = document.getElementById('scan-step-text');

    // Results
    elements.resultsContainer = document.getElementById('results-view-container');
    elements.btnExportHtml = document.getElementById('btn-export-html');
    elements.btnExportJson = document.getElementById('btn-export-json');
    elements.btnPrintPdf = document.getElementById('btn-print-pdf');

    // Reports View
    elements.reportsPreviewContainer = document.getElementById('reports-preview-container');
  }

  function initEditorAndFile() {
    if (window.EditorManager && elements.codeTextarea) {
      editorManagerInstance = new window.EditorManager.EditorManager(
        elements.codeTextarea,
        elements.lineNumbers,
        elements.editorStats
      );
      // Load default sample
      editorManagerInstance.loadPreset('vulnerable_js');
      currentFilename = 'sample-vulnerable.js';
      if (elements.activeFileName) elements.activeFileName.textContent = currentFilename;
    }

    if (window.FileManager && elements.dropZone && elements.fileInput) {
      fileManagerInstance = new window.FileManager.FileManager(
        elements.dropZone,
        elements.fileInput,
        (fileData) => {
          if (editorManagerInstance) {
            editorManagerInstance.setValue(fileData.content);
          }
          currentFilename = fileData.name;
          if (elements.activeFileName) elements.activeFileName.textContent = fileData.name;

          // Auto-detect language
          if (window.LanguageDetector) {
            const detected = window.LanguageDetector.detect(fileData.content, fileData.name);
            if (elements.langSelect) {
              elements.langSelect.value = detected.language;
            }
          }
          switchTab('analyzer');
        }
      );
    }
  }

  function initNavigation() {
    elements.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });
  }

  function switchTab(tabName) {
    activeTab = tabName;

    elements.navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
    });

    elements.tabPanes.forEach((pane) => {
      pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });

    if (tabName === 'dashboard') {
      renderDashboardView();
    } else if (tabName === 'reports') {
      renderReportsView();
    }
  }

  function initActionButtons() {
    // Run Scan
    if (elements.btnRunScan) {
      elements.btnRunScan.addEventListener('click', () => {
        runAnalysis();
      });
    }

    // Samples
    if (elements.btnSampleVulnerable) {
      elements.btnSampleVulnerable.addEventListener('click', () => {
        loadPresetAndAnalyze('vulnerable_js', 'insecure-auth.js');
      });
    }
    if (elements.btnSampleBuggy) {
      elements.btnSampleBuggy.addEventListener('click', () => {
        loadPresetAndAnalyze('buggy_python', 'discount_calculator.py');
      });
    }
    if (elements.btnSampleClean) {
      elements.btnSampleClean.addEventListener('click', () => {
        loadPresetAndAnalyze('clean_js', 'secure-api-client.js');
      });
    }

    // Clear
    if (elements.btnClearCode) {
      elements.btnClearCode.addEventListener('click', () => {
        if (editorManagerInstance) editorManagerInstance.clear();
        currentFilename = 'untitled.js';
        if (elements.activeFileName) elements.activeFileName.textContent = currentFilename;
      });
    }

    // Drop zone click trigger file input
    if (elements.dropZone && elements.fileInput) {
      elements.dropZone.addEventListener('click', () => {
        elements.fileInput.click();
      });
    }

    // Export buttons
    if (elements.btnExportHtml) {
      elements.btnExportHtml.addEventListener('click', () => {
        if (window.ReportGenerator && currentReview) {
          window.ReportGenerator.exportHTML(currentReview);
        }
      });
    }
    if (elements.btnExportJson) {
      elements.btnExportJson.addEventListener('click', () => {
        if (window.ReportGenerator && currentReview) {
          window.ReportGenerator.exportJSON(currentReview);
        }
      });
    }
    if (elements.btnPrintPdf) {
      elements.btnPrintPdf.addEventListener('click', () => {
        if (window.ReportGenerator) {
          window.ReportGenerator.printPDF();
        }
      });
    }
  }

  function checkBackendHealth() {
    if (typeof fetch !== 'function') return;

    fetch('/api/health')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not OK');
      })
      .then((data) => {
        isBackendConnected = true;
        if (elements.backendStatus) elements.backendStatus.textContent = 'Backend: Native Node.js API';
        if (elements.backendDot) {
          elements.backendDot.style.background = '#10b981';
          elements.backendDot.style.boxShadow = '0 0 8px #10b981';
        }
      })
      .catch(() => {
        isBackendConnected = false;
        if (elements.backendStatus) elements.backendStatus.textContent = 'Engine: Client-Side (Vanilla JS)';
        if (elements.backendDot) {
          elements.backendDot.style.background = '#38bdf8';
          elements.backendDot.style.boxShadow = '0 0 8px #38bdf8';
        }
      });
  }

  function loadPresetAndAnalyze(presetKey, filename) {
    if (editorManagerInstance) {
      editorManagerInstance.loadPreset(presetKey);
      currentFilename = filename || `${presetKey}.js`;
      if (elements.activeFileName) elements.activeFileName.textContent = currentFilename;

      if (window.LanguageDetector) {
        const detected = window.LanguageDetector.detect(editorManagerInstance.getValue(), currentFilename);
        if (elements.langSelect) elements.langSelect.value = detected.language;
      }

      switchTab('analyzer');
    }
  }

  async function runAnalysis() {
    const code = editorManagerInstance ? editorManagerInstance.getValue() : '';
    if (!code.trim()) {
      alert('Please enter or paste some code before starting the review.');
      return;
    }

    const selectedLang = elements.langSelect ? elements.langSelect.value : 'JavaScript';

    // 0. Security Layer Pre-Check & Sanitization
    let cleanCode = code;
    if (window.SecurityLayer) {
      try {
        const sanitized = window.SecurityLayer.sanitizeInput(code);
        cleanCode = sanitized.cleanedCode;
        if (sanitized.leaksDetected && sanitized.leaksDetected.length > 0) {
          console.warn('SecurityLayer: Real secrets detected in code input:', sanitized.leaksDetected);
        }
      } catch (secErr) {
        alert('Security Layer Block: ' + secErr.message);
        return;
      }
    }

    // Show animation overlay
    showScanProgress(true);
    updateScanStep('Detecting programming language & structure...');
    await sleep(200);

    updateScanStep('Running Security Scanner (XSS, Secrets, eval, SQLi)...');
    await sleep(250);

    updateScanStep('Analyzing Bugs (unreachable code, empty catches, loose equality)...');
    await sleep(200);

    updateScanStep('Evaluating Code Quality & Maintainability Index...');
    await sleep(200);

    let result = null;

    // Execute via backend API if reachable, else client-side engine
    if (isBackendConnected) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            filename: currentFilename,
            language: selectedLang
          })
        });
        if (response.ok) {
          result = await response.json();
        }
      } catch (err) {
        console.warn('Backend analyze call failed, using client fallback', err);
      }
    }

    if (!result && window.Analyzer) {
      result = window.Analyzer.analyze(code, currentFilename, { overrideLanguage: selectedLang });
    }

    showScanProgress(false);

    if (result) {
      currentReview = result;
      if (window.HistoryStorage) {
        window.HistoryStorage.save(result);
      }
      displayResults(result);
      switchTab('results');
    }
  }

  function showScanProgress(show) {
    if (elements.scanOverlay) {
      elements.scanOverlay.classList.toggle('active', show);
    }
  }

  function updateScanStep(text) {
    if (elements.scanStepText) {
      elements.scanStepText.textContent = text;
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function displayResults(review) {
    if (!elements.resultsContainer || !review) return;

    const issues = review.issues || [];
    const metrics = review.metrics || {};
    const sev = review.severityCounts || {};

    const filteredIssues = filterIssuesList(issues, activeFilter);

    const issuesCardsHtml = filteredIssues.map((issue) => `
      <div class="issue-card ${issue.severity ? issue.severity.toLowerCase() : 'medium'}">
        <div class="issue-header-row">
          <span class="severity-pill ${issue.severity ? issue.severity.toLowerCase() : 'medium'}">${issue.severity}</span>
          <span class="issue-cat-badge">${escapeHtml(issue.category)}</span>
          <span class="line-badge">Line ${issue.line || 1}</span>
          <h4 class="issue-title-text">${escapeHtml(issue.title)}</h4>
        </div>
        <p class="issue-desc-text">${escapeHtml(issue.explanation)}</p>
        
        <div class="code-snippet-box">
          <div class="text-dim text-sm" style="margin-bottom: 4px;">Detected Snippet:</div>
          <code>${escapeHtml(issue.snippet || '')}</code>
        </div>

        <div class="fix-recommendation-box">
          <div class="fix-header">
            <span>✨ Recommended Fix:</span>
            <button class="copy-fix-btn" data-fix="${encodeURIComponent(issue.remediation || issue.fix || '')}">Copy Fix</button>
          </div>
          <code>${escapeHtml(issue.remediation || issue.fix || '')}</code>
        </div>
      </div>
    `).join('');

    elements.resultsContainer.innerHTML = `
      <div class="results-header-banner">
        <div class="score-display-wrapper">
          <div class="large-score-circle" style="--score-color: ${review.gradeColor};">
            <span class="large-score-num">${review.score}</span>
            <span class="large-score-grade">${review.grade}</span>
          </div>
          <div class="results-summary-info">
            <h2>Audit Complete: ${escapeHtml(review.filename || 'Source Code')}</h2>
            <p class="text-muted text-sm">
              Language: <strong>${escapeHtml(review.language)}</strong> &bull; 
              Lines of Code: <strong>${review.linesOfCode}</strong> &bull; 
              Analysis Time: <strong>${review.durationMs || 10}ms</strong>
            </p>
            <p style="margin-top: 6px; font-weight: 500; color: ${review.gradeColor};">
              Status: ${escapeHtml(review.gradeLabel)}
            </p>
          </div>
        </div>

        <div class="results-actions">
          <button class="btn btn-outline btn-sm" id="res-btn-reedit">✏️ Edit Code</button>
          <button class="btn btn-primary btn-sm" id="res-btn-export-html">📥 Download Report</button>
        </div>
      </div>

      <!-- Category Metric Breakdown -->
      <div class="metrics-breakdown-grid">
        <div class="metric-card">
          <div class="metric-title-row">
            <span>🔒 Security (40 pts)</span>
            <strong>${metrics.security ? metrics.security.score : 40} / 40</strong>
          </div>
          <div class="metric-progress-bg">
            <div class="metric-progress-fill" style="width: ${(metrics.security ? (metrics.security.score / 40) * 100 : 100)}%; background: #ef4444;"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-title-row">
            <span>🐛 Bug Detection (30 pts)</span>
            <strong>${metrics.bugs ? metrics.bugs.score : 30} / 30</strong>
          </div>
          <div class="metric-progress-bg">
            <div class="metric-progress-fill" style="width: ${(metrics.bugs ? (metrics.bugs.score / 30) * 100 : 100)}%; background: #f97316;"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-title-row">
            <span>⚡ Code Quality (20 pts)</span>
            <strong>${metrics.quality ? metrics.quality.score : 20} / 20</strong>
          </div>
          <div class="metric-progress-bg">
            <div class="metric-progress-fill" style="width: ${(metrics.quality ? (metrics.quality.score / 20) * 100 : 100)}%; background: #38bdf8;"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-title-row">
            <span>🛠️ Maintainability (10 pts)</span>
            <strong>${metrics.maintainability ? metrics.maintainability.score : 10} / 10</strong>
          </div>
          <div class="metric-progress-bg">
            <div class="metric-progress-fill" style="width: ${(metrics.maintainability ? (metrics.maintainability.score / 10) * 100 : 100)}%; background: #10b981;"></div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <span class="text-sm text-muted">Filter Findings:</span>
        <button class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${issues.length})</button>
        <button class="filter-btn ${activeFilter === 'Critical' ? 'active' : ''}" data-filter="Critical">Critical (${sev.Critical || 0})</button>
        <button class="filter-btn ${activeFilter === 'High' ? 'active' : ''}" data-filter="High">High (${sev.High || 0})</button>
        <button class="filter-btn ${activeFilter === 'Security' ? 'active' : ''}" data-filter="Security">Security</button>
        <button class="filter-btn ${activeFilter === 'Bug' ? 'active' : ''}" data-filter="Bug">Bugs</button>
        <button class="filter-btn ${activeFilter === 'Quality' ? 'active' : ''}" data-filter="Quality">Quality</button>
      </div>

      <!-- Issues List -->
      <div class="issues-list-wrapper">
        ${issuesCardsHtml.length > 0 ? issuesCardsHtml : `
          <div class="empty-state">
            <div class="empty-icon">🎉</div>
            <h4>No Issues Found in Filter!</h4>
            <p>Your code looks great under this category.</p>
          </div>
        `}
      </div>
    `;

    // Filter clicks
    elements.resultsContainer.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeFilter = e.currentTarget.getAttribute('data-filter');
        displayResults(review);
      });
    });

    // Copy fix button
    elements.resultsContainer.querySelectorAll('.copy-fix-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const fixCode = decodeURIComponent(e.currentTarget.getAttribute('data-fix') || '');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(fixCode).then(() => {
            const originalText = e.currentTarget.textContent;
            e.currentTarget.textContent = 'Copied!';
            setTimeout(() => {
              e.currentTarget.textContent = originalText;
            }, 1500);
          });
        }
      });
    });

    // Re-edit & export in results banner
    const reEditBtn = elements.resultsContainer.querySelector('#res-btn-reedit');
    if (reEditBtn) {
      reEditBtn.addEventListener('click', () => switchTab('analyzer'));
    }
    const exportBtn = elements.resultsContainer.querySelector('#res-btn-export-html');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (window.ReportGenerator) window.ReportGenerator.exportHTML(review);
      });
    }
  }

  function filterIssuesList(issues, filter) {
    if (filter === 'all') return issues;
    if (filter === 'Critical' || filter === 'High') {
      return issues.filter((i) => i.severity === filter);
    }
    if (filter === 'Security') {
      return issues.filter((i) => i.category === 'Security Scanner');
    }
    if (filter === 'Bug') {
      return issues.filter((i) => i.category === 'Bug Detection');
    }
    if (filter === 'Quality') {
      return issues.filter((i) => i.category === 'Code Quality' || i.category === 'Maintainability');
    }
    return issues;
  }

  function renderDashboardView() {
    if (elements.dashboardContainer && window.DashboardView && window.HistoryStorage) {
      window.DashboardView.render(elements.dashboardContainer, window.HistoryStorage, (selectedReview) => {
        currentReview = selectedReview;
        displayResults(selectedReview);
        switchTab('results');
      });
    }
  }

  function renderReportsView() {
    if (!elements.reportsPreviewContainer) return;

    if (!currentReview) {
      elements.reportsPreviewContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h4>No Active Report</h4>
          <p>Run a code scan first to generate and preview audit reports.</p>
          <button class="btn btn-primary btn-sm" onclick="window.App.switchTab('analyzer')">Go to Analyzer</button>
        </div>
      `;
      return;
    }

    elements.reportsPreviewContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Report Summary: ${escapeHtml(currentReview.filename)}</h3>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" id="rep-download-html">Download HTML Report</button>
            <button class="btn btn-secondary btn-sm" id="rep-download-json">Export JSON</button>
            <button class="btn btn-outline btn-sm" id="rep-print">Print / PDF</button>
          </div>
        </div>
        <div class="card-body">
          <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
            <div class="score-badge" style="background: ${currentReview.gradeColor}22; color: ${currentReview.gradeColor}; font-size: 1.5rem; padding: 10px 20px; border-radius: 8px;">
              Score: ${currentReview.score}/100 (${currentReview.grade})
            </div>
            <div>
              <p><strong>Total Detected Issues:</strong> ${currentReview.issues ? currentReview.issues.length : 0}</p>
              <p><strong>Audited At:</strong> ${new Date(currentReview.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <h4>Included Findings</h4>
          <ul style="margin: 15px 0 0 20px; line-height: 1.8;">
            ${(currentReview.issues || []).map((i) => `<li><strong>[${i.severity}]</strong> ${escapeHtml(i.title)} (Line ${i.line || 1})</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    document.getElementById('rep-download-html')?.addEventListener('click', () => {
      if (window.ReportGenerator) window.ReportGenerator.exportHTML(currentReview);
    });
    document.getElementById('rep-download-json')?.addEventListener('click', () => {
      if (window.ReportGenerator) window.ReportGenerator.exportJSON(currentReview);
    });
    document.getElementById('rep-print')?.addEventListener('click', () => {
      if (window.ReportGenerator) window.ReportGenerator.printPDF();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Expose global controller
  window.App = {
    init,
    switchTab,
    loadPresetAndAnalyze,
    runAnalysis
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
