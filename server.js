/**
 * CodeLens AI - Native Node.js Backend Server
 * Tech Stack: Pure JavaScript (Node.js built-in http, fs, path, url)
 * Zero external npm dependencies required!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load Server-Side Static Analysis Engine & Security Layer
const Analyzer = require('./js/engine/analyzer');
const SecurityLayer = require('./js/engine/securityLayer');

const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');
const MAX_PAYLOAD_SIZE = 2 * 1024 * 1024; // 2MB Security Limit

// Ensure data directory and history file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]), 'utf8');
}

// Security Headers Middleware
function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
  );
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper to send JSON responses with security headers
function sendJSON(res, statusCode, data) {
  applySecurityHeaders(res);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data, null, 2));
}

// Helper to parse and sanitize JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_PAYLOAD_SIZE) {
        reject(new Error('Payload too large (Security Limit: 2MB)'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

// Create Native HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API ROUTES ---

  // Health check endpoint
  if (pathname === '/api/health' && method === 'GET') {
    return sendJSON(res, 200, {
      status: 'ok',
      service: 'CodeLens AI Native Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // Code analysis endpoint
  if (pathname === '/api/analyze' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const code = data.code || '';
      const filename = data.filename || 'code.js';
      const options = {
        overrideLanguage: data.language
      };

      const result = Analyzer.analyze(code, filename, options);
      return sendJSON(res, 200, result);
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  // History GET endpoint
  if (pathname === '/api/history' && method === 'GET') {
    try {
      const content = fs.readFileSync(HISTORY_FILE, 'utf8');
      const items = JSON.parse(content || '[]');
      return sendJSON(res, 200, items);
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to read history' });
    }
  }

  // History POST endpoint
  if (pathname === '/api/history' && method === 'POST') {
    try {
      const review = await parseBody(req);
      if (!review.id) {
        return sendJSON(res, 400, { error: 'Missing review id' });
      }

      const content = fs.readFileSync(HISTORY_FILE, 'utf8');
      let items = JSON.parse(content || '[]');
      items = [review, ...items.filter((i) => i.id !== review.id)].slice(0, 50);

      fs.writeFileSync(HISTORY_FILE, JSON.stringify(items, null, 2), 'utf8');
      return sendJSON(res, 201, { success: true, savedId: review.id });
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  // History DELETE endpoint
  if (pathname === '/api/history' && method === 'DELETE') {
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf8');
      return sendJSON(res, 200, { success: true, message: 'History cleared' });
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to clear history' });
    }
  }

  // --- STATIC FILES SERVING ---
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  // Prevent directory traversal attacks
  const safePath = path.resolve(filePath);
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #0d1117; color: #fff;">
          <h2>404 - File Not Found</h2>
          <p><a href="/" style="color: #38bdf8;">Return to CodeLens AI Dashboard</a></p>
        </div>
      `);
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(safePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }

      applySecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Start listening if run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log('================================================================');
    console.log(`🚀 CodeLens AI Platform Server running at: http://localhost:${PORT}`);
    console.log(`⚡ Tech Stack: Pure HTML, CSS, Vanilla JS & Native Node.js HTTP`);
    console.log(`🔒 Static Analysis Engine: ACTIVE (Zero remote code execution)`);
    console.log('================================================================');
  });
}

module.exports = server;

