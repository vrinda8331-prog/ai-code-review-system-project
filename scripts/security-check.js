/**
 * CodeLens AI - Pre-Push & Repository Security Scanner
 * Scans all tracked files for accidental secret leaks before pushing to GitHub.
 * Run with: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');
const SecurityLayer = require('../js/engine/securityLayer');

const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', 'build']);
const IGNORE_FILES = new Set(['package-lock.json', 'history.json']);

let totalFilesScanned = 0;
let totalLeaksFound = 0;

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      if (!IGNORE_FILES.has(entry.name)) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath) {
  // Only check code and text files
  const ext = path.extname(filePath).toLowerCase();
  const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.md', '.env'];
  if (!textExtensions.includes(ext)) return;

  // Don't scan the securityLayer itself or securityScanner regex definition
  if (filePath.includes('securityLayer.js') || filePath.includes('securityScanner.js')) return;

  totalFilesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  const leaks = SecurityLayer.detectSecretLeaks(content);

  if (leaks.length > 0) {
    console.error(`\n🚨 [SECURITY VIOLATION] in ${path.relative(process.cwd(), filePath)}:`);
    leaks.forEach((leak) => {
      console.error(`   - ${leak.type}: ${leak.warning}`);
      totalLeaksFound++;
    });
  }
}

console.log('================================================================');
console.log('🛡️  CodeLens AI Security Layer: Running Pre-Push Audit...');
console.log('================================================================');

scanDirectory(path.join(__dirname, '..'));

console.log(`\nScan Complete: Scanned ${totalFilesScanned} files.`);
if (totalLeaksFound === 0) {
  console.log('✅ CLEAN! Zero secrets or push-blocking tokens detected.');
  console.log('Safe to push to remote repository (GitHub Push Protection compliant).');
  process.exit(0);
} else {
  console.error(`\n❌ BLOCKED! Found ${totalLeaksFound} secret leaks.`);
  console.error('Please redact or replace secrets before pushing to GitHub.');
  process.exit(1);
}

