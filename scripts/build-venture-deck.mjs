#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { chromiumExecutablePath } from './lib/chromium-executable.mjs';
import { PDFDocument, PDFName } from 'pdf-lib';
import { assertSupportedSlideCount, validateDeckHtml } from './venture-deck-tools.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.join(ROOT, 'media/projects/venture-deck');
const PUBLIC = path.join(ROOT, 'public');
const PUBLIC_VENTURE = path.join(PUBLIC, 'venture');
const TEMPLATE = path.join(PROJECT, 'index.html');
const LANDING = path.join(PROJECT, 'landing.html');
const EVIDENCE = path.join(PROJECT, 'evidence-manifest.json');
const ASSET_LOCK = path.join(PROJECT, 'asset-lock.json');
const PROJECT_PDF = path.join(PROJECT, 'lupine-science-venture-deck.pdf');
const PUBLIC_PDF = path.join(PUBLIC_VENTURE, 'lupine-science-venture-deck.pdf');
const PUBLIC_DECK = path.join(PUBLIC_VENTURE, 'deck.html');
const PUBLIC_LANDING = path.join(PUBLIC_VENTURE, 'index.html');
const BUILD_MANIFEST = path.join(PROJECT, 'build-manifest.json');
const FIXED_DATE = new Date('2026-07-28T00:00:00.000Z');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function copy(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function renderDeckHtml() {
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  if (!template.includes('__EVIDENCE_MANIFEST__')) throw new Error('deck template is missing evidence manifest marker');
  const evidence = fs.readFileSync(EVIDENCE, 'utf8').trim().replace(/<\//g, '<\\/');
  return template.replace('__EVIDENCE_MANIFEST__', evidence);
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let file = path.resolve(PUBLIC, `.${pathname}`);
      const relative = path.relative(PUBLIC, file);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        response.writeHead(403, { 'content-type': 'text/plain' }).end('forbidden');
        return;
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        response.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
        return;
      }
      const mime = new Map([
        ['.html', 'text/html; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
        ['.png', 'image/png'], ['.woff2', 'font/woff2'], ['.pdf', 'application/pdf'],
      ]).get(path.extname(file).toLowerCase()) || 'application/octet-stream';
      const body = fs.readFileSync(file);
      response.writeHead(200, { 'content-type': mime, 'content-length': body.length });
      response.end(body);
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function normalizePdf(file) {
  const document = await PDFDocument.load(fs.readFileSync(file), { updateMetadata: false });
  document.setTitle('Lupine Science Venture Deck');
  document.setAuthor('Lupine Science');
  document.setSubject('Source-locked venture presentation');
  document.setCreator('scripts/build-venture-deck.mjs');
  document.setProducer('scripts/build-venture-deck.mjs');
  document.setCreationDate(FIXED_DATE);
  document.setModificationDate(FIXED_DATE);
  try {
    const trailer = document.context.trailer;
    if (trailer?.get(PDFName.of('ID'))) trailer.set(PDFName.of('ID'), document.context.obj([]));
  } catch {}
  fs.writeFileSync(file, await document.save({ useObjectStreams: false, updateMetadata: false }));
}

async function main() {
  fs.mkdirSync(PUBLIC_VENTURE, { recursive: true });
  const html = renderDeckHtml();
  const slideCount = [...html.matchAll(/<section class="slide(?: is-active)?"(?=\s|>)/g)].length;
  assertSupportedSlideCount(slideCount);
  fs.writeFileSync(PUBLIC_DECK, html);
  copy(LANDING, PUBLIC_LANDING);
  copy(EVIDENCE, path.join(PUBLIC_VENTURE, 'evidence-manifest.json'));
  copy(ASSET_LOCK, path.join(PUBLIC_VENTURE, 'asset-lock.json'));
  await validateDeckHtml({ htmlPath: PUBLIC_DECK, webRoot: PUBLIC, media: 'screen', viewport: { width: 1920, height: 1080 } });

  const { server, origin } = await startServer();
  let browser;
  let browserServer;
  try {
    // launchServer + connect rather than launch(), so teardown holds a real
    // BrowserServer. A Playwright `Browser` has NO process() method — that lives on
    // BrowserServer — so the earlier `browser.process()?.kill()` fallback threw a
    // TypeError straight into an empty catch and killed nothing. Verified:
    // typeof browser.process === 'undefined', typeof browserServer.kill === 'function'.
    browserServer = await chromium.launchServer({
      headless: true,
      executablePath: chromiumExecutablePath(),
    });
    browser = await chromium.connect(browserServer.wsEndpoint());
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.origin === origin) route.continue();
      else route.abort('internetdisconnected');
    });
    await page.goto(`${origin}/venture/deck.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: PROJECT_PDF, printBackground: true, preferCSSPageSize: true, tagged: false });
    await page.close();
  } finally {
    // Hardening, not a bug fix: both teardown steps were unbounded waits.
    //
    // A run under heavy load was reported as hanging forever here. It did NOT
    // reproduce — tests/render/venture-deck-tooling.test.mjs passes 16/16 in ~21s, three
    // times consecutively on unmodified main, and `npm test` never excluded it. So
    // treat the report as unconfirmed. What IS true is that `browser.close()` never
    // returns if Chromium wedges (it does wedge on this headless install — the
    // proof-pack builder hits `page.pdf: Protocol error`), and an unbounded wait
    // turns that into a silent stall with no diagnostic. Bounding it costs nothing
    // and converts a mystery into a message.
    if (browser) {
      // The guard timer MUST be cleared, and unref'd besides. A pending 20s timer
      // holds the event loop open even after browser.close() wins the race, which
      // took this script from 21s to 80s across the suite's three invocations —
      // a watchdog that made the thing it guards four times slower.
      let guard;
      const closed = await Promise.race([
        browser.close().then(() => true, () => true),
        new Promise((resolve) => { guard = setTimeout(() => resolve(false), 20_000); guard.unref?.(); }),
      ]);
      clearTimeout(guard);
      if (!closed) {
        console.error('build-venture-deck: browser.close() timed out after 20s, killing the browser process');
        browserServer?.kill();
      }
    }
    if (browserServer) {
      let guard;
      const stopped = await Promise.race([
        browserServer.close().then(() => true, () => true),
        new Promise((resolve) => { guard = setTimeout(() => resolve(false), 10_000); guard.unref?.(); }),
      ]);
      clearTimeout(guard);
      if (!stopped) browserServer.kill();
    }
    // `server.close()` only fires its callback once every connection has ended, so a
    // single lingering Chromium keep-alive socket wedges it permanently. Drop the
    // sockets first; without this the await below is an indefinite wait by design.
    server.closeAllConnections?.();
    await new Promise((resolve) => {
      const done = setTimeout(resolve, 10_000);
      done.unref?.();
      server.close(() => { clearTimeout(done); resolve(); });
    });
  }

  await normalizePdf(PROJECT_PDF);
  copy(PROJECT_PDF, PUBLIC_PDF);

  const pdfDocument = await PDFDocument.load(fs.readFileSync(PROJECT_PDF));
  if (pdfDocument.getPageCount() !== slideCount) throw new Error(`PDF page count ${pdfDocument.getPageCount()} does not match slide count ${slideCount}`);
  const manifest = {
    schema_version: '1.0',
    build: 'scripts/build-venture-deck.mjs',
    fixed_metadata_date: FIXED_DATE.toISOString(),
    slide_count: slideCount,
    inputs: {
      html_template: { path: path.relative(ROOT, TEMPLATE), sha256: sha256(TEMPLATE) },
      narrative: { path: 'media/projects/venture-deck/narrative-script.md', sha256: sha256(path.join(PROJECT, 'narrative-script.md')) },
      evidence_manifest: { path: path.relative(ROOT, EVIDENCE), sha256: sha256(EVIDENCE) },
      asset_lock: { path: path.relative(ROOT, ASSET_LOCK), sha256: sha256(ASSET_LOCK) },
      art_direction: { path: 'media/projects/venture-deck/art-direction.md', sha256: sha256(path.join(PROJECT, 'art-direction.md')) },
    },
    outputs: {
      html: { path: path.relative(ROOT, PUBLIC_DECK), sha256: sha256(PUBLIC_DECK) },
      pdf: { path: path.relative(ROOT, PROJECT_PDF), sha256: sha256(PROJECT_PDF), bytes: fs.statSync(PROJECT_PDF).size, pages: pdfDocument.getPageCount() },
      public_pdf: { path: path.relative(ROOT, PUBLIC_PDF), sha256: sha256(PUBLIC_PDF), bytes: fs.statSync(PUBLIC_PDF).size, pages: pdfDocument.getPageCount() },
      landing: { path: path.relative(ROOT, PUBLIC_LANDING), sha256: sha256(PUBLIC_LANDING) },
    },
  };
  fs.writeFileSync(BUILD_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  copy(BUILD_MANIFEST, path.join(PUBLIC_VENTURE, 'build-manifest.json'));

  console.log(`venture HTML: ${path.relative(ROOT, PUBLIC_DECK)}`);
  console.log(`venture PDF: ${path.relative(ROOT, PROJECT_PDF)} (${pdfDocument.getPageCount()} pages, ${fs.statSync(PROJECT_PDF).size} bytes)`);
  console.log(`venture surface: ${path.relative(ROOT, PUBLIC_LANDING)}`);
  console.log(`build manifest: ${path.relative(ROOT, BUILD_MANIFEST)}`);
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
