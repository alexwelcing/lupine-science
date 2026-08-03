#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CAMPAIGN = path.join(ROOT, 'public/brand-assets/campaign-2026-07-27');
const OUT = path.join(ROOT, 'media/brand-campaign-2026-07-27/final-qa-evidence');
const UNTOUCHED = new Set(['B1-A01-02', 'B1-A03-01', 'B1-A03-03']);
const BRAND = [[250,249,246], [22,23,29], [61,77,179], [138,94,31]];

function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
function expectedDimensions(id) {
  const slot = Number(id.match(/-(\d\d)(?:-R1)?$/)?.[1]);
  return slot === 1 || slot === 5 ? { width: 1536, height: 864 } : { width: 1536, height: 1024 };
}
function dist2(a, b) { return (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2; }

async function paletteMetrics(file) {
  const { data, info } = await sharp(file).resize(256, 256, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let light = 0, dark = 0, saturated = 0, brandNear = 0, ochreNear = 0;
  const n = info.width * info.height;
  for (let i = 0; i < data.length; i += 3) {
    const p = [data[i], data[i+1], data[i+2]];
    const max = Math.max(...p), min = Math.min(...p), lum = (p[0]*0.2126 + p[1]*0.7152 + p[2]*0.0722);
    if (lum >= 220) light++;
    if (lum <= 55) dark++;
    if (max - min >= 75) saturated++;
    const distances = BRAND.map((c) => dist2(p, c));
    if (Math.min(...distances) <= 55**2) brandNear++;
    if (distances[3] <= 45**2) ochreNear++;
  }
  return {
    light_fraction: +(light/n).toFixed(4), dark_fraction: +(dark/n).toFixed(4),
    saturated_fraction: +(saturated/n).toFixed(4), brand_near_fraction: +(brandNear/n).toFixed(4),
    ochre_near_fraction: +(ochreNear/n).toFixed(4),
  };
}

async function ocr(workerA, workerB, file) {
  const base = await sharp(file).resize({ width: 1800, withoutEnlargement: true }).png().toBuffer();
  const normalized = await sharp(file).resize({ width: 1800, withoutEnlargement: true }).grayscale().normalize().sharpen().png().toBuffer();
  const recognize = async (worker, buffer) => {
    const { data } = await worker.recognize(buffer);
    return (data.words || []).map((w) => ({ text: w.text, confidence: +Number(w.confidence).toFixed(1) }))
      .filter((w) => /[A-Za-z0-9]/.test(w.text));
  };
  const a = await recognize(workerA, base);
  const b = await recognize(workerB, normalized);
  const strong = [...a.map((w) => ({...w, pass: 'default'})), ...b.map((w) => ({...w, pass: 'sparse-normalized'}))]
    .filter((w) => w.confidence >= 60);
  return { default: a, sparse_normalized: b, strong };
}

async function makeSheet(batch, records) {
  const cellW = 360, cellH = 270, labelH = 34, cols = 4, rows = Math.ceil(records.length / cols);
  const canvas = sharp({ create: { width: cols*cellW, height: rows*(cellH+labelH), channels: 3, background: '#faf9f6' } });
  const composites = [];
  for (let i = 0; i < records.length; i++) {
    const thumb = await sharp(records[i].absolute_path).resize(cellW, cellH, { fit: 'contain', background: '#faf9f6' }).jpeg({ quality: 88 }).toBuffer();
    const label = Buffer.from(`<svg width="${cellW}" height="${labelH}"><rect width="100%" height="100%" fill="#faf9f6"/><text x="8" y="23" font-family="DejaVu Sans" font-size="17" fill="#16171d">${records[i].asset_id}${records[i].source === 'replacement' ? ' R1' : ' original PASS'}</text></svg>`);
    const left = (i % cols) * cellW, top = Math.floor(i / cols) * (cellH+labelH);
    composites.push({ input: thumb, left, top }, { input: label, left, top: top+cellH });
  }
  const sheet = path.join(OUT, `${batch}-candidate-contact-sheet.jpg`);
  await canvas.composite(composites).jpeg({ quality: 90 }).toFile(sheet);
  return path.relative(ROOT, sheet);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const candidates = [], excluded = [], provenance = {};
  for (let b = 1; b <= 6; b++) {
    const batch = `B${b}`;
    const manifestPath = path.join(CAMPAIGN, batch, 'manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const originals = manifest.assets.filter((a) => !a.original_asset_id);
    const retries = manifest.assets.filter((a) => a.original_asset_id);
    provenance[batch] = { original_count: originals.length, retry_count: retries.length, retry_statuses: {} };
    for (const r of retries) provenance[batch].retry_statuses[r.status] = (provenance[batch].retry_statuses[r.status] || 0) + 1;
    for (const original of originals) {
      let chosen, source;
      if (UNTOUCHED.has(original.asset_id)) { chosen = original; source = 'untouched-original'; }
      else {
        const retry = retries.find((r) => r.original_asset_id === original.asset_id);
        if (!retry || retry.status !== 'generated' || !retry.replacement_path) {
          excluded.push({
            asset_id: original.asset_id,
            batch,
            exact_path: original.output_path,
            reason: retry ? `attempt-1-${retry.status}` : 'missing-attempt-1-record',
            attempt_record: retry || null,
          });
          continue;
        }
        chosen = retry; source = 'replacement';
      }
      const absolute = source === 'replacement' ? chosen.replacement_path : chosen.output_path;
      const buffer = await readFile(absolute);
      const meta = await sharp(buffer).metadata();
      const expected = expectedDimensions(original.asset_id);
      candidates.push({
        asset_id: original.asset_id,
        batch,
        source,
        exact_path: path.relative(ROOT, absolute),
        absolute_path: absolute,
        sha256: sha256(buffer),
        bytes: buffer.length,
        dimensions: { width: meta.width, height: meta.height },
        expected_dimensions: expected,
        dimension_pass: meta.width === expected.width && meta.height === expected.height,
        palette_metrics: await paletteMetrics(absolute),
      });
    }
  }

  const workerA = await createWorker('eng');
  const workerB = await createWorker('eng');
  await workerB.setParameters({ tessedit_pageseg_mode: '11' });
  for (let i = 0; i < candidates.length; i++) {
    process.stderr.write(`OCR ${i+1}/${candidates.length} ${candidates[i].asset_id}\n`);
    candidates[i].ocr = await ocr(workerA, workerB, candidates[i].absolute_path);
  }
  await workerA.terminate(); await workerB.terminate();

  const contactSheets = {};
  for (let b = 1; b <= 6; b++) {
    const batch = `B${b}`;
    contactSheets[batch] = await makeSheet(batch, candidates.filter((r) => r.batch === batch));
  }
  for (const r of candidates) delete r.absolute_path;
  const report = {
    schema_version: '1.0.0', campaign_id: 'brand-campaign-2026-07-27',
    generated_at: new Date().toISOString(),
    policy: { accepted_untouched: [...UNTOUCHED], retry_limit: 1, zero_baked_text: true },
    counts: {
      candidates: candidates.length, excluded_before_visual_qa: excluded.length,
      dimension_pass: candidates.filter((r) => r.dimension_pass).length,
      ocr_strong_flagged: candidates.filter((r) => r.ocr.strong.length).length,
    },
    provenance, contact_sheets: contactSheets, candidates, excluded,
  };
  const reportPath = path.join(OUT, 'image-machine-qa.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ report: path.relative(ROOT, reportPath), counts: report.counts, contact_sheets: contactSheets }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
