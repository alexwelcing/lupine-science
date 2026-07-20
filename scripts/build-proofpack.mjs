#!/usr/bin/env node
// Generalized proof-pack builder.
//
// Modes:
//   --consolidated          Build the legacy climate-series combined PDF.
//   --all                   Build one PDF + JSON manifest per eligible article.
//   --slug <slug>           Build one article only.
//   --out-dir <dir>         Output directory for per-article packs (default: public/proof-packs/).
//
// An article is eligible when public/articles/<slug>/<slug>.proofpack.json exists.
// The per-article PDF uses public/proof-pack-template/index.html populated from the
// manifest and the article's existing figures in public/articles/<slug>/images/.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { PDFDocument, PDFName } from 'pdf-lib';
import { validateProofPack, formatIssues } from './validate-proofpack.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const DEFAULT_OUT_DIR = path.join(PUBLIC, 'proof-packs');
const CONSOLIDATED_OUT = path.join(PUBLIC, 'proof-pack-climate-series.pdf');
const TEMPLATE_PATH = path.join(PUBLIC, 'proof-pack-template', 'index.html');
const TMP = path.join(ROOT, '.proofpack');

const CLIMATE_SLUGS = [
  'the-02-percent-synthesis-problem',
  'a-field-not-a-neural-net',
  'five-materials-for-5-to-12-gtco2-year',
  'from-predicted-crystal-to-commercial-cell',
  'investing-in-the-trust-layer',
];

const UNICODE_COVERAGE_STRING =
  'CO₂ · CH₄ · GtCO₂/year · en dash – · em dash — · “curly quotes” · α β γ Δ μ σ ∑ ∂ ≈ ≤ ≥ ± × · José García · Zoë Šimůnková · François L’Écuyer';

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
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function sha256String(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

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

function extractArticleMeta(html, slug) {
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
      if (Array.isArray(data['@graph'])) {
        for (const item of data['@graph']) {
          if (item.datePublished && !date) date = item.datePublished;
          if (item.url && !url) url = item.url;
        }
      }
    } catch {}
  }
  if (!date) {
    const dateMatch = html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})"/);
    if (dateMatch) date = dateMatch[1];
  }
  return { title, date, url };
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[m - 1]} ${d}, ${y}`;
}

function shortTitleFrom(title, max = 28) {
  if (title.length <= max) return title;
  const truncated = title.slice(0, max);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 10 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

function domainFrom(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCitation(source) {
  const parts = [];
  if (source.publisher && source.year) {
    parts.push(`${source.publisher}, ${source.year}.`);
  } else if (source.publisher) {
    parts.push(`${source.publisher}.`);
  } else if (source.year) {
    parts.push(`${source.year}.`);
  }
  let citation = `<em>${escapeHtml(source.title)}</em>`;
  if (parts.length) citation += ` ${escapeHtml(parts.join(' '))}`;
  if (source.url) {
    citation += ` <a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a>`;
  }
  return citation;
}

function getValue(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    if (part === 'this') {
      // 'this' refers to the current context; keep current as-is.
      continue;
    }
    current = current[part];
  }
  return current;
}

function renderTemplate(template, data) {
  // Minimal template engine supporting:
  //   {{path.to.value}}         escaped substitution
  //   {{{path.to.value}}}       raw HTML substitution
  //   {{#each path.to.array}} ... {{this.field}} ... {{/each}}
  //   {{#if path.to.value}} ... {{/if}}
  // Handles nested blocks by parsing token positions rather than regex recursion.
  const TAG_RE = /{{{([\w.]+)}}}|{{([{#/])([\w.]+)(?:\s+([\w.]+))?}}/g;

  function replaceVars(chunk, ctx) {
    return chunk
      .replace(/{{{([\w.]+)}}}/g, (_, key) => getValue(ctx, key) ?? '')
      .replace(/{{([\w.]+)}}/g, (_, key) => escapeHtml(getValue(ctx, key) ?? ''));
  }

  function parseTags(templateStr) {
    const tags = [];
    let match;
    while ((match = TAG_RE.exec(templateStr)) !== null) {
      if (match[1]) {
        tags.push({
          type: 'raw',
          raw: match[0],
          key: match[1],
          index: match.index,
          end: match.index + match[0].length,
        });
      } else {
        tags.push({
          type: match[2] === '#' ? 'block' : match[2] === '/' ? 'close' : 'var',
          raw: match[0],
          kind: match[3],
          path: match[4],
          index: match.index,
          end: match.index + match[0].length,
        });
      }
    }
    return tags;
  }

  function findMatchingClose(tags, openIndex) {
    const openTag = tags[openIndex];
    let depth = 1;
    for (let i = openIndex + 1; i < tags.length; i++) {
      const tag = tags[i];
      if (tag.type === 'block' && tag.kind === openTag.kind) {
        depth++;
      } else if (tag.type === 'close' && tag.kind === openTag.kind) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function renderChunk(templateStr, ctx = data) {
    const tags = parseTags(templateStr);
    if (tags.length === 0) return replaceVars(templateStr, ctx);

    let result = '';
    let lastIndex = 0;
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      if (tag.index < lastIndex) continue;
      result += replaceVars(templateStr.slice(lastIndex, tag.index), ctx);

      if (tag.type === 'var' || tag.type === 'raw') {
        result += replaceVars(tag.raw, ctx);
        lastIndex = tag.end;
      } else if (tag.type === 'block') {
        const closeIndex = findMatchingClose(tags, i);
        if (closeIndex === -1) {
          throw new Error(`unclosed block: ${tag.raw}`);
        }
        const body = templateStr.slice(tag.end, tags[closeIndex].index);
        if (tag.kind === 'each') {
          const arr = getValue(ctx, tag.path);
          if (Array.isArray(arr) && arr.length > 0) {
            result += arr.map((item) => renderChunk(body, item)).join('');
          }
        } else if (tag.kind === 'if') {
          const value = getValue(ctx, tag.path);
          if (value) result += renderChunk(body, ctx);
        }
        lastIndex = tags[closeIndex].end;
        i = closeIndex;
      } else {
        // Close tag should only be reached through block handling.
        lastIndex = tag.end;
      }
    }
    result += replaceVars(templateStr.slice(lastIndex), ctx);
    return result;
  }

  return renderChunk(template, data);
}

function findEligibleSlugs() {
  const slugs = [];
  const articlesDir = path.join(PUBLIC, 'articles');
  if (!fs.existsSync(articlesDir)) return slugs;
  for (const entry of fs.readdirSync(articlesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const manifestPath = path.join(articlesDir, slug, `${slug}.proofpack.json`);
    if (fs.existsSync(manifestPath)) slugs.push(slug);
  }
  return slugs.sort();
}

function loadManifest(slug) {
  const manifestPath = path.join(PUBLIC, 'articles', slug, `${slug}.proofpack.json`);
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  const issues = validateProofPack(manifest);
  const errors = issues.filter((issue) => issue.severity === 'error');
  if (errors.length) {
    throw new Error(`manifest validation failed for ${slug}:\n${formatIssues(errors)}`);
  }
  return { manifest, manifestPath };
}

function buildView(slug, manifest, articleMeta) {
  const articleDir = path.join(PUBLIC, 'articles', slug);
  const title = manifest.metadata.title || articleMeta.title;
  const date = manifest.metadata.date || articleMeta.date;
  const canonicalUrl = manifest.metadata.articleUrl || articleMeta.url;
  const authorName = manifest.credits.authors?.[0]?.name ?? '';
  const institutionName = manifest.credits.institutions?.[0]?.name ?? '';

  const figures = manifest.figures.map((figure) => {
    const src = figure.path.startsWith('http')
      ? figure.path
      : `/articles/${slug}/${figure.path}`;
    const sourceIds = figure.sourceIds || [];
    const sources = sourceIds.map((id) => manifest.bibliography.find((s) => s.id === id)).filter(Boolean);
    const sourceLine = sources.map((s) => s.publisher || s.title).join('; ') || 'Article source notes';
    return {
      ...figure,
      src,
      alt: figure.alt ?? figure.title,
      sourceLine,
    };
  });

  const dataTables = manifest.dataTables.map((table) => {
    const headers = table.headers || [];
    const rows = (table.rows || []).map((row) => ({
      cells: headers.map((header) => ({
        value: row[header.key] ?? '',
        numeric: !!header.numeric,
      })),
    }));
    return { ...table, headers, rows };
  });

  const bibliography = manifest.bibliography.map((source) => ({
    ...source,
    citation: renderCitation(source),
  }));

  return {
    metadata: {
      ...manifest.metadata,
      title,
      date,
      articleUrl: canonicalUrl,
    },
    summary: manifest.summary,
    figures,
    dataTables,
    methodology: manifest.methodology,
    credits: {
      ...manifest.credits,
      authorName,
      institutionName,
    },
    bibliography,
    auditLinks: manifest.auditLinks || [],
    formattedDate: formatDate(date),
    authorLine: `${authorName} · ${institutionName}`,
    canonicalDomain: domainFrom(canonicalUrl),
    shortTitle: shortTitleFrom(title),
    figureCount: figures.length,
    referenceCount: bibliography.length,
    unicodeCoverageString: UNICODE_COVERAGE_STRING,
  };
}

function renderPackHtml(slug, manifest, articleMeta) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const view = buildView(slug, manifest, articleMeta);
  return renderTemplate(template, view);
}

async function renderPdf(browser, { url, output, title, deterministicDate }) {
  const page = await browser.newPage();
  try {
    await page.route('**/*', (route) => {
      const requestUrl = route.request().url();
      if (/^(?:https?:\/\/)?(?:127\.0\.0\.1|localhost)(?::|\/|$)/i.test(requestUrl)) {
        route.continue();
      } else {
        route.abort('internetdisconnected');
      }
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    // Wait for images to decode.
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((resolve) => { img.onload = img.onerror = resolve; }))
      )
    ).catch(() => {});
    await page.waitForTimeout(200);
    await page.pdf({
      path: output,
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: false,
    });
  } finally {
    await page.close();
  }

  await normalizePdf(output, { title, deterministicDate });
}

async function normalizePdf(output, { title, deterministicDate }) {
  const bytes = fs.readFileSync(output);
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  doc.setTitle(title);
  doc.setAuthor('Lupine Science');
  doc.setSubject('Evidence proof pack');
  doc.setCreator('lupine-science/scripts/build-proofpack.mjs');
  doc.setProducer('lupine-science/scripts/build-proofpack.mjs');
  doc.setCreationDate(deterministicDate);
  doc.setModificationDate(deterministicDate);
  // Remove any existing ID to reduce cross-run variance.
  try {
    const trailer = doc.context.trailer;
    if (trailer && trailer.get) {
      const idArray = trailer.get(PDFName.of('ID'));
      if (idArray) trailer.set(PDFName.of('ID'), doc.context.obj([]));
    }
  } catch {
    // Best-effort: some pdf-lib versions do not expose trailer directly.
  }
  fs.writeFileSync(output, await doc.save({ useObjectStreams: false, updateMetadata: false }));
}

async function buildPerArticle(browser, slug, outDir, baseUrl) {
  const articlePath = path.join(PUBLIC, 'articles', slug, 'index.html');
  if (!fs.existsSync(articlePath)) throw new Error(`missing article HTML: ${articlePath}`);
  const { manifest, manifestPath } = loadManifest(slug);
  const articleMeta = extractArticleMeta(fs.readFileSync(articlePath, 'utf8'), slug);

  const html = renderPackHtml(slug, manifest, articleMeta);
  const htmlPath = path.join(PUBLIC, '.proofpack-render', `${slug}.html`);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html);

  const pdfName = `${slug}.proofpack.pdf`;
  const manifestName = `${slug}.proofpack.json`;
  const pdfPath = path.join(outDir, pdfName);
  const outputManifestPath = path.join(outDir, manifestName);

  await renderPdf(browser, {
    url: `${baseUrl}/.proofpack-render/${slug}.html`,
    output: pdfPath,
    title: manifest.metadata.title,
    deterministicDate: new Date(`${manifest.metadata.date}T00:00:00Z`),
  });

  const articleDir = path.join(PUBLIC, 'articles', slug);
  const figureChecksums = {};
  for (const figure of manifest.figures) {
    const figurePath = path.join(articleDir, figure.path);
    if (fs.existsSync(figurePath)) {
      figureChecksums[figure.path] = sha256(figurePath);
    }
  }

  const outputManifest = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    build: {
      script: 'scripts/build-proofpack.mjs',
      mode: 'per-article',
      slug,
    },
    inputs: {
      manifest: {
        path: path.relative(ROOT, manifestPath),
        sha256: sha256(manifestPath),
      },
      articleHtml: {
        path: path.relative(ROOT, articlePath),
        sha256: sha256(articlePath),
      },
      figures: figureChecksums,
      renderedHtml: {
        path: path.relative(ROOT, htmlPath),
        sha256: sha256String(html),
      },
    },
    output: {
      pdf: {
        path: path.relative(ROOT, pdfPath),
        sha256: sha256(pdfPath),
        bytes: fs.statSync(pdfPath).size,
      },
    },
  };
  fs.writeFileSync(outputManifestPath, `${JSON.stringify(outputManifest, null, 2)}\n`);
  return { slug, pdfPath, manifestPath: outputManifestPath };
}

function cleanStaleOutputs(outDir, eligibleSlugs) {
  if (!fs.existsSync(outDir)) return;
  const expected = new Set(
    eligibleSlugs.flatMap((slug) => [`${slug}.proofpack.pdf`, `${slug}.proofpack.json`])
  );
  for (const entry of fs.readdirSync(outDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (entry.name.endsWith('.proofpack.pdf') || entry.name.endsWith('.proofpack.json')) {
      if (!expected.has(entry.name)) {
        fs.rmSync(path.join(outDir, entry.name));
        console.log(`cleaned stale output: ${entry.name}`);
      }
    }
  }
}

// --------------------------------------------------------------------------
// Consolidated (legacy climate-series) mode
// --------------------------------------------------------------------------

function legacyCoverHtml({ title, date, url, baseUrl }) {
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

async function legacyRenderPdf(browser, { url, html, output }) {
  const page = await browser.newPage();
  try {
    if (html) {
      await page.setContent(html, { waitUntil: 'networkidle', baseURL: url });
    } else {
      await page.goto(url, { waitUntil: 'networkidle' });
    }
    await page.addStyleTag({ content: `
      @font-face {
        font-family: "Proof Unicode";
        src: url("${new URL('/fonts/proof-unicode.ttf', url)}") format("truetype");
        font-style: normal;
        font-weight: 100 900;
        font-display: block;
      }
      :root { --serif: "Proof Unicode", serif; }

      /* Print/PDF: video players carry no value on paper. Remove the player
         and its meta chrome entirely (owner decision 2026-07-20); hero
         figures that are video-only collapse too. */
      video, .video-player, .video-player-meta, .article-hero:has(video),
      .article-video-player, .video-player-label, .video-player-frame {
        display: none !important;
      }
    ` });
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForSelector('.katex', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(300);
    await page.pdf({
      path: output,
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
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

async function buildConsolidated(browser, baseUrl) {
  const perArticlePaths = [];
  for (const slug of CLIMATE_SLUGS) {
    const articlePath = path.join(PUBLIC, 'articles', slug, 'index.html');
    if (!fs.existsSync(articlePath)) throw new Error(`missing ${articlePath}`);
    const html = fs.readFileSync(articlePath, 'utf8');
    const meta = extractArticleMeta(html, slug);
    console.log(`rendering: ${meta.title}`);

    const coverFile = path.join(TMP, `${slug}-cover.pdf`);
    const articleFile = path.join(TMP, `${slug}.pdf`);
    await legacyRenderPdf(browser, {
      url: baseUrl,
      html: legacyCoverHtml({ ...meta, baseUrl }),
      output: coverFile,
    });
    await legacyRenderPdf(browser, {
      url: `${baseUrl}/articles/${slug}/`,
      output: articleFile,
    });
    perArticlePaths.push(coverFile, articleFile);
  }

  await mergePdfs(perArticlePaths, CONSOLIDATED_OUT);
  const sizeMB = fs.statSync(CONSOLIDATED_OUT).size / (1024 * 1024);
  console.log(`consolidated proof pack written: ${CONSOLIDATED_OUT} (${sizeMB.toFixed(2)} MB)`);
  if (sizeMB >= 20) {
    throw new Error(`PDF is ${sizeMB.toFixed(2)} MB, above the 20 MB budget`);
  }
}

// --------------------------------------------------------------------------
// CLI
// --------------------------------------------------------------------------

function parseArgs(argv) {
  const options = {
    mode: null,
    slug: '',
    outDir: DEFAULT_OUT_DIR,
  };
  const args = [...argv];
  while (args.length) {
    const arg = args.shift();
    if (arg === '--consolidated') options.mode = 'consolidated';
    else if (arg === '--all') options.mode = 'all';
    else if (arg === '--slug') {
      options.mode = 'slug';
      options.slug = args.shift();
    } else if (arg === '--out-dir') {
      options.outDir = path.resolve(ROOT, args.shift());
    } else if (arg === '--help' || arg === '-h') {
      console.log(`usage: node scripts/build-proofpack.mjs [options]

options:
  --consolidated          Build public/proof-pack-climate-series.pdf (legacy mode).
  --all                   Build one PDF + JSON manifest for every eligible article.
  --slug <slug>           Build one article only.
  --out-dir <dir>         Output directory for per-article packs (default: public/proof-packs/).
  --help                  Show this message.`);
      process.exit(0);
    } else {
      throw new Error(`unknown option: ${arg}`);
    }
  }
  if (!options.mode) {
    throw new Error('no mode selected; use --consolidated, --all, or --slug <slug> (see --help)');
  }
  if (options.mode === 'slug' && !options.slug) {
    throw new Error('--slug requires a value');
  }
  return options;
}

async function main() {
  const startedAt = Date.now();
  const options = parseArgs(process.argv.slice(2));

  if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const { server, baseUrl } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    if (options.mode === 'consolidated') {
      await buildConsolidated(browser, baseUrl);
    } else {
      fs.mkdirSync(options.outDir, { recursive: true });
      const eligible = options.mode === 'all' ? findEligibleSlugs() : [options.slug];
      if (options.mode === 'all') cleanStaleOutputs(options.outDir, eligible);

      for (const slug of eligible) {
        console.log(`building proof pack: ${slug}`);
        const result = await buildPerArticle(browser, slug, options.outDir, baseUrl);
        console.log(`  PDF: ${result.pdfPath}`);
        console.log(`  manifest: ${result.manifestPath}`);
      }
    }

    console.log(`finished in ${Date.now() - startedAt} ms`);
  } finally {
    if (browser) await browser.close();
    server.close();
    fs.rmSync(TMP, { recursive: true, force: true });
    const renderDir = path.join(PUBLIC, '.proofpack-render');
    if (fs.existsSync(renderDir)) fs.rmSync(renderDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
