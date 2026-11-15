/**
 * CodeLens AI - Review History Storage
 * Persists review results locally and syncs with backend server if available.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HistoryStorage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'codelens_review_history';
  const MAX_HISTORY_ITEMS = 50;

  function isLocalStorageAvailable() {
    try {
      const test = '__codelens_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (_) {
      return false;
    }
  }

  let memoryStore = [];

  function getAll() {
    if (isLocalStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn('Failed to parse history from localStorage', e);
        return memoryStore;
      }
    }
    return memoryStore;
  }

  function save(review) {
    if (!review || !review.id) return null;

    // Compact review to preserve space
    const record = {
      id: review.id,
      timestamp: review.timestamp || new Date().toISOString(),
      filename: review.filename || 'snippet.js',
      language: review.language || 'JavaScript',
      linesOfCode: review.linesOfCode || 0,
      score: review.score !== undefined ? review.score : 100,
      grade: review.grade || 'A+',
      gradeColor: review.gradeColor || '#10b981',
      totalIssues: review.issues ? review.issues.length : 0,
      severityCounts: review.severityCounts || {},
      issues: review.issues || [],
      codeSnippet: review.code ? review.code.slice(0, 500) : ''
    };

    let items = getAll();
    // Prepend new item
    items = [record, ...items.filter((i) => i.id !== record.id)].slice(0, MAX_HISTORY_ITEMS);

    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage save failed, falling back to memory', e);
      }
    }
    memoryStore = items;

    // Try optional background sync with backend
    trySyncWithBackend(record);

    return record;
  }

  function remove(id) {
    let items = getAll().filter((i) => i.id !== id);
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    memoryStore = items;
    return items;
  }

  function clear() {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    memoryStore = [];
    return [];
  }

  function getStats() {
    const items = getAll();
    if (!items.length) {
      return { totalReviews: 0, averageScore: 100, totalIssues: 0, criticalIssues: 0 };
    }

    const totalReviews = items.length;
    const totalScore = items.reduce((acc, item) => acc + (item.score || 0), 0);
    const averageScore = Math.round(totalScore / totalReviews);
    const totalIssues = items.reduce((acc, item) => acc + (item.totalIssues || 0), 0);
    const criticalIssues = items.reduce((acc, item) => acc + (item.severityCounts?.Critical || 0), 0);

    return { totalReviews, averageScore, totalIssues, criticalIssues };
  }

  function trySyncWithBackend(record) {
    if (typeof fetch === 'function' && typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      }).catch(() => {
        // Silent catch if backend not running
      });
    }
  }

  return {
    getAll,
    save,
    remove,
    clear,
    getStats
  };
});

