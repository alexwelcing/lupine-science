#!/usr/bin/env node
/**
 * Brand-asset feature probe (generation-loop evidence, NOT a pass/fail gate).
 *
 * Built during BRAND-1 wave-3 planning to pre-filter generation candidates
 * before editorial review. Calibration against the campaign's two certified
 * sets — 33 reviewer-accepted images vs 67 reviewer-rejected shortfall-wave
 * images (media/brand-campaign-2026-07-27/) — showed these mechanical
 * features DO NOT separate editorial verdicts:
 *
 *   strongCount      0 for every accepted AND rejected image: the reviewer
 *                    "text/pseudo-label" class (43/67 wave-2 rejects) is
 *                    stylized marks tesseract never reads as words.
 *   offPaletteShare  accepted median 0.052 > rejected median 0.013 (inverted
 *                    vs. brand intent; warm-paper tones trip the ochre rule).
 *   paperShare       accepted median 0.626 < rejected median 0.897 (rejects
 *                    failed on semantics, not palette).
 *   darkFieldShare   0 across both sets.
 *
 * Conclusion: the dominant rejection classes are semantic (mechanism not
 * depicted, text-like marks, people/plants) and need a vision model, not
 * pixel statistics. Wave-3 therefore uses small-batch generation with a VLM
 * preflight (visual-tester) per batch instead of a mechanical gate. This
 * script remains as the feature extractor that produced that evidence; run
 * it on a candidate directory to get OCR/palette features as JSON.
 *
 * Usage:
 *   node scripts/preflight-brand-asset.mjs <dir-or-file> [...more]
 */
import { createWorker } from 'tesseract.js';
import { readdir, stat } from 'node:fs/promises';
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
const RASTER = /\.(jpe?g|png|webp)$/i;

// Brand law anchors (docs/brand.md).
const PAPER = [250, 249, 246]; // #faf9f6
const INDIGO = [61, 77, 179]; // #3d4db3
const INK = [22, 23, 29]; // #16171d

function colorDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

async function paletteFeatures(file) {
  const { data, info } = await sharp(file)
    .resize({ width: 256, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  let paper = 0;
  let indigo = 0;
  let ink = 0;
  let dark = 0;
  let offPalette = 0;
  for (let i = 0; i < n; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum < 48) dark++;
    if (colorDistance([r, g, b], PAPER) < 24) paper++;
    if (colorDistance([r, g, b], INDIGO) < 64) indigo++;
    if (colorDistance([r, g, b], INK) < 40) ink++;
    // Saturated cyan/teal, orange, ochre: high chroma hues the brand forbids.
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min > 60 && max > 110) {
      const isCyan = g > r && b > r;
      const isOrange = r > 150 && g > 60 && g < 190 && b < 110 && r > b + 60;
      const isOchre = r > 140 && g > 110 && b < 90 && Math.abs(r - g) < 70;
      if (isCyan || isOrange || isOchre) offPalette++;
    }
  }
  return {
    paperShare: paper / n,
    indigoShare: indigo / n,
    inkShare: ink / n,
    darkFieldShare: dark / n,
    offPaletteShare: offPalette / n,
  };
}

async function ocrWords(worker, buffer) {
  const { data } = await worker.recognize(buffer);
  if (Array.isArray(data.words) && data.words.length) {
    return data.words.map((w) => ({ text: w.text, confidence: w.confidence }));
  }
  return String(data.text || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, confidence: undefined }));
}

async function textFeatures(file, workerA, workerB, dictionary, corpus, bigram) {
  const base = await sharp(file).resize({ width: 2200, withoutEnlargement: true }).png().toBuffer();
  const normalized = await sharp(file)
    .resize({ width: 2200, withoutEnlargement: true })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();

  const passes = [];
  for (const [name, worker, buf] of [
    ['default', workerA, base],
    ['sparse-normalized', workerB, normalized],
  ]) {
    try {
      passes.push({ name, words: await ocrWords(worker, buf) });
    } catch {
      passes.push({ name, words: [] });
    }
  }

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
  ).map((s) => ({ ...s, passes: byClean.get(s.clean)?.passes.size || 1 }));
  const strong = suspects.filter((s) => s.passes >= 2 || (s.confidence ?? 0) >= 80 || s.score < -5.5);
  return {
    wordCount: passes.reduce((s, p) => s + p.words.length, 0),
    suspectCount: suspects.length,
    strongCount: strong.length,
    strongWords: strong.slice(0, 8).map((s) => s.text ?? s.clean),
  };
}

async function collectFiles(inputs) {
  const out = [];
  for (const input of inputs) {
    const st = await stat(input);
    if (st.isDirectory()) {
      const stack = [input];
      while (stack.length) {
        const dir = stack.pop();
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          const p = path.join(dir, entry.name);
          if (entry.isDirectory()) stack.push(p);
          else if (RASTER.test(entry.name)) out.push(p);
        }
      }
    } else if (RASTER.test(input)) {
      out.push(input);
    }
  }
  return out.sort();
}

async function main() {
  const inputs = process.argv.slice(2);
  if (!inputs.length) {
    console.error('usage: preflight-brand-asset.mjs <dir-or-file> [...]');
    process.exit(2);
  }

  const files = await collectFiles(inputs.map((i) => path.resolve(i)));
  if (!files.length) {
    console.error('no raster images found in inputs');
    process.exit(2);
  }

  const [dictionary, corpus] = await Promise.all([loadDictionary(), buildDomainCorpus()]);
  const bigram = trainBigramModel([...dictionary, ...corpus]);
  const workerA = await createWorker('eng');
  const workerB = await createWorker('eng', undefined, {
    tessedit_pageseg_mode: '11', // sparse text: find text anywhere
  });

  const results = [];
  try {
    for (const file of files) {
      const [palette, text] = await Promise.all([
        paletteFeatures(file),
        textFeatures(file, workerA, workerB, dictionary, corpus, bigram),
      ]);
      results.push({ file: path.relative(ROOT, file), ...palette, ...text });
      console.error(`feat  ${path.relative(ROOT, file)}`);
    }
  } finally {
    await workerA.terminate();
    await workerB.terminate();
  }

  console.log(JSON.stringify({ count: results.length, results }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
