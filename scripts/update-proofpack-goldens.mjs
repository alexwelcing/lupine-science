#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'five-materials-for-5-to-12-gtco2-year';
const OUT_DIR = path.join(ROOT, 'public', 'proof-packs');
const PDF_PATH = path.join(OUT_DIR, `${SLUG}.proofpack.pdf`);
const GOLDEN_DIR = path.join(ROOT, 'tests', 'golden', 'proof-packs');
const HASH_PATH = path.join(GOLDEN_DIR, `${SLUG}.proofpack.pdf.sha256`);
const TEXT_PATH = path.join(GOLDEN_DIR, `${SLUG}.proofpack.txt`);

execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build-proofpack.mjs'), '--slug', SLUG, '--out-dir', OUT_DIR], {
  cwd: ROOT,
  stdio: 'inherit',
});

const bytes = fs.readFileSync(PDF_PATH);
const hash = crypto.createHash('sha256').update(bytes).digest('hex');
const text = execFileSync('pdftotext', ['-layout', PDF_PATH, '-'], { encoding: 'utf8' });

fs.mkdirSync(GOLDEN_DIR, { recursive: true });
fs.writeFileSync(HASH_PATH, `${hash}\n`);
fs.writeFileSync(TEXT_PATH, text);
console.log(`Updated reviewed proof-pack goldens:\n- ${path.relative(ROOT, HASH_PATH)}\n- ${path.relative(ROOT, TEXT_PATH)}`);
