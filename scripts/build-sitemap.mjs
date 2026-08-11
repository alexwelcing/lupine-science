#!/usr/bin/env node
// Regenerates public/sitemap.xml from what actually ships: every
// public/**/index.html plus the root.
//
// lastmod must be DETERMINISTIC: CI rebuilds the sitemap and fails if it
// differs from the committed one, so dates cannot come from git commit
// times (the commit containing the sitemap changes them — chicken and
// egg). Articles therefore use their own declared "> **Date:**" metadata;
// pages with no intrinsic date omit lastmod, which the sitemap spec allows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://lupine.science';

function articleDate(slug) {
  const md = path.join(ROOT, 'articles', `${slug}.md`);
  if (!fs.existsSync(md)) return null;
  const m = fs.readFileSync(md, 'utf8').match(/^> \*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/m);
  return m ? m[1] : null;
}

const urls = [
  { loc: `${SITE}/`, lastmod: null },
  { loc: `${SITE}/articles/`, lastmod: null },
  { loc: `${SITE}/videos/`, lastmod: null },
  // /atlas/ is the wiki-driven ontology page (see scripts/build-atlas-nodes.mjs).
  // No intrinsic date — the page is generated from the wiki DB at build time.
  { loc: `${SITE}/atlas/`, lastmod: null },
];
for (const entry of fs.readdirSync(path.join(PUBLIC, 'articles'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  if (!fs.existsSync(path.join(PUBLIC, 'articles', slug, 'index.html'))) continue;
  urls.push({ loc: `${SITE}/articles/${slug}/`, lastmod: articleDate(slug) });
}

for (const entry of fs.readdirSync(path.join(PUBLIC, 'videos'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (!fs.existsSync(path.join(PUBLIC, 'videos', entry.name, 'index.html'))) continue;
  urls.push({ loc: `${SITE}/videos/${entry.name}/`, lastmod: articleDate(entry.name) });
}
// Presentations (standalone HTML decks).
const presentationsDir = path.join(PUBLIC, 'presentations');
if (fs.existsSync(presentationsDir)) {
  for (const entry of fs.readdirSync(presentationsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!fs.existsSync(path.join(presentationsDir, entry.name, 'index.html'))) continue;
    urls.push({ loc: `${SITE}/presentations/${entry.name}/`, lastmod: null });
  }
}

// Per-node detail pages under /atlas/<id>/. The id matches one of T*, E*,
// MC* (built by scripts/build-atlas-detail-pages.mjs). Anything else under
// /atlas/ (e.g. claims/ or gallery/) is left for a future sitemap pass with
// its own intrinsic date source.
const atlasDir = path.join(PUBLIC, 'atlas');
if (fs.existsSync(atlasDir)) {
  for (const entry of fs.readdirSync(atlasDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!/^(T\d+|E\d+|MC\d+)$/.test(entry.name)) continue;
    if (!fs.existsSync(path.join(atlasDir, entry.name, 'index.html'))) continue;
    urls.push({ loc: `${SITE}/atlas/${entry.name}/`, lastmod: null });
  }
}

// Curated claim facets under /atlas/claims/<facet>/. Built by
// scripts/build-claim-facets.mjs. The facets index lives at /atlas/claims/.
const claimsDir = path.join(atlasDir, 'claims');
if (fs.existsSync(claimsDir)) {
  if (fs.existsSync(path.join(claimsDir, 'index.html'))) {
    urls.push({ loc: `${SITE}/atlas/claims/`, lastmod: null });
  }
  for (const entry of fs.readdirSync(claimsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!fs.existsSync(path.join(claimsDir, entry.name, 'index.html'))) continue;
    urls.push({ loc: `${SITE}/atlas/claims/${entry.name}/`, lastmod: null });
  }
}

// Static assets that are not directories but should be discoverable.
for (const file of ['proof-pack-climate-series.pdf']) {
  if (fs.existsSync(path.join(PUBLIC, file))) urls.push({ loc: `${SITE}/${file}`, lastmod: null });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), xml);
console.log(`sitemap: ${urls.length} URLs (${urls.filter((u) => u.lastmod).length} with lastmod)`);
