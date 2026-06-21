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
]) {
  if (!fs.existsSync(path.join(ROOT, relativePath))) fail(`missing ${relativePath}`);
}

const index = read('public/index.html');
const llms = read('public/llms.txt');
const sitemap = read('public/sitemap.xml');
const nginx = read('nginx.conf');

const requiredIndexSnippets = [
  'Evidence before claim',
  'Unlocking the materials that build the future',
  'AI is learning to design matter',
  'https://library.lupine.science',
  'https://lupi.live',
  'https://github.com/alexwelcing/lupine',
  'Working paper in preparation',
  'not yet peer-reviewed',
];

for (const snippet of requiredIndexSnippets) {
  if (!index.includes(snippet)) fail(`index.html missing required snippet: ${snippet}`);
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

const publicFiles = fs.readdirSync(PUBLIC).sort();
console.log(`Static files: ${publicFiles.length}`);
console.log(`Public root: ${PUBLIC}`);

if (errors.length) {
  for (const message of errors) console.error(`[error] ${message}`);
  process.exit(1);
}

console.log('lupine.science static verification passed.');
