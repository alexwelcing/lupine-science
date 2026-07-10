#!/usr/bin/env node
// Performance budget gate. Statically resolves every same-origin asset each
// page references (src/href/srcset/poster + the two runtime fetches), sizes
// them (brotli for text, raw for binary — matching what the edge serves),
// and fails the build on any regression past the budgets below.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const BUDGETS = {
  // per-page cold transfer, videos excluded (they are preload=none / user-initiated)
  page: { '/': 600 * 1024, '/articles/': 2500 * 1024, '/brand-assets/': 45000 * 1024, default: 420 * 1024 },
  htmlBrotli: 32 * 1024,          // any single page document, compressed
  fontsTotal: 200 * 1024,         // whole font directory
  singleImage: 250 * 1024,        // any raster the pages reference
  singleVideo: 3.0 * 1024 * 1024, // the narrated launch film re-encode
};

const TEXT = /\.(html|css|js|mjs|json|svg|xml|txt)$/;
const VIDEO = /\.(mp4|webm)$/;
const IMAGE = /\.(png|jpe?g|webp|avif|gif|ico)$/;
const DOWNLOAD = /\.(pdf|zip|gz|tar)$/;

const size = (abs) => {
  const raw = fs.readFileSync(abs);
  return TEXT.test(abs) ? zlib.brotliCompressSync(raw).length : raw.length;
};
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

function assetsOf(html, pagePath) {
  const found = new Set();
  const patterns = [
    /(?:src|href|poster)="(\/[^"]+)"/g,
    /srcset="([^"]+)"/g,
    /fetch\("(\/[^"]+)"\)/g,
    /"(\/data\/[a-z0-9_]+\.json)"/g,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      for (const part of m[1].split(',')) {
        const url = part.trim().split(/\s+/)[0];
        if (!url.startsWith('/')) continue;
        const abs = path.join(PUBLIC, url.replace(/^\//, ''));
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) found.add(abs);
      }
    }
  }
  return [...found];
}

const failures = [];
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
})(PUBLIC);

console.log('── perf budget ──');
for (const page of pages) {
  const rel = '/' + path.relative(PUBLIC, path.dirname(page)).replace(/\\/g, '/');
  const urlPath = rel === '/.' || rel === '/' ? '/' : rel + '/';
  const html = fs.readFileSync(page, 'utf8');
  const docBytes = zlib.brotliCompressSync(html).length;
  if (docBytes > BUDGETS.htmlBrotli) {
    failures.push(`${urlPath}: document ${kb(docBytes)} > ${kb(BUDGETS.htmlBrotli)} (brotli)`);
  }
  let total = docBytes;
  for (const asset of assetsOf(html, page)) {
    const s = size(asset);
    const rel2 = '/' + path.relative(PUBLIC, asset).replace(/\\/g, '/');
    if (VIDEO.test(asset)) {
      if (s > BUDGETS.singleVideo) failures.push(`${rel2}: video ${kb(s)} > ${kb(BUDGETS.singleVideo)}`);
      continue; // preload=none — not part of cold transfer
    }
    if (IMAGE.test(asset) && s > BUDGETS.singleImage) {
      failures.push(`${rel2}: image ${kb(s)} > ${kb(BUDGETS.singleImage)}`);
    }
    if (DOWNLOAD.test(asset)) continue; // user-initiated downloads are not cold-transfer render bytes
    total += s;
  }
  const cap = BUDGETS.page[urlPath] || BUDGETS.page.default;
  const flag = total > cap ? '  ✗ OVER' : '';
  console.log(`  ${urlPath.padEnd(56)} ${kb(total).padStart(10)} / ${kb(cap)}${flag}`);
  if (total > cap) failures.push(`${urlPath}: cold transfer ${kb(total)} > ${kb(cap)}`);
}

const fontsTotal = fs.readdirSync(path.join(PUBLIC, 'fonts'))
  .reduce((s, f) => s + fs.statSync(path.join(PUBLIC, 'fonts', f)).size, 0);
console.log(`  fonts/ total${' '.repeat(44)}${kb(fontsTotal).padStart(10)} / ${kb(BUDGETS.fontsTotal)}`);
if (fontsTotal > BUDGETS.fontsTotal) failures.push(`fonts total ${kb(fontsTotal)} > ${kb(BUDGETS.fontsTotal)}`);

if (failures.length) {
  console.error('\nperf budget FAILED:');
  for (const f of failures) console.error(`  [over] ${f}`);
  process.exit(1);
}
console.log('perf budget passed.');
