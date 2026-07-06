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

const urls = [{ loc: `${SITE}/`, lastmod: null }, { loc: `${SITE}/articles/`, lastmod: null }];
for (const entry of fs.readdirSync(path.join(PUBLIC, 'articles'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  if (!fs.existsSync(path.join(PUBLIC, 'articles', slug, 'index.html'))) continue;
  urls.push({ loc: `${SITE}/articles/${slug}/`, lastmod: articleDate(slug) });
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
