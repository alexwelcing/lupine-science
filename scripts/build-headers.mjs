#!/usr/bin/env node
// Generates public/_headers from scripts/_headers.template, replacing
// %SCRIPT_HASHES% with sha256 CSP hashes of every executable inline
// <script> found in public/**/*.html. JSON-LD (type="application/ld+json")
// is data, not code — CSP ignores it, so it is skipped.
//
// scripts/check-static.mjs recomputes these hashes and fails if _headers is
// stale, so an edited inline script can never ship with a broken CSP.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

export function collectScriptHashes() {
  const hashes = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.html')) {
        const html = fs.readFileSync(p, 'utf8');
        for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
          const attrs = m[1] || '';
          if (/\bsrc\s*=/i.test(attrs)) continue;
          const type = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
          if (type && !/javascript|module/i.test(type)) continue; // JSON-LD etc.
          const hash = crypto.createHash('sha256').update(m[2], 'utf8').digest('base64');
          hashes.add(`'sha256-${hash}'`);
        }
      }
    }
  };
  walk(PUBLIC);
  return [...hashes];
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const template = fs.readFileSync(path.join(ROOT, 'scripts', '_headers.template'), 'utf8');
  const hashes = collectScriptHashes();
  const out = template.replaceAll('%SCRIPT_HASHES%', hashes.join(' ') || "'none'");
  fs.writeFileSync(path.join(PUBLIC, '_headers'), out);
  console.log(`public/_headers written with ${hashes.length} inline-script hash(es)`);
}
