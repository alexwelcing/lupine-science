#!/usr/bin/env node
/**
 * FAL enrichment driver for Lupine Science article videos.
 *
 * Reads an episode manifest, generates TTS audio and image assets via FAL,
 * downloads them locally, and writes a ledger for the assembly step.
 *
 * Usage:
 *   node scripts/fal-enrich.mjs --manifest <slug>/manifest.yaml
 *   node scripts/fal-enrich.mjs --manifest <slug>/manifest.yaml --only tts
 *   node scripts/fal-enrich.mjs --manifest <slug>/manifest.yaml --only images
 *   node scripts/fal-enrich.mjs --manifest <slug>/manifest.yaml --dry-run
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, 'fal-enrich-manifest.schema.json');
const FAL_KEY = process.env.FAL_KEY;
const FAL_BASE = 'https://fal.run';

function log(...args) {
  console.log('[fal-enrich]', ...args);
}

function fail(message) {
  console.error('[fal-enrich] ERROR:', message);
  process.exit(1);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(path) {
  const hash = createHash('sha256');
  hash.update(await readFile(path));
  return hash.digest('hex');
}

function parseArgs(argv) {
  const args = { dryRun: false, force: false, only: null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--manifest' || arg === '-m') {
      args.manifest = argv[++i];
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--only') {
      args.only = argv[++i];
      if (!['tts', 'images'].includes(args.only)) {
        fail(`--only must be "tts" or "images"; got "${args.only}"`);
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node scripts/fal-enrich.mjs --manifest <path> [options]

Options:
  --manifest, -m   Path to episode manifest YAML
  --dry-run        Print what would be generated, but do not call FAL
  --only tts       Generate only narration audio
  --only images    Generate only image assets
  --force          Overwrite existing assets
  --help, -h       Show this help
`);
      process.exit(0);
    }
  }
  if (!args.manifest) fail('--manifest is required');
  return args;
}

async function loadManifest(manifestPath) {
  const raw = await readFile(manifestPath, 'utf8');
  const manifest = yaml.load(raw);
  const schemaRaw = await readFile(SCHEMA_PATH, 'utf8');
  const schema = JSON.parse(schemaRaw);
  validateManifest(manifest, schema);
  return manifest;
}

function validateManifest(manifest, schema) {
  const errors = [];
  for (const key of schema.required || []) {
    if (!(key in manifest)) errors.push(`missing required field: ${key}`);
  }
  if (!Array.isArray(manifest.scenes)) {
    errors.push('scenes must be an array');
  } else {
    for (const scene of manifest.scenes) {
      if (!scene.id) errors.push('scene missing id');
      if (!scene.visual) errors.push(`scene ${scene.id || '?'} missing visual`);
    }
  }
  if (errors.length) fail(errors.join('; '));
}

async function falRun(endpointId, input) {
  const url = `${FAL_BASE}/${endpointId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`FAL run failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${url}`);
  await mkdir(dirname(dest), { recursive: true });
  await pipeline(res.body, createWriteStream(dest));
}

async function generateTts(manifest, assetsDir, options) {
  const { dryRun, force } = options;
  const endpoint = manifest.voice.endpoint;
  const voice = manifest.voice.voice;
  const speed = manifest.voice.speed ?? 1.0;
  const seed = manifest.voice.seed ?? null;
  const outDir = join(assetsDir, 'audio');
  const outPath = join(outDir, `${manifest.slug}-narration.mp3`);

  if (!force && (await fileExists(outPath))) {
    log('TTS already exists:', outPath);
    return { path: outPath, skipped: true };
  }

  // Concatenate narration in scene order with a breath between scenes.
  const text = manifest.scenes
    .map((s) => s.narration.trim())
    .filter(Boolean)
    .join('\n\n');

  if (dryRun) {
    log('[dry-run] would generate TTS:', outPath, `(${text.length} chars)`);
    return { path: outPath, dryRun: true };
  }

  log('Generating TTS via', endpoint, 'voice:', voice);
  const input = { text, voice, speed };
  if (seed !== null) input.seed = seed;
  const result = await falRun(endpoint, input);
  const audioUrl = result.audio?.url || result.output?.url || result.url;
  if (!audioUrl) throw new Error('FAL TTS response missing audio URL: ' + JSON.stringify(result));
  await downloadFile(audioUrl, outPath);
  const hash = await sha256File(outPath);
  log('TTS saved:', outPath, 'size:', (await readFile(outPath)).length, 'sha256:', hash.slice(0, 16));
  return {
    path: outPath,
    url: audioUrl,
    request_id: result.request_id,
    sha256: hash,
  };
}

async function generateImages(manifest, assetsDir, options) {
  const { dryRun, force } = options;
  const outDir = join(assetsDir, 'images');
  const results = [];

  for (const scene of manifest.scenes) {
    const visual = scene.visual;
    if (visual.type !== 'image') continue;

    const endpoint = visual.endpoint || 'fal-ai/flux/dev';
    const outPath = join(outDir, `${scene.id}.png`);

    if (!force && (await fileExists(outPath))) {
      log('Image already exists:', outPath);
      results.push({ scene: scene.id, path: outPath, skipped: true });
      continue;
    }

    if (dryRun) {
      log('[dry-run] would generate image:', outPath, 'prompt:', visual.prompt.slice(0, 80) + '...');
      results.push({ scene: scene.id, path: outPath, dryRun: true });
      continue;
    }

    log('Generating image for scene', scene.id, 'via', endpoint);
    const input = {
      prompt: visual.prompt,
      image_size: visual.size || 'landscape_16_9',
      num_images: 1,
      seed: visual.seed ?? 42,
      output_format: 'png',
    };
    const result = await falRun(endpoint, input);
    const imageUrl = result.images?.[0]?.url || result.image?.url || result.url;
    if (!imageUrl) throw new Error('FAL image response missing image URL: ' + JSON.stringify(result));
    await downloadFile(imageUrl, outPath);
    const hash = await sha256File(outPath);
    log('Image saved:', outPath, 'sha256:', hash.slice(0, 16));
    results.push({
      scene: scene.id,
      path: outPath,
      url: imageUrl,
      request_id: result.request_id,
      sha256: hash,
    });
  }

  return results;
}

async function writeLedger(assetsDir, manifest, ttsResult, imageResults) {
  const ledger = {
    slug: manifest.slug,
    generated_at: new Date().toISOString(),
    voice: manifest.voice,
    tts: ttsResult || null,
    images: imageResults || [],
  };
  const ledgerPath = join(assetsDir, 'ledger.json');
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
  log('Ledger written:', ledgerPath);
}

async function main() {
  if (!FAL_KEY) {
    fail('FAL_KEY environment variable is not set. Add it to ~/.hermes/profiles/<profile>/.env and source it.');
  }

  const args = parseArgs(process.argv);
  const manifestPath = resolve(args.manifest);
  const manifest = await loadManifest(manifestPath);
  const projectRoot = dirname(manifestPath);
  const assetsDir = join(projectRoot, 'assets');

  await mkdir(assetsDir, { recursive: true });

  let ttsResult = null;
  let imageResults = [];

  if (!args.only || args.only === 'tts') {
    ttsResult = await generateTts(manifest, assetsDir, { dryRun: args.dryRun, force: args.force });
  }

  if (!args.only || args.only === 'images') {
    imageResults = await generateImages(manifest, assetsDir, { dryRun: args.dryRun, force: args.force });
  }

  if (!args.dryRun) {
    await writeLedger(assetsDir, manifest, ttsResult, imageResults);
  }

  log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
