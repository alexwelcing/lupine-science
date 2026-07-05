#!/usr/bin/env node
// Measures what a visitor's browser actually experiences: per-class transfer
// bytes, paint timings, LCP, CLS, and canvas frame cost. These are the same
// numbers the homepage receipts line shows, so this doubles as its honesty check.
//
// Usage: node scripts/dev/perf-report.mjs [url ...]
import { chromium } from 'playwright-core';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const URLS = process.argv.length > 2 ? process.argv.slice(2) : [`${BASE}/`, `${BASE}/articles/`];
const EXECUTABLE = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const CLASSES = [
  ['html', /\/$|\.html$/],
  ['font', /\.woff2?$/],
  ['image', /\.(png|jpe?g|webp|avif|svg|ico)$/],
  ['video', /\.(mp4|webm)$/],
  ['data', /\.(json)$/],
  ['css', /\.css$/],
  ['js', /\.m?js$/],
];

function classify(url) {
  const p = new URL(url).pathname;
  for (const [name, re] of CLASSES) if (re.test(p)) return name;
  return 'other';
}

const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ['--no-sandbox'] });

for (const url of URLS) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const transfers = new Map();
  page.on('response', async (res) => {
    try {
      const sizes = await res.request().sizes();
      transfers.set(res.url(), { bytes: sizes.responseBodySize + sizes.responseHeadersSize, cls: classify(res.url()) });
    } catch { /* request may be gone */ }
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(async () => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paints = Object.fromEntries(performance.getEntriesByType('paint').map((p) => [p.name, p.startTime]));
    const lcp = await new Promise((resolve) => {
      let last = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) last = e.startTime; })
        .observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => resolve(last), 300);
    });
    const cls = await new Promise((resolve) => {
      let total = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) total += e.value; })
        .observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => resolve(total), 300);
    });
    // canvas frame cost: sample 120 frames if the ribbon is animating
    let frameMs = null;
    if (document.getElementById('ribbon') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frameMs = await new Promise((resolve) => {
        const times = [];
        let prev = performance.now();
        function tick(now) {
          times.push(now - prev); prev = now;
          if (times.length < 120) requestAnimationFrame(tick);
          else { times.sort((a, b) => a - b); resolve(times[Math.floor(times.length / 2)]); }
        }
        requestAnimationFrame(tick);
      });
    }
    return {
      ttfb: nav ? nav.responseStart - nav.startTime : null,
      fcp: paints['first-contentful-paint'] ?? null,
      lcp, cls, frameMs,
      domInteractive: nav?.domInteractive ?? null,
    };
  });

  const byClass = {};
  let total = 0;
  for (const { bytes, cls } of transfers.values()) {
    byClass[cls] = (byClass[cls] || 0) + bytes;
    total += bytes;
  }

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`\n━━ ${url}`);
  console.log(`  transfer total   ${kb(total)}  (${transfers.size} requests)`);
  for (const [cls, bytes] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cls.padEnd(8)} ${kb(bytes)}`);
  }
  console.log(`  TTFB ${metrics.ttfb?.toFixed(0)}ms · FCP ${metrics.fcp?.toFixed(0)}ms · LCP ${metrics.lcp?.toFixed(0)}ms · CLS ${metrics.cls?.toFixed(4)}${metrics.frameMs != null ? ` · median frame ${metrics.frameMs.toFixed(1)}ms` : ''}`);

  const heavy = [...transfers.entries()].sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 6);
  console.log('  heaviest:');
  for (const [u, { bytes }] of heavy) console.log(`    ${kb(bytes).padStart(10)}  ${new URL(u).pathname}`);
  await context.close();
}

await browser.close();
