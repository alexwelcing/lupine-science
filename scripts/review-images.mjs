#!/usr/bin/env node
/**
 * Adversarial image-text audit.
 *
 * Every raster image that ships on lupine.science is OCRed twice — once as-is
 * and once after a contrast/sharpen normalization with a sparse-text page
 * segmentation mode. Words are classified against the system dictionary, the
 * Lupine domain corpus (articles, captions, chart manifests), and a character
 * bigram model. Anything that looks like model-hallucinated fake text is a P0
 * credibility failure: one gibberish frame can destroy trust in the whole
 * publication.
 *
 * Result-graphics SVGs are audited by extracting their <text> nodes directly
 * (no OCR) — they are data charts whose labels must be real words.
 *
 * Usage:
 *   node scripts/review-images.mjs                 # full audit, exit 1 on P0
 *   node scripts/review-images.mjs --no-fail       # report only
 *   node scripts/review-images.mjs --filter five-materials
 */
import { createWorker } from 'tesseract.js';
import { readdir, writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  loadDictionary,
  buildDomainCorpus,
  trainBigramModel,
  findSuspectWords,
} from './lib/text-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const REPORT_DIR = path.join(ROOT, 'media', 'projects', 'image-review', 'reports');
const RASTER = /\.(jpe?g|png|webp)$/i;

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = { fail: true, filter: null, limit: Infinity };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--no-fail') flags.fail = false;
    else if (args[i] === '--filter') flags.filter = args[++i];
    else if (args[i] === '--limit') flags.limit = Number(args[++i]);
  }
  return flags;
}

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p, out);
    else if (RASTER.test(entry.name)) out.push(p);
  }
  return out;
}

async function collectImages() {
  const targets = [];
  const articleImages = await walk(path.join(PUBLIC, 'articles'));
  for (const f of articleImages) targets.push(f);
  const posterDir = path.join(PUBLIC, 'videos');
  for (const f of await readdir(posterDir)) {
    if (/-poster\.jpg$/.test(f)) targets.push(path.join(posterDir, f));
  }
  const onePager = path.join(PUBLIC, 'one-pager-assets');
  if (existsSync(onePager)) {
    for (const f of await walk(onePager)) targets.push(f);
  }
  return targets.sort();
}

async function collectSvgCharts() {
  const dir = path.join(PUBLIC, 'result-graphics');
  if (!existsSync(dir)) return [];
  return (await readdir(dir)).filter((f) => f.endsWith('.svg')).map((f) => path.join(dir, f)).sort();
}

async function ocrImage(worker, buffer) {
  const { data } = await worker.recognize(buffer);
  if (Array.isArray(data.words) && data.words.length) {
    return data.words.map((w) => ({ text: w.text, confidence: w.confidence }));
  }
  // Fallback: no word boxes — tokenize the raw text with unknown confidence.
  return String(data.text || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, confidence: undefined }));
}

async function auditRaster(file, workerA, workerB, dictionary, corpus, bigram) {
  const rel = '/' + path.relative(PUBLIC, file).replace(/\\/g, '/');
  const base = await sharp(file)
    .resize({ width: 2200, withoutEnlargement: true })
    .png()
    .toBuffer();
  const normalized = await sharp(file)
    .resize({ width: 2200, withoutEnlargement: true })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();

  const passes = [];
  try {
    passes.push({ name: 'default', words: await ocrImage(workerA, base) });
  } catch (e) {
    passes.push({ name: 'default', error: e.message, words: [] });
  }
  try {
    passes.push({ name: 'sparse-normalized', words: await ocrImage(workerB, normalized) });
  } catch (e) {
    passes.push({ name: 'sparse-normalized', error: e.message, words: [] });
  }

  const wordCount = passes.reduce((s, p) => s + p.words.length, 0);
  const byClean = new Map();
  for (const p of passes) {
    for (const w of p.words) {
      const clean = String(w.text).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!clean) continue;
      if (!byClean.has(clean)) byClean.set(clean, { passes: new Set(), best: w });
      const rec = byClean.get(clean);
      rec.passes.add(p.name);
      if ((w.confidence ?? 0) > (rec.best.confidence ?? 0)) rec.best = w;
    }
  }

  const suspects = findSuspectWords(
    [...byClean.values()].map((r) => r.best),
    dictionary,
    corpus,
    bigram,
  ).map((s) => ({
    ...s,
    passes: byClean.get(s.clean)?.passes.size || 1,
  }));

  // Adversarial promotion: a suspect is "strong" if both passes saw it, or it
  // is high-confidence, or its character distribution is deeply pathological.
  const strong = suspects.filter(
    (s) => s.passes >= 2 || (s.confidence ?? 0) >= 80 || s.score < -5.5,
  );
  const highConfNonsense = strong.filter((s) => (s.confidence ?? 0) >= 85 && s.score < -5);

  const p0 = strong.length >= 3 || highConfNonsense.length >= 1;
  const p1 = !p0 && strong.length >= 1;

  return {
    file: rel,
    wordCount,
    suspectCount: suspects.length,
    strongCount: strong.length,
    severity: p0 ? 'P0' : p1 ? 'P1' : 'ok',
    suspects: suspects.slice(0, 12),
    preview: passes[0]?.words.slice(0, 40).map((w) => w.text).join(' ').slice(0, 300) || '',
  };
}

async function auditSvg(file, dictionary, corpus, bigram) {
  const rel = '/' + path.relative(PUBLIC, file).replace(/\\/g, '/');
  const svg = await readFile(file, 'utf8');
  const texts = [...svg.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, ' ').trim())
    .filter(Boolean);
  const words = texts.flatMap((t) => t.split(/\s+/)).filter(Boolean).map((text) => ({ text, confidence: undefined }));
  const suspects = findSuspectWords(words, dictionary, corpus, bigram);
  return {
    file: rel,
    wordCount: words.length,
    suspectCount: suspects.length,
    strongCount: suspects.length,
    severity: suspects.length ? 'P1' : 'ok',
    suspects: suspects.slice(0, 12),
    preview: texts.join(' ').slice(0, 300),
  };
}

function formatReport(reports, generatedAt) {
  const lines = [];
  const p0 = reports.filter((r) => r.severity === 'P0');
  const p1 = reports.filter((r) => r.severity === 'P1');
  lines.push('# Adversarial Image-Text Audit');
  lines.push(`Generated: ${generatedAt}`);
  lines.push(`Images audited: ${reports.length}`);
  lines.push('');
  lines.push(`- P0 (likely fake text): ${p0.length}`);
  lines.push(`- P1 (suspect tokens, needs eyeball): ${p1.length}`);
  lines.push(`- Clean: ${reports.length - p0.length - p1.length}`);
  lines.push('');
  for (const r of [...p0, ...p1]) {
    lines.push(`## ${r.severity} ${r.file}`);
    lines.push(`OCR words: ${r.wordCount} · suspects: ${r.suspectCount} · strong: ${r.strongCount}`);
    if (r.suspects.length) {
      lines.push(`Suspects: ${r.suspects.map((s) => `${s.word} (score ${s.score}, conf ${s.confidence ?? '?'}, passes ${s.passes})`).join(', ')}`);
    }
    if (r.preview) lines.push(`OCR preview: "${r.preview.replace(/\s+/g, ' ').trim()}"`);
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const flags = parseArgs();
  await mkdir(REPORT_DIR, { recursive: true });

  let images = await collectImages();
  const svgs = await collectSvgCharts();
  if (flags.filter) {
    images = images.filter((f) => f.includes(flags.filter));
  }
  images = images.slice(0, flags.limit);

  const dictionary = await loadDictionary();
  const corpus = await buildDomainCorpus();
  const bigram = trainBigramModel(dictionary.size > 0 ? dictionary : corpus);
  console.error(`Dictionary ${dictionary.size}, corpus ${corpus.size}`);
  console.error(`Auditing ${images.length} raster images + ${svgs.length} SVG charts`);

  const workerA = await createWorker('eng', 1, {
    logger: (m) => { if (m.status === 'error') console.error('tesseract:', m); },
  });
  const workerB = await createWorker('eng', 1, {
    logger: (m) => { if (m.status === 'error') console.error('tesseract:', m); },
  });
  await workerB.setParameters({ tessedit_pageseg_mode: '11' }); // sparse text

  const reports = [];
  for (const file of images) {
    const rel = path.relative(PUBLIC, file);
    console.error(`OCR ${rel}`);
    reports.push(await auditRaster(file, workerA, workerB, dictionary, corpus, bigram));
  }
  for (const file of svgs) {
    if (flags.filter && !file.includes(flags.filter)) continue;
    reports.push(await auditSvg(file, dictionary, corpus, bigram));
  }

  await workerA.terminate();
  await workerB.terminate();

  const generatedAt = new Date().toISOString();
  const base = generatedAt.slice(0, 19).replace(/[:T]/g, '-');
  const jsonPath = path.join(REPORT_DIR, `${base}-image-audit.json`);
  const mdPath = path.join(REPORT_DIR, `${base}-image-audit.md`);
  await writeFile(jsonPath, JSON.stringify({ generatedAt, images: reports }, null, 2));
  await writeFile(mdPath, formatReport(reports, generatedAt));

  const p0 = reports.filter((r) => r.severity === 'P0');
  const p1 = reports.filter((r) => r.severity === 'P1');
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
  console.log(`Audited ${reports.length} images: ${p0.length} P0, ${p1.length} P1, ${reports.length - p0.length - p1.length} clean`);
  if (p0.length) {
    console.log('\nP0 images (likely fake text):');
    for (const r of p0) console.log(`- ${r.file}: ${r.suspects.slice(0, 5).map((s) => s.word).join(', ')}`);
  }
  if (flags.fail && p0.length) {
    console.error(`\nFailing because ${p0.length} image(s) contain likely hallucinated text.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
