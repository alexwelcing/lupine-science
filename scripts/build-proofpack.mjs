#!/usr/bin/env node
// Builds public/proof-pack-climate-series.pdf from the five climate
// partnership articles. Each article gets a cover page (title, date, URL)
// followed by its rendered article pages.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { PDFDocument } from 'pdf-lib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(PUBLIC, 'proof-pack-climate-series.pdf');
const TMP = path.join(ROOT, '.proofpack');

const SLUGS = [
  'the-02-percent-synthesis-problem',
  'a-field-not-a-neural-net',
  'five-materials-for-5-to-12-gtco2-year',
  'from-predicted-crystal-to-commercial-cell',
  'investing-in-the-trust-layer',
];

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
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let filePath = path.normalize(path.join(PUBLIC, urlPath));
      if (!filePath.startsWith(PUBLIC)) {
        res.writeHead(403, { 'content-type': 'text/plain' }).end('forbidden');
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const body = fs.readFileSync(filePath);
      res.writeHead(200, {
        'content-type': MIME[ext] || 'application/octet-stream',
        'content-length': body.length,
      });
      res.end(body);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function extractMeta(html, slug) {
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const title = titleMatch ? titleMatch[1].replace(/\s*—\s*Lupine Science$/, '').trim() : slug;
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let date = '';
  let url = `https://lupine.science/articles/${slug}/`;
  if (ldMatch) {
    try {
      const data = JSON.parse(ldMatch[1]);
      if (data.datePublished) date = data.datePublished;
      if (data.url) url = data.url;
    } catch {}
  }
  if (!date) {
    const dateMatch = html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})"/);
    if (dateMatch) date = dateMatch[1];
  }
  return { title, date, url };
}

function coverHtml({ title, date, url, baseUrl }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="${baseUrl}/articles/styles.css">
  <style>
    @page { size: letter; margin: 0; }
    body {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #faf9f6;
      font-family: var(--serif), Georgia, serif;
    }
    .cover {
      width: 100%;
      max-width: 6.5in;
      padding: 0.75in;
      text-align: center;
    }
    .cover .mark {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 48px;
      color: var(--ink);
      text-decoration: none;
      font-family: var(--sans);
      font-size: 16px;
    }
    .cover .mark svg { width: 48px; height: auto; }
    .cover h1 {
      font-size: clamp(32px, 6vw, 52px);
      line-height: 1.15;
      margin: 0 0 24px;
      color: var(--ink);
    }
    .cover .meta {
      font-family: var(--mono);
      font-size: 13px;
      color: var(--ink-soft);
      margin: 0 0 12px;
    }
    .cover .url {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--ink-faint);
      word-break: break-all;
    }
    .cover .series {
      display: inline-block;
      margin-top: 48px;
      padding: 6px 12px;
      border: 1px solid var(--rule-strong);
      border-radius: 4px;
      font-family: var(--mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-muted);
    }
  </style>
</head>
<body>
  <div class="cover">
    <a class="mark" href="${baseUrl}/" aria-label="Lupine Science">
      <svg viewBox="100 44 312 440" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="bb" x1="190" y1="74" x2="324" y2="356" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#88a7d8"/><stop offset=".35" stop-color="#475b9c"/><stop offset=".78" stop-color="#102f47"/><stop offset="1" stop-color="#071a2a"/>
          </linearGradient>
          <linearGradient id="bl" x1="150" y1="330" x2="360" y2="470" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#7f907c"/><stop offset="1" stop-color="#4c653d"/>
          </linearGradient>
          <radialGradient id="bc" cx="48%" cy="30%" r="68%">
            <stop offset="0" stop-color="#fffdf3"/><stop offset=".7" stop-color="#f1e8c9"/><stop offset="1" stop-color="#d4c58f"/>
          </radialGradient>
        </defs>
        <g fill="none" stroke="#4c653d" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
          <path d="M256 148 C252 224 258 312 254 448"/><path d="M252 402 C222 372 178 354 124 348"/><path d="M260 402 C290 372 334 354 388 348"/>
        </g>
        <g fill="url(#bl)" opacity=".96">
          <ellipse cx="139" cy="348" rx="18" ry="62" transform="rotate(-78 139 348)"/><ellipse cx="167" cy="384" rx="18" ry="62" transform="rotate(-48 167 384)"/><ellipse cx="214" cy="410" rx="17" ry="58" transform="rotate(-20 214 410)"/><ellipse cx="373" cy="348" rx="18" ry="62" transform="rotate(78 373 348)"/><ellipse cx="345" cy="384" rx="18" ry="62" transform="rotate(48 345 384)"/><ellipse cx="298" cy="410" rx="17" ry="58" transform="rotate(20 298 410)"/>
        </g>
        <g fill="none" stroke="#fef8f5" stroke-width="5" stroke-linecap="round" opacity=".66">
          <path d="M132 348 C170 356 205 373 236 405"/><path d="M380 348 C342 356 307 373 276 405"/>
        </g>
        <g fill="url(#bb)" stroke="#fef8f5" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="256" cy="86" rx="22" ry="34"/><ellipse cx="232" cy="122" rx="23" ry="35" transform="rotate(-24 232 122)"/><ellipse cx="280" cy="122" rx="23" ry="35" transform="rotate(24 280 122)"/><ellipse cx="256" cy="150" rx="30" ry="40"/><ellipse cx="211" cy="182" rx="26" ry="38" transform="rotate(-34 211 182)"/><ellipse cx="301" cy="182" rx="26" ry="38" transform="rotate(34 301 182)"/><ellipse cx="256" cy="216" rx="37" ry="48"/><ellipse cx="204" cy="256" rx="30" ry="43" transform="rotate(-42 204 256)"/><ellipse cx="308" cy="256" rx="30" ry="43" transform="rotate(42 308 256)"/><ellipse cx="256" cy="306" rx="40" ry="52"/>
        </g>
        <g fill="url(#bc)">
          <path d="M244 142 C251 124 261 124 268 142 C262 136 250 136 244 142Z"/><path d="M244 207 C252 186 263 186 271 207 C263 199 252 199 244 207Z"/><path d="M242 296 C252 272 265 272 274 296 C264 286 252 286 242 296Z"/>
        </g>
      </svg>
      <span><b>Lupine Science</b></span>
    </a>
    <p class="meta">${date || 'Climate partnerships series'}</p>
    <h1>${title}</h1>
    <p class="url">${url}</p>
    <p class="series">Climate Partnerships Proof Pack</p>
  </div>
</body>
</html>`;
}

async function renderPdf(browser, { url, html, output }) {
  const page = await browser.newPage();
  try {
    if (html) {
      await page.setContent(html, { waitUntil: 'networkidle', baseURL: url });
    } else {
      await page.goto(url, { waitUntil: 'networkidle' });
    }
    await page.pdf({
      path: output,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.6in', bottom: '0.6in', left: '0.65in', right: '0.65in' },
      preferCSSPageSize: false,
    });
  } finally {
    await page.close();
  }
}

async function mergePdfs(paths, output) {
  const merged = await PDFDocument.create();
  for (const p of paths) {
    const src = await PDFDocument.load(fs.readFileSync(p));
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  fs.writeFileSync(output, await merged.save());
}

async function main() {
  const startedAt = Date.now();
  if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });

  const { server, baseUrl } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const perArticlePaths = [];
    for (const slug of SLUGS) {
      const articlePath = path.join(PUBLIC, 'articles', slug, 'index.html');
      if (!fs.existsSync(articlePath)) throw new Error(`missing ${articlePath}`);
      const html = fs.readFileSync(articlePath, 'utf8');
      const meta = extractMeta(html, slug);
      console.log(`rendering: ${meta.title}`);

      const coverFile = path.join(TMP, `${slug}-cover.pdf`);
      const articleFile = path.join(TMP, `${slug}.pdf`);
      await renderPdf(browser, {
        url: baseUrl,
        html: coverHtml({ ...meta, baseUrl }),
        output: coverFile,
      });
      await renderPdf(browser, {
        url: `${baseUrl}/articles/${slug}/`,
        output: articleFile,
      });
      perArticlePaths.push(coverFile, articleFile);
    }

    await mergePdfs(perArticlePaths, OUT);
    const sizeMB = fs.statSync(OUT).size / (1024 * 1024);
    console.log(`proof pack written: ${OUT} (${sizeMB.toFixed(2)} MB)`);
    if (sizeMB >= 20) {
      throw new Error(`PDF is ${sizeMB.toFixed(2)} MB, above the 20 MB budget`);
    }
    console.log(`finished in ${Date.now() - startedAt} ms`);
  } finally {
    if (browser) await browser.close();
    server.close();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
