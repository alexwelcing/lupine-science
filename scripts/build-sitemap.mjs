#!/usr/bin/env node
// Regenerates public/sitemap.xml from what actually ships: every
// public/**/index.html plus the root. lastmod comes from git history of the
// page's source (article markdown when it exists, else the built HTML), so
// dates are honest and deterministic.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://lupine.science';

function gitDate(...candidates) {
  for (const rel of candidates) {
    if (!fs.existsSync(path.join(ROOT, rel))) continue;
    try {
      const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', rel], { cwd: ROOT }).toString().trim();
      if (out) return out.slice(0, 10);
    } catch { /* not a git checkout */ }
  }
  return null;
}

const urls = [];
function page(urlPath, ...sources) {
  const lastmod = gitDate(...sources);
  urls.push({ loc: `${SITE}${urlPath}`, lastmod });
}

page('/', 'public/index.html');
page('/articles/', 'public/articles/index.html');
for (const entry of fs.readdirSync(path.join(PUBLIC, 'articles'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  if (!fs.existsSync(path.join(PUBLIC, 'articles', slug, 'index.html'))) continue;
  page(`/articles/${slug}/`, `articles/${slug}.md`, `public/articles/${slug}/index.html`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), xml);
console.log(`sitemap: ${urls.length} URLs`);
