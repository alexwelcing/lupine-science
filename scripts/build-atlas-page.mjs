#!/usr/bin/env node
// Builds public/atlas/index.html from public/data/atlas_nodes.json.
//
// The page is a thin, deterministic shell over the committed JSON. No
// inline scripts (CSP-friendlier than the article builder, which keeps
// small JSON-LD blocks); no client-side rendering; every node ID is
// rendered as plain text in its canonical lupine-research:// form so
// it is copy-pasteable and grep-able.
//
// Run after scripts/build-atlas-nodes.mjs and before scripts/build-sitemap.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = path.join(ROOT, 'public', 'data', 'atlas_nodes.json');
const OUT_DIR = path.join(ROOT, 'public', 'atlas');
const OUT = path.join(OUT_DIR, 'index.html');
const SITE = 'https://lupine.science';

if (!fs.existsSync(JSON_PATH)) {
  console.error('build-atlas-page: missing public/data/atlas_nodes.json — run scripts/build-atlas-nodes.mjs first');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SECTIONS = [
  { kind: 'error_type', title: 'Error types', kicker: 'T1–T7' },
  { kind: 'emblem', title: 'Emblems', kicker: 'E1–E9' },
  { kind: 'material_class', title: 'Material classes', kicker: 'MC1–MC9' },
];

const sectionHtml = SECTIONS.map(({ kind, title, kicker }) => {
  const nodes = data.kinds[kind] || [];
  const items = nodes.map((n) => `      <li id="${escapeHtml(n.uri)}">
        <a class="atlas-card" href="/atlas/${escapeHtml(n.uri)}/">
          <span class="atlas-id">${escapeHtml(n.uri)}</span>
          <span class="atlas-name">${escapeHtml(n.name)}</span>
          <span class="atlas-uri">${escapeHtml(n.id)}</span>
        </a>
      </li>`).join('\n');
  return `    <section class="atlas-section" id="${escapeHtml(kind)}">
      <p class="atlas-kicker">${escapeHtml(kicker)}</p>
      <h2>${escapeHtml(title)}</h2>
      <ul class="atlas-list">
${items}
      </ul>
    </section>`;
}).join('\n');

const totalCount = Object.values(data.kinds).reduce((acc, list) => acc + list.length, 0);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ontology atlas — Lupine Science</title>
  <meta name="description" content="The Lupine research ontology: error types, emblems, and material classes — pulled from the project's knowledge wiki at build time.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${SITE}/atlas/">
  <meta property="og:title" content="Ontology atlas — Lupine Science">
  <meta property="og:description" content="The Lupine research ontology: error types, emblems, and material classes.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/atlas/">
  <meta property="og:image" content="${SITE}/og-lupine-science.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Ontology atlas — Lupine Science">
  <meta name="twitter:description" content="The Lupine research ontology: error types, emblems, and material classes.">
  <meta name="twitter:image" content="${SITE}/og-lupine-science.jpg">
  <meta name="theme-color" content="#faf9f6">
  <link rel="icon" type="image/svg+xml" href="/lupine-science-mark.svg">
  <link rel="icon" type="image/png" href="/lupine-science-icon.png">
  <link rel="apple-touch-icon" href="/lupine-science-icon.png">
  <link rel="preload" href="/fonts/newsreader-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/newsreader-italic-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/articles/styles.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"Ontology atlas — Lupine Science","url":"${SITE}/atlas/","isPartOf":{"@type":"WebSite","name":"Lupine Science","url":"${SITE}"}}</script>
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header class="site-header">
    <a class="mark" href="/" aria-label="Lupine Science">
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
      <span><b>Lupine Science</b> <span class="tld">accelerating materials discovery</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="/videos/">Videos</a>
      <a href="/atlas/" aria-current="page">Atlas</a>
      <a href="https://library.lupine.science">Library</a>
      <a href="https://lupi.live">LUPI</a>
    </nav>
  </header>
  <main id="content" class="atlas-index">
    <p class="b-label">Ontology atlas</p>
    <h1>Error types, emblems, and material classes that anchor the Lupine research frame.</h1>
    <p class="atlas-lede">${totalCount} nodes, pulled from the project's knowledge wiki at build time. Each card carries the canonical <code>lupine-research://</code> URI — copy it, search for it, cite it. Source: <a href="/data/atlas_nodes.json"><code>/data/atlas_nodes.json</code></a>. For the curated claim inventory (the 146 claim/S* nodes, organized into 8 narrative facets), see <a href="/atlas/claims/">/atlas/claims/</a>.</p>
${sectionHtml}
    <p class="atlas-asof">Generated from <code>${escapeHtml(data.source)}</code>; counts: error_type=${data.counts.error_type}, emblem=${data.counts.emblem}, material_class=${data.counts.material_class}.</p>
  </main>
  <footer class="foot">
    <span class="creed">Evidence before claim.</span>
    <span><a href="/articles/">Articles</a> · <a href="https://lupi.live">LUPI</a> · <a href="https://library.lupine.science">Library</a> · <a href="https://github.com/alexwelcing/lupine">Repository</a></span>
  </footer>
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`built /atlas/ (${totalCount} nodes)`);
