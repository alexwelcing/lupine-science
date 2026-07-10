#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import axe from 'axe-core';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'docs/reviews/accessibility/automated-results.json'));
const chromePath = process.env.CHROME_PATH || '/usr/bin/google-chrome';

function routes() {
  const found = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') {
        const rel = path.relative(PUBLIC, full);
        found.push(rel === 'index.html' ? '/' : `/${path.dirname(rel).split(path.sep).join('/')}/`);
      }
    }
  }
  walk(PUBLIC);
  return found.sort();
}

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname); }
    catch { res.writeHead(400).end(); return; }
    let file = path.normalize(path.join(PUBLIC, pathname));
    if (!file.startsWith(PUBLIC)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
    const ext = path.extname(file);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.vtt': 'text/vtt' };
    res.setHeader('content-type', types[ext] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` })));
}

const { server, baseUrl } = await startServer();
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
const results = { generatedAt: new Date().toISOString(), standard: 'WCAG 2.1 AA', tools: { axe: axe.version, lighthouse: null, browser: 'Google Chrome (headless)' }, coverage: [], summary: {} };

try {
  for (const route of routes()) {
    process.stdout.write(`Auditing ${route}\n`);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto(baseUrl + route, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: axe.source });
    const axeResult = await page.evaluate(async () => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
    const semantics = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1: [...document.querySelectorAll('h1')].map((e) => e.textContent.trim()),
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((e) => ({ level: Number(e.tagName[1]), text: e.textContent.trim().slice(0, 100) })),
      landmarks: [...document.querySelectorAll('main,nav,header,footer,[role="main"],[role="navigation"],[role="banner"],[role="contentinfo"]')].map((e) => e.getAttribute('role') || e.tagName.toLowerCase()),
      skipLinks: [...document.querySelectorAll('a[href^="#"]')].filter((e) => /skip/i.test(e.textContent)).map((e) => ({ text: e.textContent.trim(), href: e.getAttribute('href') })),
      images: [...document.images].map((e) => ({ src: e.getAttribute('src'), alt: e.getAttribute('alt') })),
      media: [...document.querySelectorAll('video,audio')].map((e) => ({ tag: e.tagName.toLowerCase(), controls: e.controls, tracks: [...e.querySelectorAll('track')].map((t) => ({ kind: t.kind, src: t.getAttribute('src'), srclang: t.srclang })) })),
      forms: [...document.querySelectorAll('input,select,textarea')].map((e) => ({ tag: e.tagName.toLowerCase(), type: e.type, name: e.name, label: e.labels?.[0]?.textContent?.trim() || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || null })),
    }));

    const focus = [];
    await page.locator('body').press('Tab');
    for (let i = 0; i < 40; i++) {
      const item = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const s = getComputedStyle(e);
        return { tag: e.tagName.toLowerCase(), text: (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80), href: e.getAttribute('href'), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, boxShadow: s.boxShadow };
      });
      if (!item) break;
      focus.push(item);
      await page.keyboard.press('Tab');
      const repeated = focus.length > 1 && JSON.stringify(focus.at(-1)) === JSON.stringify(focus.at(-2));
      if (repeated) break;
    }

    await page.setViewportSize({ width: 320, height: 640 });
    const reflow = await page.evaluate(() => ({ viewportWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
    await context.close();

    const reduced = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(baseUrl + route, { waitUntil: 'networkidle' });
    const reducedMotion = await reducedPage.evaluate(() => ({
      prefersReduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
      activeAnimations: document.getAnimations().filter((a) => a.playState === 'running').length,
      longTransitions: [...document.querySelectorAll('*')].filter((e) => parseFloat(getComputedStyle(e).transitionDuration) > 0.1).length,
    }));
    await reduced.close();

    const lh = await lighthouse(baseUrl + route, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['accessibility'] });
    const lhr = lh.lhr;
    results.tools.lighthouse = lhr.lighthouseVersion;
    results.coverage.push({ route, axe: { violations: axeResult.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description, help: v.help, helpUrl: v.helpUrl, nodes: v.nodes.map((n) => ({ target: n.target, html: n.html, failureSummary: n.failureSummary })) })), incomplete: axeResult.incomplete.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })) }, lighthouse: { score: Math.round(lhr.categories.accessibility.score * 100), failingAudits: Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'notApplicable').map((a) => ({ id: a.id, title: a.title, score: a.score })) }, semantics, focus, reflow, reducedMotion });
  }
} finally {
  await browser.close();
  await chrome.kill();
  server.close();
}

results.summary = {
  routes: results.coverage.length,
  axeViolationRoutes: results.coverage.filter((r) => r.axe.violations.length).length,
  axeViolations: results.coverage.reduce((n, r) => n + r.axe.violations.length, 0),
  lighthouseMin: Math.min(...results.coverage.map((r) => r.lighthouse.score)),
  lighthouseMax: Math.max(...results.coverage.map((r) => r.lighthouse.score)),
  reflowFailures: results.coverage.filter((r) => r.reflow.horizontalOverflow).map((r) => r.route),
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results.summary, null, 2));
console.log(`Evidence: ${OUT}`);
