#!/usr/bin/env node
// Builds self-hosted font subsets in public/fonts/.
//
// Downloads the latin woff2 files Google Fonts serves, then subsets them to
// the glyphs actually used across public/**/*.html and articles/**/*.md
// (plus Basic Latin), preserving the Newsreader variable axes. Run when
// copy introduces new non-ASCII glyphs; scripts/check-static.mjs verifies
// coverage stays complete.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'fonts');
fs.mkdirSync(OUT, { recursive: true });

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const FAMILIES = [
  {
    file: 'newsreader-var.woff2',
    css: 'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300..600&display=swap',
    style: 'normal',
  },
  {
    file: 'newsreader-italic-var.woff2',
    // italic never renders above weight 500 on the site
    css: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@1,6..72,300..500&display=swap',
    style: 'italic',
  },
  {
    file: 'plex-mono-400.woff2',
    css: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&display=swap',
    style: 'normal',
  },
  {
    file: 'plex-mono-600.woff2',
    css: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@600&display=swap',
    style: 'normal',
  },
];

function collectGlyphs() {
  const chars = new Set();
  // Basic Latin printable range is always included.
  for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCharCode(c));
  const scan = (dir, exts) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(p, exts);
      else if (exts.some((e) => entry.name.endsWith(e))) {
        for (const ch of fs.readFileSync(p, 'utf8')) chars.add(ch);
      }
    }
  };
  scan(path.join(ROOT, 'public'), ['.html', '.txt']);
  scan(path.join(ROOT, 'articles'), ['.md']);
  // Drop control chars/newlines.
  for (const ch of [...chars]) if (ch.charCodeAt(0) < 0x20) chars.delete(ch);
  return [...chars].join('');
}

async function latinWoff2Url(cssUrl) {
  const res = await fetch(cssUrl, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`fonts CSS fetch failed: ${res.status}`);
  const css = await res.text();
  // Blocks are ordered; the plain `latin` block is what we want (not latin-ext).
  const blocks = css.split('/*').filter((b) => b.startsWith(' latin */'));
  const block = blocks[0];
  if (!block) throw new Error(`no latin block in ${cssUrl}`);
  const m = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
  if (!m) throw new Error(`no woff2 url in latin block of ${cssUrl}`);
  return m[1];
}

const text = collectGlyphs();
console.log(`glyph set: ${text.length} unique characters`);

for (const fam of FAMILIES) {
  const url = await latinWoff2Url(fam.css);
  const raw = Buffer.from(await (await fetch(url, { headers: { 'user-agent': UA } })).arrayBuffer());
  const subset = await subsetFont(raw, text, { targetFormat: 'woff2' });
  fs.writeFileSync(path.join(OUT, fam.file), subset);
  console.log(`${fam.file}: ${(raw.length / 1024).toFixed(1)} KB → ${(subset.length / 1024).toFixed(1)} KB`);
}
console.log(`fonts → ${OUT}`);
