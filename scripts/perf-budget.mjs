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
  page: {
    '/': 1200 * 1024,             // hero canvas + real benchmark data + fonts
    '/articles/': 2500 * 1024,
    '/brand-assets/': 45000 * 1024,
    default: 1024 * 1024,         // ample headroom for graphics-heavy static pages
  },
  articlePage: 2.5 * 1024 * 1024,
  htmlBrotli: 48 * 1024,          // publication pages carry structured data + captions
  fontsTotal: 1200 * 1024,        // self-hosted variable + mono + italic subset
  singleImage: 350 * 1024,        // hero/card JPEGs at publication quality
  singleVideo: 100 * 1024 * 1024, // 1080p narrated article films, user-initiated; quality-first
  singleScript: 15 * 1024,        // hand-written enhancement modules (brotli) — no bundles
};

const TEXT = /\.(html|css|js|mjs|json|svg|xml|txt)$/;
const SCRIPT = /\.(js|mjs)$/;
const VIDEO = /\.(mp4|webm)$/;
const IMAGE = /\.(png|jpe?g|webp|avif|gif|ico)$/;
const DOWNLOAD = /\.(pdf|zip|gz|tar)$/;

const size = (abs) => {
  const raw = fs.readFileSync(abs);
  return TEXT.test(abs) ? zlib.brotliCompressSync(raw).length : raw.length;
};
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

// A <picture> transfers exactly ONE of its candidates — the browser picks a single
// source. Summing avif + webp + jpg overstated every <picture> on the site by ~2.5x,
// which silently inflated the article pages (they have used pictureSources() for
// heroes all along) and turned adding poster derivatives into a 964.9 -> 1688.4 KB
// "regression" that no user would ever have experienced.
//
// This counts one candidate per <picture>, and deliberately the LARGEST one, not the
// smallest: the point is a conservative upper bound on real transfer, not a number
// that flatters the page. A browser choosing avif does better than this reports.
function pictureAdjustment(html, resolveAsset) {
  const chosen = new Set();
  const suppressed = new Set();
  for (const block of html.matchAll(/<picture\b[^>]*>([\s\S]*?)<\/picture>/g)) {
    const candidates = new Set();
    for (const re of [/(?:src)="([^"]+)"/g, /srcset="([^"]+)"/g]) {
      for (const m of block[1].matchAll(re)) {
        for (const part of m[1].split(',')) {
          const abs = resolveAsset(part.trim().split(/\s+/)[0]);
          if (abs) candidates.add(abs);
        }
      }
    }
    if (candidates.size === 0) continue;
    const largest = [...candidates].reduce((a, b) => (fs.statSync(a).size >= fs.statSync(b).size ? a : b));
    chosen.add(largest);
    for (const c of candidates) if (c !== largest) suppressed.add(c);
  }
  return { chosen, suppressed };
}

function assetsOf(html, pagePath) {
  const found = new Set();
  const patterns = [
    /(?:src|href|poster)="([^"]+)"/g,
    /srcset="([^"]+)"/g,
    /fetch\("([^"]+)"\)/g,
    /import\("([^"]+)"\)/g,
    /"(\/data\/[a-z0-9_]+\.json)"/g,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      for (const part of m[1].split(',')) {
        const url = part.trim().split(/\s+/)[0];
        if (!url || url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('data:')) continue;
        // Strip cache-bust query/hash before resolving — otherwise every
        // busted asset (?v=N) misses existsSync and escapes the budget.
        const clean = url.split(/[?#]/)[0];
        let resolved = clean;
        if (!clean.startsWith('/')) {
          resolved = path.posix.join(pagePath, clean);
        }
        const abs = path.join(PUBLIC, resolved.replace(/^\//, ''));
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) found.add(abs);
      }
    }
  }
  // Collapse each <picture> to its single largest candidate — see pictureAdjustment.
  const { chosen, suppressed } = pictureAdjustment(html, (url) => {
    if (!url || url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('data:')) return null;
    const clean = url.split(/[?#]/)[0];
    const resolved = clean.startsWith('/') ? clean : path.posix.join(pagePath, clean);
    const abs = path.join(PUBLIC, resolved.replace(/^\//, ''));
    return fs.existsSync(abs) && fs.statSync(abs).isFile() ? abs : null;
  });
  for (const s of suppressed) found.delete(s);
  for (const c of chosen) found.add(c);
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
  for (const asset of assetsOf(html, urlPath)) {
    const s = size(asset);
    const rel2 = '/' + path.relative(PUBLIC, asset).replace(/\\/g, '/');
    if (VIDEO.test(asset)) {
      if (s > BUDGETS.singleVideo) failures.push(`${rel2}: video ${kb(s)} > ${kb(BUDGETS.singleVideo)}`);
      continue; // preload=none — not part of cold transfer
    }
    if (IMAGE.test(asset) && s > BUDGETS.singleImage) {
      failures.push(`${rel2}: image ${kb(s)} > ${kb(BUDGETS.singleImage)}`);
    }
    if (SCRIPT.test(asset) && s > BUDGETS.singleScript) {
      failures.push(`${rel2}: script ${kb(s)} > ${kb(BUDGETS.singleScript)} (brotli)`);
    }
    if (DOWNLOAD.test(asset)) continue; // user-initiated downloads are not cold-transfer render bytes
    total += s;
  }
  const cap = BUDGETS.page[urlPath]
      || (urlPath.startsWith('/articles/') && urlPath !== '/articles/' ? BUDGETS.articlePage : BUDGETS.page.default);
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
