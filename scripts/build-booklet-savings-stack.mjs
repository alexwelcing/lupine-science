#!/usr/bin/env node
// Build "The Savings Stack" booklet PDF — bespoke HTML+CSS → print PDF.
//
// Source:  media/booklets/savings-stack/index.html (served at /booklet/)
// Output:  public/booklets/the-savings-stack.pdf (committed, like public/papers/)
//
// Follows the scripts/build-proofpack.mjs pattern: deterministic local render
// over a loopback static server, Playwright Chromium print-to-PDF, repository
// fonts only (Proof Unicode + IBM Plex Mono — never the Newsreader webfont,
// which Chromium emits as unreliable Type 3 in PDFs; docs/brand-book.md §6.4),
// no network access during render, fonts awaited before printing.
//
// QA: reuses scripts/check-pdf.mjs inspectPdf with booklet expectations
// (tests/fixtures/pdf-qa-savings-stack-booklet.json): page count/size, all
// fonts embedded + Unicode-mapped, required/forbidden text markers — the
// retracted 624 / 79% figures are forbidden markers by design.
//
// Usage: node scripts/build-booklet-savings-stack.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { inspectPdf } from './check-pdf.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const BOOKLET_SRC = path.join(ROOT, 'media', 'booklets', 'savings-stack');
const OUT_DIR = path.join(PUBLIC, 'booklets');
const OUT_PDF = path.join(OUT_DIR, 'the-savings-stack.pdf');
const EXPECTATIONS = path.join(ROOT, 'tests', 'fixtures', 'pdf-qa-savings-stack-booklet.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serve(rootMap) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let filePath;
      for (const [prefix, root] of rootMap) {
        if (urlPath === prefix || urlPath.startsWith(`${prefix}/`)) {
          filePath = path.normalize(path.join(root, urlPath.slice(prefix.length)));
          if (!filePath.startsWith(root)) filePath = undefined;
          break;
        }
      }
      if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!filePath || !fs.existsSync(filePath)) {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
        return;
      }
      const body = fs.readFileSync(filePath);
      res.writeHead(200, {
        'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'content-length': body.length,
      });
      res.end(body);
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function main() {
  if (!fs.existsSync(path.join(BOOKLET_SRC, 'index.html'))) {
    throw new Error(`booklet source missing: ${BOOKLET_SRC}/index.html`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // /booklet/ serves the booklet source; everything else serves public/.
  const { server, baseUrl } = await serve([
    ['/booklet', BOOKLET_SRC],
    ['', PUBLIC],
  ]);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    // Deterministic, offline render: anything not on the loopback server dies.
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (/^(?:https?:\/\/)?(?:127\.0\.0\.1|localhost)(?::|\/|$)/i.test(url)) route.continue();
      else route.abort('internetdisconnected');
    });
    await page.goto(`${baseUrl}/booklet/index.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((resolve) => { img.onload = img.onerror = resolve; }))
      )
    ).catch(() => {});
    await page.waitForTimeout(200);
    await page.pdf({
      path: OUT_PDF,
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: false,
    });
    await page.close();
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  const bytes = fs.statSync(OUT_PDF).size;
  console.log(`wrote ${path.relative(ROOT, OUT_PDF)} (${bytes} bytes)`);

  const report = await inspectPdf(OUT_PDF, EXPECTATIONS);
  console.log(`pages: ${report.info.Pages}; size: ${report.info['Page size']}`);
  console.log(`fonts: ${report.fonts.uniqueNames.join(', ')} — embedded=${report.fonts.allEmbedded}, unicode=${report.fonts.allUnicodeMapped}`);
  // Brand rule (docs/brand-book.md §6.4): repository-local fonts only. Any
  // system fallback (Liberation, DejaVu, ...) means an uncovered glyph crept
  // into the copy — fail loudly rather than ship a mixed-font booklet.
  const systemFonts = report.fonts.uniqueNames.filter((name) => !/NotoSerif|IBMPlexMono/.test(name));
  if (systemFonts.length) {
    console.error(`[error] non-repository fonts in PDF (uncovered glyphs): ${systemFonts.join(', ')}`);
    process.exit(1);
  }
  for (const warning of report.warnings) console.warn(`[warning] ${warning}`);
  for (const failure of report.failures) console.error(`[error] ${failure}`);
  if (report.failures.length) process.exit(1);
  console.log('Booklet QA passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
