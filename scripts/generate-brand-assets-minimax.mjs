#!/usr/bin/env node
// Generate on-brand editorial artwork with MiniMax Image-01 via FAL.
// Brand constraints (docs/brand-book.md §2): paper #faf9f6, indigo #3d4db3 as
// the ONLY color accent, ink near-black; NO text/letters in images, no people,
// no flowers, no dark neon, no glowing-circuit tropes, no stock 3D renders.
// Usage: FAL_KEY=... node scripts/generate-brand-assets-minimax.mjs [--only key1,key2]

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const outDirArg = process.argv.find((arg) => arg.startsWith('--out-dir='))?.slice('--out-dir='.length);
const OUT_DIR = outDirArg ? path.resolve(outDirArg) : path.join(ROOT, 'public', 'brand-assets', 'minimax');

function minimaxToken() {
  const auth = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.hermes', 'auth.json'), 'utf8'));
  const pool = auth?.credential_pool?.['minimax-oauth'];
  if (!pool?.length || !pool[0].access_token) throw new Error('no minimax-oauth credential in ~/.hermes/auth.json');
  return pool[0].access_token;
}

const STYLE = [
  'editorial scientific illustration for a research monograph cover',
  'warm off-white paper background (#faf9f6), subtle paper grain',
  'a single deep indigo (#3d4db3) as the only color accent, with near-black ink line work',
  'minimal, precise, quiet, high-end print quality, fine line art with soft luminous glow only in the indigo elements',
  'ABSOLUTELY NO text, no letters, no numbers, no typography, no words, no captions, no labels anywhere in the image',
  'no people, no faces, no flowers, no plants, no dark or black background, no neon, no circuit boards, no glossy 3D render, no chrome',
].join(', ');

const ASSETS = [
  {
    key: 'shape-of-wrongness-hero',
    aspect: '16:9',
    prompt:
      'hundreds of faint thin ink arrows scattered chaotically across warm paper, gradually aligning and merging into ONE luminous indigo ribbon flowing horizontally through the center of the frame, like a manifold emerging from noise, gentle indigo glow along the ribbon only, vast empty paper space above and below',
  },
  {
    key: 'interface-underbinding',
    aspect: '16:9',
    prompt:
      'a large organic molecule drawn as a ball-and-stick model: many small hollow ink circles joined by thin straight ink sticks forming an intricate branching molecular skeleton, floating above a flat square grid of small indigo dots representing a metal crystal surface, a clearly visible empty gap between the molecule and the surface grid, only two or three short dashed indigo lines attempting and failing to bridge the gap, conveying weak missing attraction, sparse precise line art on warm paper',
  },
  {
    key: 'receipts-chain',
    aspect: '16:9',
    prompt:
      'a horizontal chain of five small crystalline mineral blocks drawn in fine ink lines on warm paper, each block linked to the next by a single thin indigo thread forming an unbroken chain, the final block emitting a small indigo check-like glow, conveying immutable linked evidence, lots of negative space',
  },
  {
    key: 'bits-to-atoms',
    aspect: '16:9',
    prompt:
      'on the left side a cloud of tiny dissolving square pixels in faint ink, transforming smoothly across the frame into a precise crystalline atomic lattice drawn in indigo on the right, the transition zone marked by a soft indigo gradient, conveying computation becoming matter, warm paper background, elegant minimal science editorial',
  },
];

function dimensions(file) {
  const identified = spawnSync('identify', ['-format', '%w %h', file], { encoding: 'utf8' });
  if (identified.status !== 0) return null;
  const [width, height] = identified.stdout.trim().split(/\s+/).map(Number);
  return Number.isFinite(width) && Number.isFinite(height) ? { width, height } : null;
}

function resizeToTarget(file, width, height) {
  if (!width || !height) return { resized: false, error: null };
  const extension = path.extname(file);
  const temporary = `${file.slice(0, -extension.length)}.resize-tmp${extension}`;
  const resized = spawnSync(
    'magick',
    [file, '-resize', `${width}x${height}^`, '-gravity', 'center', '-extent', `${width}x${height}`, temporary],
    { encoding: 'utf8' },
  );
  if (resized.status !== 0) {
    fs.rmSync(temporary, { force: true });
    return { resized: false, error: (resized.stderr || resized.stdout || 'ImageMagick failed').trim() };
  }
  fs.renameSync(temporary, file);
  return { resized: true, error: null };
}

async function generate(asset) {
  const exactPrompt = asset.exact_prompt ?? `${asset.prompt}, ${STYLE}`;
  const response = await fetch('https://api.minimax.io/v1/image_generation', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'image-01',
      prompt: exactPrompt,
      aspect_ratio: asset.aspect,
      n: 1,
    }),
  });
  if (!response.ok) throw new Error(`image_generation HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const result = await response.json();
  if (result?.base_resp?.status_code !== 0) {
    throw new Error(`image_generation failed for ${asset.key}: ${JSON.stringify(result?.base_resp).slice(0, 300)}`);
  }
  const url = result?.data?.image_urls?.[0];
  if (!url) throw new Error(`no image returned for ${asset.key}`);
  const download = await fetch(url);
  if (!download.ok) throw new Error(`download failed for ${asset.key}: HTTP ${download.status}`);
  const buffer = Buffer.from(await download.arrayBuffer());
  const contentType = download.headers.get('content-type') ?? '';
  const extension = contentType.includes('png') ? '.png' : '.jpg';
  const file = path.join(OUT_DIR, `${asset.key}${extension}`);
  fs.writeFileSync(file, buffer);
  const sourceDimensions = dimensions(file);
  const postprocess = resizeToTarget(file, asset.target_width, asset.target_height);
  const outputDimensions = dimensions(file);
  const finalBytes = fs.statSync(file).size;
  return {
    asset_id: asset.asset_id,
    original_asset_id: asset.original_asset_id ?? asset.asset_id,
    key: asset.key,
    original_path: asset.original_path,
    replacement_path: file,
    output_path: file,
    bytes: finalBytes,
    exact_prompt: exactPrompt,
    spec_hash: asset.spec_hash,
    qa_reason: asset.qa_reason,
    qa_sources: asset.qa_sources,
    attempt: asset.attempt,
    source_dimensions: sourceDimensions,
    target_dimensions:
      asset.target_width && asset.target_height ? { width: asset.target_width, height: asset.target_height } : null,
    output_dimensions: outputDimensions,
    postprocessed_to_target: postprocess.resized,
    postprocess_error: postprocess.error,
  };
}

const TOKEN = minimaxToken();

async function main() {
  const specArg = process.argv.find((arg) => arg.startsWith('--spec='))?.slice('--spec='.length);
  const assets = specArg ? JSON.parse(fs.readFileSync(specArg, 'utf8')) : ASSETS;
  const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length).split(',');
  const selected = only ? assets.filter((a) => only.includes(a.key)) : assets;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  const existingManifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : { model: 'minimax/image-01 (api.minimax.io)', assets: [] };
  const manifest = Array.isArray(existingManifest.assets) ? existingManifest.assets : [];
  const results = [];
  const saveManifest = () =>
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ ...existingManifest, updated_at: new Date().toISOString(), assets: manifest }, null, 2) + '\n',
    );

  for (const asset of selected) {
    const originalAssetId = asset.original_asset_id ?? asset.asset_id;
    if (asset.attempt != null) {
      const priorAttempt = manifest.find(
        (record) => record.original_asset_id === originalAssetId && record.attempt === asset.attempt,
      );
      if (priorAttempt) {
        process.stderr.write(`skipping ${originalAssetId}: attempt ${asset.attempt} already recorded\n`);
        results.push(priorAttempt);
        continue;
      }

      const pendingRecord = {
        asset_id: asset.asset_id,
        original_asset_id: originalAssetId,
        key: asset.key,
        original_path: asset.original_path,
        replacement_path: null,
        output_path: null,
        bytes: 0,
        exact_prompt: asset.exact_prompt ?? `${asset.prompt}, ${STYLE}`,
        spec_hash: asset.spec_hash,
        qa_reason: asset.qa_reason,
        qa_sources: asset.qa_sources,
        attempt: asset.attempt,
        status: 'attempt_started',
        started_at: new Date().toISOString(),
      };
      manifest.push(pendingRecord);
      saveManifest();
      process.stderr.write(`generating ${asset.key}…\n`);
      try {
        const generated = await generate(asset);
        Object.assign(pendingRecord, generated, { status: 'generated', completed_at: new Date().toISOString() });
        process.stderr.write(`  wrote ${generated.output_path} (${generated.bytes} bytes)\n`);
      } catch (error) {
        Object.assign(pendingRecord, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completed_at: new Date().toISOString(),
        });
        process.stderr.write(`  FAILED ${asset.key}: ${pendingRecord.error}\n`);
      }
      saveManifest();
      results.push(pendingRecord);
      continue;
    }

    process.stderr.write(`generating ${asset.key}…\n`);
    const record = await generate(asset);
    manifest.push(record);
    saveManifest();
    results.push(record);
    process.stderr.write(`  wrote ${record.output_path} (${record.bytes} bytes)\n`);
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
