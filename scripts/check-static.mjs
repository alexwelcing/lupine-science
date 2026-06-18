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
  'public/og-lupine-science.png',
  'Dockerfile',
  'nginx.conf',
]) {
  if (!fs.existsSync(path.join(ROOT, relativePath))) fail(`missing ${relativePath}`);
}

const index = read('public/index.html');
const llms = read('public/llms.txt');
const sitemap = read('public/sitemap.xml');
const nginx = read('nginx.conf');

for (const [name, body] of Object.entries({ index, llms, sitemap })) {
  if (/library\.lupine\.science/i.test(body)) {
    fail(`${name} still references library.lupine.science`);
  }
}

const requiredIndexSnippets = [
  'Evidence before claim',
  'https://library.lupine.site',
  'https://lupi.live',
  'https://github.com/alexwelcing/lupine',
  'working paper',
  'no peer review',
];

for (const snippet of requiredIndexSnippets) {
  if (!index.includes(snippet)) fail(`index.html missing required snippet: ${snippet}`);
}

const forbiddenClaims = [
  /accepted\s+(at|by|in)\b/i,
  /published\s+in\b/i,
  /peer[-\s]?reviewed/i,
  /submitted\s+to\b/i,
];

for (const pattern of forbiddenClaims) {
  if (pattern.test(index)) fail(`index.html contains forbidden publication-status claim: ${pattern}`);
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
