#!/usr/bin/env node
/**
 * Regenerate article images that contain model-hallucinated gibberish text.
 *
 * Uses FAL flux/dev with strict "no text" constraints and resizes outputs to
 * the site's 1280×720 JPG format.
 *
 * Usage:
 *   FAL_KEY=... node regenerate-gibberish-images.mjs
 */
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..');
const PUBLIC = join(ROOT, 'public');
const FAL_KEY = process.env.FAL_KEY;
const ENDPOINT = 'fal-ai/flux/dev';

const NO_TEXT = 'absolutely no text, no words, no letters, no labels, no numbers, no typography, no logos, no brand marks, no signs, no captions';

function log(...args) {
  console.log('[regen]', ...args);
}

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
    path: 'articles/beyond-carbon-the-error-geometry-of-environmental-materials/hero.jpg',
    prompt: `Minimalist editorial hero for a climate science article. Soft translucent waves of indigo (#3d4db3) and pale amber light flow across a warm cream paper background (#faf9f6), with tiny fragmented mineral crystals and water droplets suspended in the current. Clean abstract vector style. ${NO_TEXT}. 16:9 landscape, serene, precise, publication quality.`,
    seed: 101,
  },
  {
    path: 'articles/beyond-carbon-the-error-geometry-of-environmental-materials/images/beyond-carbon-the-error-geometry-of-environmental-materials-01-seven-domains-one-error.jpg',
    prompt: `Editorial infographic illustration with a soft indigo (#3d4db3) atomic lattice at the center radiating into seven clean abstract environmental icons: a water droplet, a wisp of air, a methane flame, a refrigerant molecule, a mineral crystal, a PFAS fluorine chain, and a cement kiln. Warm cream paper background (#faf9f6). Icons connected by thin indigo lines, no words or labels. ${NO_TEXT}. 16:9 landscape.`,
    seed: 102,
  },
  {
    path: 'articles/the-order-is-right-the-size-is-wrong/hero.jpg',
    prompt: `Abstract scientific hero illustration. A delicate lattice of hexagonal molecular cages floats in soft indigo (#3d4db3) against a warm cream paper background (#faf9f6). Some cages are large, some small, suggesting scale and order. Fine golden lines highlight one correctly-sized cavity. Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape, publication quality.`,
    seed: 103,
  },
  {
    path: 'articles/the-order-is-right-the-size-is-wrong/hero.webp',
    prompt: `Abstract scientific hero illustration. A delicate lattice of hexagonal molecular cages floats in soft indigo (#3d4db3) against a warm cream paper background (#faf9f6). Some cages are large, some small, suggesting scale and order. Fine golden lines highlight one correctly-sized cavity. Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape, publication quality.`,
    seed: 103,
  },
  {
    path: 'articles/the-order-is-right-the-size-is-wrong/thumb.jpg',
    prompt: `Small square abstract icon of a perfectly-sized molecular cage highlighted in indigo (#3d4db3) among larger and smaller cages, warm cream background (#faf9f6). Clean vector style. ${NO_TEXT}. 1:1 square.`,
    seed: 104,
  },
  {
    path: 'articles/the-order-is-right-the-size-is-wrong/thumb.webp',
    prompt: `Small square abstract icon of a perfectly-sized molecular cage highlighted in indigo (#3d4db3) among larger and smaller cages, warm cream background (#faf9f6). Clean vector style. ${NO_TEXT}. 1:1 square.`,
    seed: 104,
  },
  {
    path: 'articles/the-02-percent-synthesis-problem/images/the-02-percent-synthesis-problem-08-commercial-endpoints.jpg',
    prompt: `Editorial illustration of a materials discovery pipeline ending in industrial commercial endpoints. Left: stylized crystals and data streams flow through a verification layer in indigo (#3d4db3). Right: a clean modern battery cell, a solar panel segment, and a catalyst wafer. Warm cream paper background (#faf9f6). Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 105,
  },
  {
    path: 'articles/five-materials-for-5-to-12-gtco2-year/images/five-materials-for-5-to-12-gtco2-year-08-partner-ecosystem-map.jpg',
    prompt: `Clean abstract world map in muted taupe and cream tones with subtle indigo (#3d4db3) connection arcs linking a few major continental regions. Small teal and amber dots mark partner locations. Warm cream paper background (#faf9f6). Minimalist infographic style, no country names or labels. ${NO_TEXT}. 16:9 landscape.`,
    seed: 106,
  },
  {
    path: 'articles/from-fantasy-frameworks-to-makeable-materials/hero.jpg',
    prompt: `Abstract editorial hero showing the transformation from abstract mathematical curves into a solid, makeable molecular structure. Left: faint ghostly equations and frameworks dissolve into particles. Right: a clear indigo (#3d4db3) molecular model emerges. Warm cream paper background (#faf9f6). Clean vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 107,
  },
  {
    path: 'articles/from-predicted-crystal-to-commercial-cell/images/from-predicted-crystal-to-commercial-cell-10-crystal-to-cell.jpg',
    prompt: `Editorial illustration of a materials pipeline from predicted crystal to commercial battery cell. Left: a translucent indigo (#3d4db3) crystal lattice. Center: flowing data streams pass through a verification layer. Right: a clean cylindrical battery cell. Warm cream paper background (#faf9f6). Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 108,
  },
  {
    path: 'articles/lupi-hfc-refrigerant-research-payloads/hero.jpg',
    prompt: `Abstract hero illustration for a molecular viewer article. A single clean indigo (#3d4db3) molecular structure floats in the center of a dark near-black background with subtle network nodes and faint teal highlights. Clean minimalist scientific style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 109,
  },
  {
    path: 'articles/lupi-hfc-refrigerant-research-payloads/hfc-r125.jpg',
    prompt: `Clean 3D molecular model of an HFC refrigerant molecule with carbon, fluorine, and hydrogen atoms shown as smooth spheres in indigo (#3d4db3), teal, and white. Dark near-black background. Scientific visualization style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 110,
  },
  {
    path: 'articles/water-and-air-correcting-the-molecules-we-drink-and-breathe/images/water-and-air-correcting-the-molecules-we-drink-and-breathe-10-platform-thesis.jpg',
    prompt: `Editorial illustration of a water and air purification platform. A central indigo (#3d4db3) filter membrane separates blue water droplets on the left from clean air particles on the right. Small molecular structures are caught in the membrane. Warm cream paper background (#faf9f6). Clean vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 111,
  },
  {
    path: 'articles/investing-in-the-trust-layer/images/investing-in-the-trust-layer-10-trust-loop-cta.jpg',
    prompt: `Abstract editorial illustration of a closed-loop materials trust pipeline. Left: stylized crystals and flowing data streams in indigo (#3d4db3). Center: a translucent verification layer filters the flow. Right: a clean modern synthesis lab bench. A glowing feedback arc loops back to the start. Warm cream paper background (#faf9f6). Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 112,
  },
  {
    path: 'articles/the-trust-layer/hero.jpg',
    prompt: `Abstract hero illustration for a trust and verification article. A central indigo (#3d4db3) geometric node connects to multiple verification checkpoints through glowing lines, forming a network of trust. Warm cream paper background (#faf9f6). Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 113,
  },
  {
    path: 'articles/the-trust-layer/hero.webp',
    prompt: `Abstract hero illustration for a trust and verification article. A central indigo (#3d4db3) geometric node connects to multiple verification checkpoints through glowing lines, forming a network of trust. Warm cream paper background (#faf9f6). Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 113,
  },
  {
    path: 'articles/the-trust-layer/thumb.jpg',
    prompt: `Small square abstract icon of a trust network: a central indigo (#3d4db3) node connected to three verification checkpoints, warm cream background (#faf9f6). Clean vector style. ${NO_TEXT}. 1:1 square.`,
    seed: 114,
  },
  {
    path: 'articles/the-trust-layer/thumb.webp',
    prompt: `Small square abstract icon of a trust network: a central indigo (#3d4db3) node connected to three verification checkpoints, warm cream background (#faf9f6). Clean vector style. ${NO_TEXT}. 1:1 square.`,
    seed: 114,
  },
  {
    path: 'articles/rhizo-non-co2-climate-forcers-lean/hero.jpg',
    prompt: `Abstract hero illustration for a non-CO2 climate forcers article. A stylized spherical catalyst structure in indigo (#3d4db3) is surrounded by radiating orange and amber molecular fragments, suggesting methane and refrigerant breakdown. Warm cream paper background (#faf9f6). Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 115,
  },
  {
    path: 'articles/a-field-not-a-neural-net/images/a-field-not-a-neural-net-08-climate-targets-map.jpg',
    prompt: `Abstract map-like composition showing climate-critical material targets. Muted taupe continental shapes on warm cream paper (#faf9f6) with scattered indigo (#3d4db3) and amber dots connected by faint arcs. Suggests a global strategy map without country names or labels. Clean minimalist vector style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 116,
  },
  {
    path: 'articles/why-lupine-science/hero.jpg',
    prompt: `Elegant abstract hero illustration for a climate materials science publication. A single delicate plant seedling in soft sage green grows from a bed of indigo (#3d4db3) molecular particles, with warm cream paper background (#faf9f6). Suggests growth, science, and the future. Clean minimalist editorial style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 117,
  },
  {
    path: 'articles/why-lupine-science/hero.webp',
    prompt: `Elegant abstract hero illustration for a climate materials science publication. A single delicate plant seedling in soft sage green grows from a bed of indigo (#3d4db3) molecular particles, with warm cream paper background (#faf9f6). Suggests growth, science, and the future. Clean minimalist editorial style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 117,
  },
  {
    path: 'articles/why-lupine-science/thumb.jpg',
    prompt: `Small square abstract icon of a sage green seedling growing from indigo (#3d4db3) particles, warm cream background (#faf9f6). Clean vector style. ${NO_TEXT}. 1:1 square.`,
    seed: 118,
  },
  {
    path: 'articles/why-lupine-science/thumb.webp',
    prompt: `Small square abstract icon of a sage green seedling growing from indigo (#3d4db3) particles, warm cream background (#faf9f6). Clean vector style. ${NO_TEXT}. 1:1 square.`,
    seed: 118,
  },
  {
    path: 'articles/why-lupi/hero.jpg',
    prompt: `Abstract hero illustration for a molecular viewer tool. A clean indigo (#3d4db3) molecular structure sits inside a stylized browser window frame, with soft teal light and network nodes around it. Dark near-black background. Clean minimalist scientific style. ${NO_TEXT}. 16:9 landscape.`,
    seed: 119,
  },
];

async function main() {
  if (!FAL_KEY) {
    console.error('FAL_KEY not set');
    process.exit(1);
  }

  log(`regenerating ${REPLACEMENTS.length} images`);
  for (const item of REPLACEMENTS) {
    const outPath = join(PUBLIC, item.path);
    try {
      log('generating', item.path);
      const url = await falImage(item.prompt, item.seed);
      await mkdir(dirname(outPath), { recursive: true });
      await downloadAndConvert(url, outPath);
      log('saved', item.path);
    } catch (err) {
      console.error('[regen] FAILED', item.path, err.message);
      process.exitCode = 1;
    }
  }
  log('done');
}

main().catch((e) => { console.error(e); process.exit(1); });
