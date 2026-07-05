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
  'public/og-lupine-science.png',
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
