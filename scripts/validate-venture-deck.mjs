#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { removeGeneratedQaImages, validateClosureCertification } from './venture-deck-tools.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.join(ROOT, 'media/projects/venture-deck');
const PUBLIC = path.join(ROOT, 'public');
const HTML = path.join(PUBLIC, 'venture/deck.html');
const LANDING = path.join(PUBLIC, 'venture/index.html');
const PDF = path.join(PROJECT, 'lupine-science-venture-deck.pdf');
const EVIDENCE = path.join(PROJECT, 'evidence-manifest.json');
const ASSET_LOCK = path.join(PROJECT, 'asset-lock.json');
const STILL_BASELINE = path.join(ROOT, 'media/brand-campaign-2026-07-27/final-acceptance-manifest.json');
const WAVE4_AGGREGATE = path.join(PUBLIC, 'brand-assets/campaign-2026-07-27/wave-4/aggregate-manifest.json');
const QA = path.join(PROJECT, 'qa');
const REQUIRED_QA_REPORTS = [
  path.join(QA, 'independent-claim-audit-t_b3bd6408.md'),
  path.join(QA, 'remediation-ledger-t_d56cbe59.md'),
  path.join(QA, 'closure-builder-remediation-t_f0bda334.md'),
];
const ALLOWED_COLORS = new Set(['#faf9f6', '#16171d', '#3d4db3', '#8a5e1f']);
const failures = [];
const pass = (message) => console.log(`[pass] ${message}`);
const fail = (message) => failures.push(message);

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let file = path.resolve(PUBLIC, `.${pathname}`);
      const relative = path.relative(PUBLIC, file);
      if (relative.startsWith('..') || path.isAbsolute(relative)) return response.writeHead(403).end('forbidden');
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return response.writeHead(404).end('not found');
      const type = new Map([['.html','text/html; charset=utf-8'],['.json','application/json'],['.png','image/png'],['.woff2','font/woff2'],['.pdf','application/pdf']]).get(path.extname(file)) || 'application/octet-stream';
      const body = fs.readFileSync(file);
      response.writeHead(200, { 'content-type': type, 'content-length': body.length });
      response.end(body);
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function staticChecks() {
  for (const file of [HTML, LANDING, PDF, EVIDENCE, ASSET_LOCK, STILL_BASELINE, WAVE4_AGGREGATE, ...REQUIRED_QA_REPORTS]) {
    if (!fs.existsSync(file)) fail(`missing ${path.relative(ROOT, file)}`);
  }
  if (failures.length) return;

  const html = fs.readFileSync(HTML, 'utf8');
  const visibleHtml = html.replace(/<script type="application\/json" id="evidence-manifest">[\s\S]*?<\/script>/, '');
  const landing = fs.readFileSync(LANDING, 'utf8');
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE, 'utf8'));
  const lock = JSON.parse(fs.readFileSync(ASSET_LOCK, 'utf8'));
  const stillBaseline = JSON.parse(fs.readFileSync(STILL_BASELINE, 'utf8'));
  const wave4Aggregate = JSON.parse(fs.readFileSync(WAVE4_AGGREGATE, 'utf8'));
  const slideIds = [...html.matchAll(/<section class="slide(?: is-active)?" id="slide-(\d{2})"/g)].map((match) => match[1]);
  const expectedIds = Array.from({ length: 13 }, (_, index) => String(index + 1).padStart(2, '0'));
  if (JSON.stringify(slideIds) !== JSON.stringify(expectedIds)) fail(`slide sequence is ${slideIds.join(', ')}`); else pass('exactly 13 sequential slides');

  if (/<link[^>]+rel="stylesheet"|<script[^>]+src=/.test(html)) fail('deck has an external stylesheet or script dependency');
  else pass('all deck CSS/JS is inline');
  if (/https?:\/\//i.test(html.replace(/<script type="application\/json"[\s\S]*?<\/script>/, ''))) fail('deck contains a remote runtime URL');
  else pass('no remote runtime URLs');

  const colors = new Set([...`${html}\n${landing}`.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((match) => match[0].toLowerCase()));
  const disallowed = [...colors].filter((color) => !ALLOWED_COLORS.has(color));
  if (disallowed.length) fail(`disallowed authored colors: ${disallowed.join(', ')}`); else pass(`authored palette restricted to ${[...ALLOWED_COLORS].join(', ')}`);
  if (/rgba?\(|hsla?\(|gradient\(|box-shadow\s*:/i.test(html)) fail('deck contains opacity colors, gradients, or shadows');
  else pass('deck contains no gradients, shadows, or opacity colors');

  const embeddedMatch = html.match(/<script type="application\/json" id="evidence-manifest">([\s\S]*?)<\/script>/);
  if (!embeddedMatch) fail('missing embedded evidence manifest');
  else {
    try {
      const embedded = JSON.parse(embeddedMatch[1].replace(/<\\\//g, '</'));
      if (JSON.stringify(embedded) !== JSON.stringify(evidence)) fail('embedded evidence manifest differs from source');
      else pass('evidence manifest carried through byte-equivalent JSON data');
    } catch (error) { fail(`embedded evidence manifest is invalid: ${error.message}`); }
  }

  const claimIds = new Set(Object.keys(evidence.claims));
  for (const match of html.matchAll(/data-claim-id="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) if (!claimIds.has(id)) fail(`unknown claim id ${id}`);
  }
  if (!failures.some((item) => item.startsWith('unknown claim id'))) pass('all rendered claim IDs resolve in evidence manifest');

  if ((visibleHtml.match(/\[OWNER DECISION\]/g) || []).length !== 3) fail('deck must contain exactly three [OWNER DECISION] fields');
  else pass('three owner-controlled financing fields preserved');
  if (!visibleHtml.includes('One 30-path panel. One chemistry family. Not peer-reviewed.')) fail('mandatory risk headline is missing');
  else pass('mandatory risk headline is exact');
  if (/(?<!1)4\.65/.test(visibleHtml)) fail('deck contains forbidden unsupported 4.65');
  else pass('forbidden standalone 4.65 claim absent');
  const scopedStillClaim = '100/100 unique still slots';
  const scopedStillClaimCount = visibleHtml.split(scopedStillClaim).length - 1;
  const otherHundredClaims = visibleHtml.replaceAll(scopedStillClaim, '').match(/100\/100/gi) || [];
  if (scopedStillClaimCount !== 1) fail(`deck must contain exactly one precisely scoped "${scopedStillClaim}" claim`);
  else if (otherHundredClaims.length) fail('deck contains an unscoped 100/100 claim');
  else if (!visibleHtml.includes('33 certified baseline stills + 67 independently certified Wave-4 replacements')) fail('deck is missing the certified 33 + 67 still-slot arithmetic');
  else if (!visibleHtml.includes('Closure gate t_c2a1f8e3')) fail('deck is missing the visible closure-gate citation');
  else if (!visibleHtml.includes('five certified films excluded from the denominator')) fail('deck does not keep the five films outside the still denominator');
  else pass('100/100 claim is precisely scoped to unique still slots with visible gate citation and films excluded');

  const closureClaim = evidence.claims['C-STILL-CLOSURE-01'];
  const closureDecision = evidence.discrepancies_and_exclusions['D-100-CHAIN'];
  for (const error of validateClosureCertification({ baseline: stillBaseline, aggregate: wave4Aggregate, evidence })) fail(error);
  if (stillBaseline.images?.accepted !== 33 || stillBaseline.videos?.accepted !== 5) fail('baseline manifest no longer records 33 accepted stills and five separately accepted films');
  if (wave4Aggregate.asset_count !== 67 || wave4Aggregate.unique_asset_id_count !== 67 || wave4Aggregate.unique_output_sha256_count !== 67) fail('Wave-4 aggregate no longer certifies 67 unique replacement stills');
  if (stillBaseline.images?.accepted + wave4Aggregate.asset_count !== 100) fail('certified still-slot closure arithmetic no longer equals 100');
  if (evidence.sources['S-STILL-BASELINE']?.sha256 !== sha256(STILL_BASELINE) || evidence.sources['S-WAVE4-AGGREGATE']?.sha256 !== sha256(WAVE4_AGGREGATE)) fail('closure source hash mismatch in evidence manifest');
  if (closureClaim?.claim !== '33 certified baseline stills + 67 independently certified Wave-4 replacements = 100/100 unique still slots.' || closureClaim?.closure_gate_task !== 't_c2a1f8e3' || closureClaim?.films_outside_denominator !== 5) fail('evidence manifest closure claim is missing or incorrectly scoped');
  if (closureDecision?.decision !== 'Use only the precisely scoped 100/100 unique still slots closure claim; do not imply models, campaigns, films, or generic certification.') fail('D-100-CHAIN does not preserve the precise closure scope');
  if (!failures.some((item) => /baseline|aggregate|child certification|per-asset|certified outputs|closure arithmetic|closure source|closure claim|D-100-CHAIN/.test(item))) pass('closure evidence proves 33 + 67 = 100 still slots with all certifications passing and five films separate');
  if (!visibleHtml.includes('$14.65 cloud-equivalent')) fail('source-backed $14.65 is missing');
  else pass('source-backed $14.65 is present');

  const imageSources = [...html.matchAll(/<img class="deck-asset"[^>]+src="([^"]+)"/g)].map((match) => match[1].replace(/^\//, 'public/'));
  const lockedSources = lock.assets.map((asset) => asset.path);
  if (JSON.stringify(imageSources) !== JSON.stringify(lockedSources)) fail('rendered asset sequence differs from asset lock');
  else pass('one unique locked Wave-4 asset per slide');
  for (const asset of lock.assets) {
    const file = path.join(ROOT, asset.path);
    if (!fs.existsSync(file)) { fail(`missing locked asset ${asset.path}`); continue; }
    if (sha256(file) !== asset.sha256) fail(`SHA-256 mismatch for ${asset.path}`);
    const metadata = await sharp(file).metadata();
    if (metadata.width !== asset.width || metadata.height !== asset.height) fail(`dimension mismatch for ${asset.path}`);
  }
  if (!failures.some((item) => /locked asset|mismatch/.test(item))) pass('all 13 locked asset hashes and dimensions match');

  for (const required of ['/venture/deck.html', '/venture/lupine-science-venture-deck.pdf', '/venture/evidence-manifest.json']) {
    if (!landing.includes(required)) fail(`landing page missing ${required}`);
  }
  if (!failures.some((item) => item.startsWith('landing page'))) pass('/venture/ links HTML, PDF, and evidence manifest');

  const pdf = await PDFDocument.load(fs.readFileSync(PDF));
  if (pdf.getPageCount() !== 13) fail(`PDF has ${pdf.getPageCount()} pages`); else pass('PDF exists with 13 pages');
  const wrongSize = pdf.getPages().findIndex((page) => {
    const { width, height } = page.getSize();
    return Math.abs(width - 960) > 1 || Math.abs(height - 540) > 1;
  });
  if (wrongSize >= 0) fail(`PDF page ${wrongSize + 1} is not 16:9 960×540pt`); else pass('all PDF pages are 16:9 (960×540pt)');
}

async function browserChecks() {
  if (failures.length) return;
  const lock = JSON.parse(fs.readFileSync(ASSET_LOCK, 'utf8'));
  const { server, origin } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const requests = [];
    const consoleErrors = [];
    page.on('request', (request) => requests.push(request.url()));
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.origin === origin) route.continue();
      else route.abort('internetdisconnected');
    });
    await page.goto(`${origin}/venture/deck.html#slide-01`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));

    const fontState = await page.evaluate(() => ({ newsreader: document.fonts.check('68px "Newsreader"'), mono: document.fonts.check('20px "IBM Plex Mono"') }));
    if (!fontState.newsreader || !fontState.mono) fail(`font check failed: ${JSON.stringify(fontState)}`); else pass('repository Newsreader and IBM Plex Mono fonts loaded');
    if (consoleErrors.length) fail(`browser console errors: ${consoleErrors.join(' | ')}`); else pass('browser console is clean');
    const remote = requests.filter((raw) => { const url = new URL(raw); return url.hostname !== '127.0.0.1' && url.hostname !== 'localhost'; });
    if (remote.length) fail(`remote network requests: ${remote.join(', ')}`); else pass('runtime network requests are local-only');

    await page.emulateMedia({ media: 'print' });
    const geometry = await page.evaluate((expectedAssets) => {
      const slides = [...document.querySelectorAll('.slide')];
      const issues = [];
      for (const [index, slide] of slides.entries()) {
        const rect = slide.getBoundingClientRect();
        if (Math.abs(rect.width - 1920) > 0.5 || Math.abs(rect.height - 1080) > 0.5) issues.push(`slide ${index + 1}: ${rect.width}x${rect.height}`);
        for (const element of slide.querySelectorAll('[data-fit]')) {
          if (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1) issues.push(`slide ${index + 1}: overflow in ${element.textContent.trim().slice(0, 48)}`);
          const box = element.getBoundingClientRect();
          const local = { left: box.left - rect.left, right: box.right - rect.left, top: box.top - rect.top, bottom: box.bottom - rect.top };
          if (local.left < 111 || local.right > 1809 || local.top < 71 || local.bottom > 1011) issues.push(`slide ${index + 1}: unsafe text bounds ${JSON.stringify(local)}`);
          const style = getComputedStyle(element); const lineHeight = Number.parseFloat(style.lineHeight); const lines = lineHeight ? Math.ceil(element.scrollHeight / lineHeight) : 0;
          if (element.classList.contains('headline') && lines > (element.classList.contains('risk') ? 3 : 2)) issues.push(`slide ${index + 1}: headline uses ${lines} lines`);
          if (element.classList.contains('source') && lines > 2) issues.push(`slide ${index + 1}: source uses ${lines} lines`);
          if (element.classList.contains('body') && lines > 8) issues.push(`slide ${index + 1}: body uses ${lines} lines`);
        }
        const image = slide.querySelector('.deck-asset');
        if (!image || !image.complete || image.naturalWidth < 1) issues.push(`slide ${index + 1}: image unavailable`);
        else if (image.naturalWidth !== expectedAssets[index].width || image.naturalHeight !== expectedAssets[index].height) issues.push(`slide ${index + 1}: natural image dimensions changed`);
        if (image) {
          const imageRect = image.getBoundingClientRect();
          const imageZ = Number.parseInt(getComputedStyle(image).zIndex, 10) || 0;
          for (const element of slide.querySelectorAll('[data-fit]')) {
            const elementZ = Number.parseInt(getComputedStyle(element).zIndex, 10) || 0;
            const imagePaintsLater = elementZ < imageZ || (elementZ === imageZ && Boolean(element.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING));
            if (!imagePaintsLater) continue;
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            const textRects = [];
            while (walker.nextNode()) {
              if (!walker.currentNode.textContent.trim()) continue;
              const range = document.createRange();
              range.selectNodeContents(walker.currentNode);
              textRects.push(...range.getClientRects());
            }
            for (const textRect of textRects) {
              const width = Math.max(0, Math.min(textRect.right, imageRect.right) - Math.max(textRect.left, imageRect.left));
              const height = Math.max(0, Math.min(textRect.bottom, imageRect.bottom) - Math.max(textRect.top, imageRect.top));
              if (width <= 1 || height <= 1) continue;
              issues.push(`slide ${index + 1}: ${element.tagName.toLowerCase()}[data-fit] glyphs are covered by deck asset by ${Math.round(width)}x${Math.round(height)}`);
              break;
            }
          }
        }
      }
      return issues;
    }, lock.assets);
    if (geometry.length) geometry.forEach(fail); else pass('1920×1080 geometry, safe-area, line-count, overflow, and text/asset overlap gates pass');

    await page.emulateMedia({ media: 'screen' });
    for (const viewport of [{ width: 1280, height: 800 }, { width: 1280, height: 577 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const responsive = await page.evaluate(() => {
        const stage = document.querySelector('.deck-stage').getBoundingClientRect();
        const controls = document.querySelector('.controls').getBoundingClientRect();
        const slide = document.querySelector('.slide.is-active');
        const issues = [];
        const tolerance = 0.5;
        if (stage.left < -tolerance || stage.top < -tolerance || stage.right > innerWidth + tolerance || stage.bottom > innerHeight + tolerance) {
          issues.push(`stage clips viewport: ${JSON.stringify({ left: stage.left, top: stage.top, right: stage.right, bottom: stage.bottom, innerWidth, innerHeight })}`);
        }
        if (controls.left < stage.left - tolerance || controls.top < stage.top - tolerance || controls.right > stage.right + tolerance || controls.bottom > stage.bottom + tolerance) {
          issues.push('controls escape the scaled stage');
        }
        for (const element of slide.querySelectorAll('[data-fit], .eyebrow, .slide-no')) {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(walker.currentNode);
            for (const rect of range.getClientRects()) {
              const width = Math.max(0, Math.min(rect.right, controls.right) - Math.max(rect.left, controls.left));
              const height = Math.max(0, Math.min(rect.bottom, controls.bottom) - Math.max(rect.top, controls.top));
              if (width > 1 && height > 1) issues.push(`controls overlap ${element.className || element.tagName.toLowerCase()} glyphs by ${Math.round(width)}x${Math.round(height)}`);
            }
          }
        }
        return issues;
      });
      if (responsive.length) responsive.forEach((issue) => fail(`${viewport.width}×${viewport.height}: ${issue}`));
      else pass(`${viewport.width}×${viewport.height} stage fit and control/text separation gates pass`);
    }

    fs.mkdirSync(QA, { recursive: true });
    removeGeneratedQaImages(QA);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.addStyleTag({ content: '.controls{display:none!important}' });
    for (let index = 0; index < 13; index++) {
      await page.evaluate((target) => {
        const slides = [...document.querySelectorAll('.slide')];
        slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === target));
      }, index);
      await page.screenshot({ path: path.join(QA, `slide-${String(index + 1).padStart(2, '0')}.png`), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    }
    const thumbWidth = 480, thumbHeight = 270, columns = 4, rows = 4;
    const composites = [];
    for (let index = 0; index < 13; index++) {
      const input = path.join(QA, `slide-${String(index + 1).padStart(2, '0')}.png`);
      composites.push({ input: await sharp(input).resize(thumbWidth, thumbHeight).png().toBuffer(), left: (index % columns) * thumbWidth, top: Math.floor(index / columns) * thumbHeight });
    }
    await sharp({ create: { width: columns * thumbWidth, height: rows * thumbHeight, channels: 3, background: '#faf9f6' } }).composite(composites).png().toFile(path.join(QA, 'contact-sheet.png'));
    pass('13 QA screenshots and contact sheet rendered');
    await page.close();
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

await staticChecks();
await browserChecks();
if (failures.length) {
  for (const message of failures) console.error(`[fail] ${message}`);
  process.exit(1);
}
console.log('venture deck validation passed.');
