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
import { renderSiteHeader } from './lib/brand-header.mjs';
import { headMetaTitleSegments, renderHeadMetaTags } from './lib/head-meta.mjs';

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

// Article cross-links, so each card can say how many articles rest on the
// node. Built by scripts/build-ontology-crosslinks.mjs, which runs before this
// script in `npm run build`.
const CROSSLINKS_PATH = path.join(ROOT, 'public', 'data', 'article_ontology.json');
if (!fs.existsSync(CROSSLINKS_PATH)) {
  console.error(`build-atlas-page: missing ${path.relative(ROOT, CROSSLINKS_PATH)} - run scripts/build-ontology-crosslinks.mjs first`);
  process.exit(1);
}
const crosslinks = JSON.parse(fs.readFileSync(CROSSLINKS_PATH, 'utf8'));
if (!crosslinks?.by_node || typeof crosslinks.by_node !== 'object') {
  console.error('build-atlas-page: article_ontology.json has no .by_node object');
  process.exit(1);
}
const refCount = (id) => (Array.isArray(crosslinks.by_node[id]) ? crosslinks.by_node[id].length : 0);
const refLabel = (n) => (n === 0 ? '' : `<span class="atlas-refs">${n} article${n === 1 ? '' : 's'}</span>`);

const SECTIONS = [
  { kind: 'error_type', title: 'Error types', kicker: 'T1–T7' },
  { kind: 'emblem', title: 'Emblems', kicker: 'E1–E9' },
  { kind: 'material_class', title: 'Material classes', kicker: 'MC1–MC9' },
];

const sectionHtml = SECTIONS.map(({ kind, title, kicker }) => {
  const nodes = data.kinds[kind] || [];
  const items = nodes.map((n) => `      <li id="${escapeHtml(n.uri)}">
        <a class="atlas-card" href="/atlas/${escapeHtml(n.uri)}/">
          <span class="atlas-id">${escapeHtml(n.uri)}${refLabel(refCount(n.id))}</span>
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
${renderHeadMetaTags(headMetaTitleSegments({ primary: 'Ontology atlas', suffix: 'Lupine Science' }))}
  <meta name="description" content="The Lupine research ontology: error types, emblems, and material classes — pulled from the project's knowledge wiki at build time.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${SITE}/atlas/">
  <meta property="og:description" content="The Lupine research ontology: error types, emblems, and material classes.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/atlas/">
  <meta property="og:image" content="${SITE}/og-lupine-science.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
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
  ${renderSiteHeader({ ariaCurrentPath: "/atlas/" })}
  <main id="content" class="atlas-index">
    <p class="b-label">Ontology atlas</p>
    <h1>Error types, emblems, and material classes that anchor the Lupine research frame.</h1>
    <p class="atlas-lede">${totalCount} nodes, pulled from the project's knowledge wiki at build time. Each card carries the canonical <code>lupine-research://</code> URI — copy it, search for it, cite it. Source: <a href="/data/atlas_nodes.json"><code>/data/atlas_nodes.json</code></a>. For the curated claim inventory (the 146 claim/S* nodes, organized into 8 narrative facets), see <a href="/atlas/claims/">/atlas/claims/</a>.</p>
${sectionHtml}
    <p class="atlas-asof">Generated at build time from the lupine-research sphere of the project's knowledge wiki: ${data.counts.error_type} error types, ${data.counts.emblem} emblems, ${data.counts.material_class} material classes, and ${crosslinks.total_links} article cross-links.</p>
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
