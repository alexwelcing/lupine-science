#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

const ROOT = '/home/alex/Dev/lupine/lupine-science';
const MANIFEST_PATH = path.join(ROOT, 'public/brand-assets/campaign-2026-07-27/shortfall-wave-1-manifest.json');
const EXPECTED_MANIFEST_SHA256 = 'd8c6a9cb14cc5803453a5eaf68409966457f40e1f169cc34d32da040b635e383';
const EXPECTED_SCENE_SHA256 = 'bd9333fef20fe2cfe2268fd0a75c7715e67943c6bd55c222619d0df04ef7e70e';
const OUT = path.join(ROOT, 'media/brand-campaign-2026-07-27/shortfall-wave-1-qa');
const PAPER = [250, 249, 246];
const INK = [22, 23, 29];
const INDIGO = [61, 77, 179];

function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
function dist2(r, g, b, c) { return (r-c[0])**2 + (g-c[1])**2 + (b-c[2])**2; }
function round(value) { return +value.toFixed(5); }
function batchOf(asset) { return asset.original_asset_id.split('-')[0]; }
function escapeXml(value) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }

async function imageMetrics(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let warmPaper = 0, paperNear = 0, inkNear = 0, indigoNear = 0, dark = 0, saturated = 0;
  let cyanTeal = 0, orangeOchreYellow = 0, red = 0, green = 0, otherBlue = 0, lumSum = 0, lumSqSum = 0;
  const n = info.width * info.height;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const max = Math.max(r,g,b), min = Math.min(r,g,b), chroma = max-min;
    const lum = 0.2126*r + 0.7152*g + 0.0722*b;
    lumSum += lum; lumSqSum += lum*lum;
    if (lum >= 220 && chroma <= 34 && r >= b-3 && g >= b-3) warmPaper++;
    if (dist2(r,g,b,PAPER) <= 42**2) paperNear++;
    if (dist2(r,g,b,INK) <= 45**2) inkNear++;
    if (dist2(r,g,b,INDIGO) <= 55**2) indigoNear++;
    if (lum <= 55) dark++;
    if (chroma >= 70) saturated++;
    if (g > r*1.08 && b > r*1.08 && (g+b)/2 > 95 && chroma > 35) cyanTeal++;
    if (r > b*1.20 && g > b*1.05 && r > 105 && chroma > 35) orangeOchreYellow++;
    if (r > g*1.25 && r > b*1.25 && r > 105) red++;
    if (g > r*1.20 && g > b*1.12 && g > 90) green++;
    if (b > r*1.18 && b > g*1.08 && b > 90 && dist2(r,g,b,INDIGO) > 55**2) otherBlue++;
  }

  const sampled = await sharp(file).resize({ width: 256, height: 256, fit: 'fill' }).removeAlpha().raw().toBuffer();
  const mask = new Uint8Array(256*256);
  for (let i = 0, p = 0; i < sampled.length; i += 3, p++) {
    const r=sampled[i], g=sampled[i+1], b=sampled[i+2], max=Math.max(r,g,b), min=Math.min(r,g,b);
    const lum=0.2126*r+0.7152*g+0.0722*b;
    mask[p] = lum >= 220 && max-min <= 34 && r >= b-3 && g >= b-3 ? 1 : 0;
  }
  const seen = new Uint8Array(mask.length); let largest = 0, components = 0;
  for (let start=0; start<mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    components++; let count=0; const q=[start]; seen[start]=1;
    for (let qi=0; qi<q.length; qi++) {
      const p=q[qi], x=p%256, y=Math.floor(p/256); count++;
      const ns=[]; if(x)ns.push(p-1); if(x<255)ns.push(p+1); if(y)ns.push(p-256); if(y<255)ns.push(p+256);
      for (const np of ns) if(mask[np]&&!seen[np]) { seen[np]=1; q.push(np); }
    }
    largest=Math.max(largest,count);
  }
  const mean = lumSum/n;
  return {
    full_resolution_pixels: n,
    mean_luminance: round(mean/255),
    luminance_stddev: round(Math.sqrt(Math.max(0,lumSqSum/n-mean*mean))/255),
    warm_paper_fraction: round(warmPaper/n),
    exact_paper_near_fraction: round(paperNear/n),
    near_ink_fraction: round(inkNear/n),
    near_indigo_fraction: round(indigoNear/n),
    dark_fraction: round(dark/n),
    saturated_fraction: round(saturated/n),
    forbidden_hue_fraction: {
      cyan_teal: round(cyanTeal/n), orange_ochre_yellow: round(orangeOchreYellow/n), red: round(red/n),
      green: round(green/n), other_blue: round(otherBlue/n),
    },
    negative_space_proxy: {
      method: 'largest 4-connected warm-paper component after 256x256 area normalization',
      largest_open_warm_paper_fraction: round(largest/(256*256)),
      warm_paper_component_count: components,
      threshold_pass_45_percent: largest/(256*256) >= 0.45,
    },
  };
}

async function recognize(worker, input, pass) {
  const { data } = await worker.recognize(input);
  return (data.words || []).filter((w) => /[A-Za-z0-9]/.test(w.text || '')).map((w) => ({
    text: w.text, confidence: round(Number(w.confidence)), pass,
    bbox: w.bbox ? { x0:w.bbox.x0, y0:w.bbox.y0, x1:w.bbox.x1, y1:w.bbox.y1 } : null,
  }));
}

async function ocr(workerDefault, workerSparse, file) {
  const original = await readFile(file);
  const enhanced = await sharp(original).grayscale().normalize().sharpen({ sigma: 1.2 }).threshold(175).png().toBuffer();
  const [defaultWords, sparseWords] = await Promise.all([
    recognize(workerDefault, original, 'full-resolution-default'),
    recognize(workerSparse, enhanced, 'full-resolution-threshold-sparse'),
  ]);
  const all = [...defaultWords, ...sparseWords];
  return {
    method: 'Tesseract.js English at native output dimensions; original and grayscale/normalized/sharpened/thresholded sparse passes',
    default_words: defaultWords,
    threshold_sparse_words: sparseWords,
    strong_tokens: all.filter((w) => w.confidence >= 60),
    pseudo_writing_candidates: all.filter((w) => w.confidence >= 35),
  };
}

async function makeSheets(records) {
  const sheets = {};
  for (const batch of ['B1','B2','B3','B4','B5','B6']) {
    const items = records.filter((r) => r.batch === batch);
    const cols=3, cellW=600, imageH=400, labelH=46, rows=Math.ceil(items.length/cols);
    const composites=[];
    for (let i=0;i<items.length;i++) {
      const image=await sharp(items[i].output_path).resize(cellW,imageH,{fit:'contain',background:'#faf9f6'}).jpeg({quality:92}).toBuffer();
      const label=Buffer.from(`<svg width="${cellW}" height="${labelH}"><rect width="100%" height="100%" fill="#faf9f6"/><text x="8" y="30" font-family="DejaVu Sans" font-size="21" fill="#16171d">${escapeXml(items[i].asset_id)}</text></svg>`);
      const left=(i%cols)*cellW, top=Math.floor(i/cols)*(imageH+labelH);
      composites.push({input:image,left,top},{input:label,left,top:top+imageH});
    }
    const out=path.join(OUT,`contact-sheet-${batch}.jpg`);
    await sharp({create:{width:cols*cellW,height:rows*(imageH+labelH),channels:3,background:'#faf9f6'}}).composite(composites).jpeg({quality:92}).toFile(out);
    sheets[batch]=out;
  }
  return sheets;
}

async function main() {
  await mkdir(OUT,{recursive:true});
  const manifestBuffer=await readFile(MANIFEST_PATH); const manifest=JSON.parse(manifestBuffer);
  const sceneBuffer=await readFile(manifest.approved_scene_manifest);
  const integrity={
    aggregate_manifest_path:MANIFEST_PATH, aggregate_manifest_sha256:sha256(manifestBuffer), expected_aggregate_manifest_sha256:EXPECTED_MANIFEST_SHA256,
    aggregate_manifest_hash_pass:sha256(manifestBuffer)===EXPECTED_MANIFEST_SHA256,
    approved_scene_manifest_path:manifest.approved_scene_manifest, approved_scene_manifest_sha256:sha256(sceneBuffer), expected_approved_scene_manifest_sha256:EXPECTED_SCENE_SHA256,
    approved_scene_manifest_hash_pass:sha256(sceneBuffer)===EXPECTED_SCENE_SHA256,
  };
  if (!integrity.aggregate_manifest_hash_pass || !integrity.approved_scene_manifest_hash_pass || manifest.assets.length!==67) throw new Error(`manifest integrity failed: ${JSON.stringify(integrity)}`);
  const records=[];
  for (const asset of manifest.assets) {
    const buffer=await readFile(asset.output_path); const meta=await sharp(buffer).metadata(); const actualHash=sha256(buffer);
    records.push({
      asset_id:asset.asset_id, original_asset_id:asset.original_asset_id, batch:batchOf(asset), output_path:asset.output_path,
      specific_physical_scene:asset.specific_physical_scene, single_mechanism:asset.single_mechanism,
      expected_sha256:asset.output_sha256, actual_sha256:actualHash, hash_pass:actualHash===asset.output_sha256,
      expected_bytes:asset.bytes, actual_bytes:buffer.length, bytes_pass:buffer.length===asset.bytes,
      expected_dimensions:asset.verified_dimensions, actual_dimensions:{width:meta.width,height:meta.height},
      dimensions_pass:meta.width===asset.verified_dimensions.width&&meta.height===asset.verified_dimensions.height,
      metrics:await imageMetrics(asset.output_path),
    });
  }
  if (records.some((r)=>!r.hash_pass||!r.bytes_pass||!r.dimensions_pass)) throw new Error('one or more output integrity checks failed');
  const workerDefault=await createWorker('eng'); const workerSparse=await createWorker('eng');
  await workerSparse.setParameters({tessedit_pageseg_mode:'11'});
  for (let i=0;i<records.length;i++) { process.stderr.write(`OCR ${i+1}/67 ${records[i].asset_id}\n`); records[i].ocr=await ocr(workerDefault,workerSparse,records[i].output_path); }
  await workerDefault.terminate(); await workerSparse.terminate();
  const contactSheets=await makeSheets(records);
  const report={schema_version:'1.0.0',task_id:'t_2b35afb3',generated_at:new Date().toISOString(),scope_count:67,integrity,
    summary:{hash_pass:records.filter((r)=>r.hash_pass).length,dimensions_pass:records.filter((r)=>r.dimensions_pass).length,negative_space_proxy_pass:records.filter((r)=>r.metrics.negative_space_proxy.threshold_pass_45_percent).length,ocr_strong_flagged:records.filter((r)=>r.ocr.strong_tokens.length).length},
    contact_sheets:contactSheets,assets:records};
  const out=path.join(OUT,'machine-qa.json'); await writeFile(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({report:out,summary:report.summary,contact_sheets:contactSheets},null,2));
}
main().catch((error)=>{console.error(error);process.exit(1)});
