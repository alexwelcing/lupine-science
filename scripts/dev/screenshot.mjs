#!/usr/bin/env node
// Screenshot matrix for design iteration. Captures every page in several
// viewports and every homepage focus state, and records console errors,
// page errors, and failed requests (catches CSP violations locally).
//
// Usage: node scripts/dev/screenshot.mjs [outDir] [--only name-prefix]
//
// WEBGPU=1 additionally launches with SwiftShader WebGPU flags and waits for
// the GPU ribbon tier to go live on the homepage. Best-effort evidence only:
// sandboxed SwiftShader crashes on canvas present, so "tier fell back" is an
// expected note here, not a failure — the fallback chain is the tested path
// (tests/hero-fallback-chain.test.mjs). On real GPUs it verifies activation.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const OUT = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2]
  : path.join(process.env.SCRATCH || '/tmp', 'lupine-shots');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const EXECUTABLE = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 2 },
  { name: 'laptop', width: 1280, height: 800, deviceScaleFactor: 1 },
  { name: 'tablet', width: 834, height: 1194, deviceScaleFactor: 2, hasTouch: true },
  { name: 'narrow', width: 1000, height: 900, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
];

const FOCUS_STATES = ['objective', 'manifold', 'errorvectors', 'ledger'];

const log = [];
function note(kind, page, msg) {
  const line = `[${kind}] ${page}: ${msg}`;
  log.push(line);
  console.error(line);
}

async function capture(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile || false,
    hasTouch: vp.hasTouch || false,
  });
  const page = await context.newPage();
  const label = (n) => `${vp.name}--${n}`;
  page.on('console', (m) => { if (m.type() === 'error') note('console', page.url(), m.text()); });
  page.on('pageerror', (e) => note('pageerror', page.url(), e.message));
  page.on('requestfailed', (r) => {
    if (!r.url().includes('api.github.com')) note('requestfailed', page.url(), `${r.url()} ${r.failure()?.errorText}`);
  });

  async function shot(name, fullPage = false) {
    if (ONLY && !label(name).startsWith(ONLY)) return;
    await page.screenshot({ path: path.join(OUT, `${label(name)}.png`), fullPage });
    console.log(`  ✓ ${label(name)}`);
  }

  // Homepage: settle the canvas, then each focus state.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  if (process.env.WEBGPU && vp.name === 'desktop') {
    const live = await page.waitForSelector('#ribbon-gpu[data-live]', { timeout: 20000 })
      .then(() => true).catch(() => false);
    note(live ? 'webgpu' : 'webgpu-fallback', page.url(),
      live ? 'GPU ribbon tier went live' : 'GPU tier fell back to 2D (expected under sandboxed SwiftShader)');
    if (live) await page.waitForTimeout(1200); // let the fade-in finish
  }
  if (vp.name === 'mobile') {
    // the tier gate must never load the GPU module on mobile
    const gpuActive = await page.evaluate(() => {
      const c = document.getElementById('ribbon-gpu');
      return !!c && 'live' in c.dataset;
    });
    if (gpuActive) note('webgpu-leak', page.url(), 'GPU tier activated on mobile — gate broken');
  }
  await shot('home');
  await shot('home-full', true);
  for (const state of FOCUS_STATES) {
    const term = page.locator(`[data-focus="${state}"]`).first();
    if (await term.count()) {
      await term.click();
      await page.waitForTimeout(1300);
      await shot(`home-${state}`);
    }
  }

  // Footer close-up: detail formatting (margins, stacking, email) is
  // exactly where small-screen sloppiness hides — capture it explicitly.
  await page.evaluate(() => document.querySelector('.foot')?.scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(2200); // receipts line renders ~1.4s after load
  await shot('home-foot');

  // Articles index + each article.
  await page.goto(`${BASE}/articles/`, { waitUntil: 'networkidle' });
  await shot('articles-index', true);
  const hrefs = await page.$$eval('a[href^="/articles/"]', (as) =>
    [...new Set(as.map((a) => a.getAttribute('href')).filter((h) => h && h !== '/articles/'))]);
  for (const href of hrefs) {
    const slug = href.replace(/\/articles\/|\/$/g, '');
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await shot(`article-${slug}`);
    await shot(`article-${slug}-full`, true);
  }
  await context.close();
}

async function captureReducedMotion(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // reduced motion must keep the GPU tier off entirely — static 2D frame only
  const gpuActive = await page.evaluate(() => 'live' in document.getElementById('ribbon-gpu').dataset);
  if (gpuActive) note('webgpu-leak', page.url(), 'GPU tier activated under reduced motion — gate broken');
  await page.screenshot({ path: path.join(OUT, 'reduced-motion--home.png') });
  console.log('  ✓ reduced-motion--home');
  await context.close();
}

const launchArgs = ['--no-sandbox'];
if (process.env.WEBGPU) {
  launchArgs.push('--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan');
}
const browser = await chromium.launch({ executablePath: EXECUTABLE, args: launchArgs });
for (const vp of VIEWPORTS) {
  console.log(`\n${vp.name} (${vp.width}×${vp.height})`);
  await capture(browser, vp);
}
await captureReducedMotion(browser);
await browser.close();

fs.writeFileSync(path.join(OUT, 'console.log'), log.join('\n') + '\n');
console.log(`\nshots → ${OUT}${log.length ? `\n⚠ ${log.length} console/network issue(s) — see console.log` : '\nno console errors'}`);
