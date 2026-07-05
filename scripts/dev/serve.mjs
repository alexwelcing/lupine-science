#!/usr/bin/env node
// Dev static server for public/ that also enforces public/_headers the way
// Cloudflare Pages does, so local checks exercise the same CSP and caching
// policy as production.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

// Parse public/_headers (Cloudflare Pages format): rule lines are URL
// patterns at column 0, header lines are indented "Name: value".
function loadHeaderRules() {
  const file = path.join(PUBLIC, '_headers');
  if (!fs.existsSync(file)) return [];
  const rules = [];
  let current = null;
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      current = { pattern: raw.trim(), headers: [] };
      rules.push(current);
    } else if (current) {
      const idx = raw.indexOf(':');
      if (idx > 0) current.headers.push([raw.slice(0, idx).trim(), raw.slice(idx + 1).trim()]);
    }
  }
  return rules;
}

function patternToRegex(pattern) {
  // Cloudflare Pages supports * (splat) and :placeholder segments.
  const esc = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/:[a-zA-Z0-9_]+/g, '[^/]+');
  return new RegExp(`^${esc}$`);
}

function headersFor(urlPath, rules) {
  // Pages semantics: later matching rules override earlier ones per header name.
  const out = new Map();
  for (const rule of rules) {
    if (patternToRegex(rule.pattern).test(urlPath)) {
      for (const [k, v] of rule.headers) out.set(k.toLowerCase(), [k, v]);
    }
  }
  return [...out.values()];
}

const server = http.createServer((req, res) => {
  const rules = loadHeaderRules(); // re-read per request: live editing
  let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let filePath = path.normalize(path.join(PUBLIC, urlPath));
  if (!filePath.startsWith(PUBLIC)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
    if (!urlPath.endsWith('/')) urlPath += '/';
  }
  if (!fs.existsSync(filePath)) {
    // extensionless files like /health
    if (fs.existsSync(filePath.replace(/\/$/, ''))) filePath = filePath.replace(/\/$/, '');
    else { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found'); return; }
  }
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('content-type', MIME[ext] || 'application/octet-stream');
  for (const [k, v] of headersFor(urlPath, rules)) res.setHeader(k, v);
  const body = fs.readFileSync(filePath);
  res.setHeader('content-length', body.length);
  res.writeHead(200);
  res.end(body);
});

server.listen(PORT, () => console.log(`lupine.science dev server → http://localhost:${PORT} (serving ${PUBLIC}, _headers enforced)`));
