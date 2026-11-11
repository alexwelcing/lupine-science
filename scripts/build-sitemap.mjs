#!/usr/bin/env node
// Regenerates public/sitemap.xml from what actually ships: every
// public/**/index.html plus the root.
//
// lastmod must be DETERMINISTIC: CI rebuilds the sitemap and fails if it
// differs from the committed one, so dates cannot come from git commit
// times (the commit containing the sitemap changes them — chicken and
// egg). Articles therefore use their own declared "> **Updated:**" metadata
// when present, falling back to "> **Date:**" for never-updated content;
// pages with no intrinsic date omit lastmod, which the sitemap spec allows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCompany, asOfDate, documentStatus } from './lib/discovery.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://lupine.science';

function articleDate(slug) {
  const md = path.join(ROOT, 'articles', `${slug}.md`);
  if (!fs.existsSync(md)) return null;
  const source = fs.readFileSync(md, 'utf8');
  const updated = source.match(/^> \*\*Updated:\*\*\s*(\d{4}-\d{2}-\d{2})/m);
  const published = source.match(/^> \*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/m);
  return updated?.[1] || published?.[1] || null;
}

// Archived articles keep their URL (noindex) but are not offered to crawlers.
function articleArchived(slug) {
  const md = path.join(ROOT, 'articles', `${slug}.md`);
  if (!fs.existsSync(md)) return false;
  const status = fs.readFileSync(md, 'utf8').match(/^> \*\*Status:\*\*\s*(.+?)\s*$/m)?.[1];
  return documentStatus(status) === 'Archived';
}

function correctionsUpdated() {
  const page = path.join(PUBLIC, 'corrections', 'index.html');
  if (!fs.existsSync(page)) return null;
  return fs.readFileSync(page, 'utf8').match(/Corrections log · updated <time datetime="(\d{4}-\d{2}-\d{2})"/)?.[1] || null;
}

// The homepage and /about/ carry the newest dated fact on the site (the same
// "as of" scripts/lib/discovery.mjs stamps on them): deterministic, and it
// tells crawlers the front door moves whenever anything ships.
const company = loadCompany(ROOT);
const siteAsOf = asOfDate(company, fs.readdirSync(path.join(ROOT, 'articles'))
  .filter((f) => f.endsWith('.md') && !articleArchived(f.replace(/\.md$/, '')))
  .map((f) => ({ date: articleDate(f.replace(/\.md$/, '')) || '' })));

const urls = [
  { loc: `${SITE}/`, lastmod: siteAsOf || null },
  { loc: `${SITE}/about/`, lastmod: siteAsOf || null },
  // the corrections log carries its own "updated" date in its kicker
  ...(fs.existsSync(path.join(PUBLIC, 'corrections', 'index.html'))
    ? [{ loc: `${SITE}/corrections/`, lastmod: correctionsUpdated() }]
    : []),
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
  if (articleArchived(slug)) continue;
  urls.push({ loc: `${SITE}/articles/${slug}/`, lastmod: articleDate(slug) });
}

for (const entry of fs.readdirSync(path.join(PUBLIC, 'videos'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (!fs.existsSync(path.join(PUBLIC, 'videos', entry.name, 'index.html'))) continue;
  urls.push({ loc: `${SITE}/videos/${entry.name}/`, lastmod: articleDate(entry.name) });
}
// No /presentations/* entries: the only presentation was retired on
// 2026-11-11 and now redirects to /about/ (public/_redirects).

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
// The climate-series proof pack was retired on 2026-11-11 (see /corrections/);
// its URL now redirects there (public/_redirects).
for (const file of [
  'booklets/the-savings-stack.pdf',
  'papers/memorandum-correction-boundary-2026-07-20.pdf',
]) {
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
