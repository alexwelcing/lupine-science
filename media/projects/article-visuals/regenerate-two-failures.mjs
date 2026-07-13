#!/usr/bin/env node
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..');
const PUBLIC = join(ROOT, 'public');
const FAL_KEY = process.env.FAL_KEY;
const ENDPOINT = 'fal-ai/flux/dev';

const NO_TEXT = 'absolutely no text, no words, no letters, no labels, no numbers, no typography, no logos, no brand marks, no signs, no captions, no icon labels, no legends, no glyphs, no letterforms, no equation symbols';

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => {
      if (code !== 0) reject(new Error(`${cmd} exited ${code}: ${err || out}`));
      else resolve({ stdout: out, stderr: err });
    });
  });
}

async function falImage(prompt, seed = 42) {
  const res = await fetch(`https://fal.run/${ENDPOINT}`, {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_16_9',
      num_images: 1,
      seed,
      output_format: 'png',
      safety_tolerance: '6',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`FAL error: ${res.status} ${JSON.stringify(data)}`);
  const url = data.images?.[0]?.url;
  if (!url) throw new Error('FAL response missing image URL');
  return url;
}

async function downloadAndConvert(url, outPath) {
  const tmpPng = `${outPath}.tmp.png`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${url}`);
  await writeFile(tmpPng, Buffer.from(await res.arrayBuffer()));
  await run('ffmpeg', [
    '-y', '-i', tmpPng,
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
    '-q:v', '2',
    outPath,
  ]);
  await unlink(tmpPng);
}

const REPLACEMENTS = [
  {
    path: 'articles/beyond-carbon-the-error-geometry-of-environmental-materials/images/beyond-carbon-the-error-geometry-of-environmental-materials-01-seven-domains-one-error.jpg',
    prompt: `Minimal clean editorial infographic. A single soft indigo (#3d4db3) circle at the center with seven plain abstract icons evenly around it: a simple water droplet, a small cloud, a flame, a factory silhouette, a mineral crystal, a chain of dots, and a leaf. Thin indigo connection lines only. Each icon must have absolutely no label, no words, no letters, no numbers beneath or beside it. Warm cream paper background (#faf9f6). Flat vector illustration, generous whitespace, publication quality. ${NO_TEXT}. 16:9 landscape.`,
    seed: 202,
  },
  {
    path: 'articles/from-fantasy-frameworks-to-makeable-materials/hero.jpg',
    prompt: `Abstract editorial hero illustration split horizontally. Left side: faint, ghostly abstract mathematical curves and grid lines dissolving into soft particles. Right side: a clean, solid indigo (#3d4db3) molecular structure emerging from the particles. The transition must contain no equations, no letters, no glyphs, no symbols that resemble text. Warm cream paper background (#faf9f6). Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape, publication quality.`,
    seed: 207,
  },
];

async function main() {
  if (!FAL_KEY) { console.error('FAL_KEY not set'); process.exit(1); }
  for (const item of REPLACEMENTS) {
    const outPath = join(PUBLIC, item.path);
    console.log('[regen]', item.path);
    const url = await falImage(item.prompt, item.seed);
    await mkdir(dirname(outPath), { recursive: true });
    await downloadAndConvert(url, outPath);
    console.log('[regen] saved', item.path);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
