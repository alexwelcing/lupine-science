#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const errors = [];

function fail(message) {
  errors.push(message);
}

function read(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing ${relativePath}`);
    return '';
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

for (const relativePath of [
  'public/index.html',
  'public/health',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/llms.txt',
  'public/data/benchmark_manifold.json',
  'public/lupine-science-icon.png',
  'public/lupine-science-mark.svg',
  'public/og-lupine-science.jpg',
  'public/ribbon-still.jpg',
  'Dockerfile',
  'nginx.conf',
  'wrangler.toml',
]) {
  if (!fs.existsSync(path.join(ROOT, relativePath))) fail(`missing ${relativePath}`);
}

const index = read('public/index.html');
const health = read('public/health');
const llms = read('public/llms.txt');
const sitemap = read('public/sitemap.xml');
const nginx = read('nginx.conf');
const wrangler = read('wrangler.toml');

const requiredIndexSnippets = [
  'Evidence before claim',
  'Unlocking the materials that build the future',
  'AI is learning to design matter',
  'https://library.lupine.science',
  'https://lupi.live',
  'https://github.com/alexwelcing/lupine',
  'Working paper in preparation',
  'not yet peer-reviewed',
  // the receipts line: performance measured client-side, never asserted
  'measured by your browser, not claimed by ours',
  // the crystal must stay provenanced: committed data + published source
  '/data/mof5_structure.json',
  'Nature 402, 276',
];

for (const snippet of requiredIndexSnippets) {
  if (!index.includes(snippet)) fail(`index.html missing required snippet: ${snippet}`);
}

// perf regression guards: these must never come back
if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(index)) {
  fail('index.html references Google Fonts — fonts must stay self-hosted');
}
if (/cache:\s*["']no-store["']/.test(index)) {
  fail('index.html uses cache:"no-store" — use HTTP caching instead');
}
for (const dead of ['public/hero-cyanotype.png', 'public/launch-video.mp4']) {
  if (fs.existsSync(path.join(ROOT, dead))) fail(`${dead} is dead weight and must not return`);
}
if (!fs.existsSync(path.join(PUBLIC, '_headers'))) fail('missing public/_headers');
for (const font of [
  'fonts/newsreader-var.woff2', 'fonts/newsreader-italic-var.woff2',
  'fonts/plex-mono-400.woff2', 'fonts/plex-mono-600.woff2',
]) {
  if (!fs.existsSync(path.join(PUBLIC, font))) fail(`missing public/${font}`);
}
if (!fs.existsSync(path.join(PUBLIC, 'data/mof5_structure.json'))) {
  fail('missing public/data/mof5_structure.json');
}

// the CSP in _headers must match the inline scripts actually shipped
try {
  const { collectScriptHashes } = await import('./build-headers.mjs');
  const headers = read('public/_headers');
  for (const hash of collectScriptHashes()) {
    if (!headers.includes(hash)) fail(`public/_headers CSP is stale: missing ${hash} — run: node scripts/build-headers.mjs`);
  }
} catch (e) {
  fail(`could not verify CSP hashes: ${e.message}`);
}

const forbiddenClaims = [
  /accepted\s+(at|by|in)\b/i,
  /published\s+in\b/i,
  /submitted\s+to\b/i,
];

for (const pattern of forbiddenClaims) {
  if (pattern.test(index)) fail(`index.html contains forbidden publication-status claim: ${pattern}`);
}

// the claims policy applies to every shipped page, not just the front door
function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(p, out);
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Root-relative files referenced by shipped HTML must exist at build time.
for (const file of walkHtml(PUBLIC)) {
  const html = fs.readFileSync(file, 'utf8');
  const references = [];
  for (const match of html.matchAll(/\b(?:src|poster|href)="(\/[^"]+)"/g)) references.push(match[1]);
  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) references.push(candidate.trim().split(/\s+/)[0]);
  }
  for (const reference of references) {
    const pathname = decodeURIComponent(new URL(reference, 'https://lupine.science').pathname);
    if (pathname.endsWith('/') || reference.includes('#')) continue;
    if (!fs.existsSync(path.join(PUBLIC, pathname.slice(1)))) {
      fail(`${path.relative(ROOT, file)} references missing asset ${pathname}`);
    }
  }
  if (/fonts\.(?:googleapis|gstatic)\.com/.test(html)) {
    fail(`${path.relative(ROOT, file)} references Google Fonts — fonts must stay self-hosted`);
  }
}

// Articles may cite other groups' published work; what they must never do is
// claim publication status for OUR paper.
const forbiddenFirstPersonClaims = [
  /(our|this)\s+(paper|preprint|manuscript|work)\s+(was\s+|is\s+|has\s+been\s+)?(accepted|published|submitted)/i,
  /we\s+(have\s+)?(submitted|published)\b/i,
];
for (const file of walkHtml(path.join(PUBLIC, 'articles'))) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  for (const pattern of forbiddenFirstPersonClaims) {
    if (pattern.test(html)) fail(`${rel} contains forbidden publication-status claim: ${pattern}`);
  }
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) {
    fail(`${rel} references Google Fonts — fonts must stay self-hosted`);
  }
}

// sitemap must cover exactly what ships: every article page, no phantoms
{
  const slugs = fs.readdirSync(path.join(PUBLIC, 'articles'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(PUBLIC, 'articles', e.name, 'index.html')))
    .map((e) => e.name);
  for (const slug of slugs) {
    if (!sitemap.includes(`https://lupine.science/articles/${slug}/`)) {
      fail(`sitemap.xml missing /articles/${slug}/ — run: node scripts/build-sitemap.mjs`);
    }
  }
  for (const m of sitemap.matchAll(/<loc>https:\/\/lupine\.science(\/[^<]*)<\/loc>/g)) {
    const p = m[1];
    if (p === '/') continue;
    if (p.endsWith('/')) {
      const asFile = path.join(PUBLIC, p.replace(/^\//, ''), 'index.html');
      if (!fs.existsSync(asFile)) fail(`sitemap.xml lists ${p} but no page ships there`);
    } else {
      const asFile = path.join(PUBLIC, p.replace(/^\//, ''));
      if (!fs.existsSync(asFile)) fail(`sitemap.xml lists ${p} but no file ships there`);
    }
  }
}

if (/\bpeer[-\s]?reviewed\b/i.test(index) && !/\bnot\s+yet\s+peer[-\s]?reviewed\b/i.test(index)) {
  fail('index.html mentions peer review without the required "not yet peer-reviewed" qualifier');
}

for (const [name, body] of Object.entries({ llms, sitemap })) {
  if (/library\.lupine\.site/i.test(body)) {
    fail(`${name} references library.lupine.site, but the live Library domain is library.lupine.science`);
  }
}

if (!/location\s*=\s*\/health/.test(nginx) || !/return\s+200\s+"ok\\n"/.test(nginx)) {
  fail('nginx.conf must expose GET /health -> ok');
}

if (health !== 'ok\n') {
  fail('public/health must expose GET /health -> ok on Cloudflare Pages');
}

if (!/name\s*=\s*"lupine-science"/.test(wrangler) || !/pages_build_output_dir\s*=\s*"public"/.test(wrangler)) {
  fail('wrangler.toml must target the lupine-science Pages project and public output directory');
}

const publicFiles = fs.readdirSync(PUBLIC).sort();
console.log(`Static files: ${publicFiles.length}`);
console.log(`Public root: ${PUBLIC}`);

if (errors.length) {
  for (const message of errors) console.error(`[error] ${message}`);
  process.exit(1);
}

console.log('lupine.science static verification passed.');
