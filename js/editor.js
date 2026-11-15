/**
 * CodeLens AI - Code Editor Manager
 * Line numbers, synched scrolling, sample presets, tab indentation, and stats.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EditorManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SAMPLE_CODES = {
    vulnerable_js: `// CodeLens AI Sample: Insecure & Buggy JavaScript
const apiKey = "MOCK_API_KEY_EXAMPLE_FOR_TESTING_PURPOSES";
let userSessionToken = Math.random().toString(36).substring(2);

function processUserData(userInput, userRole) {
  // Bug: Loose equality
  if (userRole == "admin") {
    console.log("Admin privilege granted for:", userInput);
  }

  // Bug: Accidental assignment in conditional
  let status = "pending";
  if (status = "active") {
    // Dangerous: DOM XSS vulnerability
    document.getElementById("output").innerHTML = "<div>Welcome: " + userInput + "</div>";
  }

  try {
    // Dangerous: Remote Code Execution via eval
    eval(userInput);
  } catch (e) {
    // Bug: Empty catch block silently suppresses failure
  }

  // Bug: Unreachable code
  return true;
  let unreachableVar = 42;
  console.log(unreachableVar);
}

// Insecure: Storing sensitive token in localStorage
localStorage.setItem("authToken", apiKey);
`,

    buggy_python: `# CodeLens AI Sample: Buggy Python Script
import os

API_SECRET = "mock_secret_key_auth_token_for_testing_only"

def calculate_discount(price, user_type):
    # Poor naming & magic numbers
    a = price
    if user_type == "VIP":
        total = a - (a * 0.25)
    elif user_type == "REGULAR":
        total = a - (a * 0.10)
    else:
        total = a

    # Bug: Self assignment
    total = total

    # Potential logic flaw
    if price == None:
        return 0

    return total
`,

    clean_js: `/**
 * Clean & Production-Ready JavaScript Module
 * Demonstrates best practices, input sanitization, and strict checks.
 */
function sanitizeInput(rawInput) {
  if (typeof rawInput !== "string") {
    throw new TypeError("Input must be a valid string");
  }
  return rawInput
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function fetchUserProfile(userId) {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid User ID");
  }

  try {
    const response = await fetch(\`/api/users/\${encodeURIComponent(userId)}\`);
    if (!response.ok) {
      throw new Error(\`Network response failed with status \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchUserProfile failed:", error);
    throw error;
  }
}
`
  };

  class EditorManager {
    constructor(textareaEl, lineNumbersEl, statsEl) {
      this.textarea = textareaEl;
      this.lineNumbers = lineNumbersEl;
      this.stats = statsEl;
      this.initEvents();
      this.updateLineNumbers();
      this.updateStats();
    }

    initEvents() {
      if (!this.textarea) return;

      this.textarea.addEventListener('input', () => {
        this.updateLineNumbers();
        this.updateStats();
      });

      this.textarea.addEventListener('scroll', () => {
        if (this.lineNumbers) {
          this.lineNumbers.scrollTop = this.textarea.scrollTop;
        }
      });

      // Handle Tab key
      this.textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.textarea.selectionStart;
          const end = this.textarea.selectionEnd;
          const val = this.textarea.value;
          this.textarea.value = val.substring(0, start) + '  ' + val.substring(end);
          this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
          this.updateLineNumbers();
          this.updateStats();
        }
      });
    }

    updateLineNumbers() {
      if (!this.textarea || !this.lineNumbers) return;
      const lines = this.textarea.value.split('\n').length;
      let numbersHtml = '';
      for (let i = 1; i <= lines; i++) {
        numbersHtml += `<div class="line-no">${i}</div>`;
      }
      this.lineNumbers.innerHTML = numbersHtml;
    }

    updateStats() {
      if (!this.stats || !this.textarea) return;
      const text = this.textarea.value;
      const lines = text ? text.split('\n').length : 0;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      this.stats.innerHTML = `Lines: <strong>${lines}</strong> &bull; Chars: <strong>${chars}</strong> &bull; Words: <strong>${words}</strong>`;
    }

    getValue() {
      return this.textarea ? this.textarea.value : '';
    }

    setValue(text) {
      if (!this.textarea) return;
      this.textarea.value = text;
      this.updateLineNumbers();
      this.updateStats();
    }

    loadPreset(presetName) {
      if (SAMPLE_CODES[presetName]) {
        this.setValue(SAMPLE_CODES[presetName]);
        return true;
      }
      return false;
    }

    clear() {
      this.setValue('');
    }
  }

  return {
    EditorManager,
    SAMPLE_CODES
  };
});
