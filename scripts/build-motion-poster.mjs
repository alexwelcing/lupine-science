#!/usr/bin/env node
// Build the typographic poster frame for an article film.
//
// Usage:
//   node scripts/build-motion-poster.mjs --slug a-field-not-a-neural-net
//   node scripts/build-motion-poster.mjs --all
//
// The poster is drawn from the manifest title and description rather than grabbed
// from a video frame, so poster OCR never trips on small chart labels or citation
// footnotes. It is a standalone script because the poster depends only on the
// manifest: regenerating one should not require re-rendering a film, and the
// published artifact should be reproducible from committed code rather than from
// a command someone typed once.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');

// 1280x720 at quality 78 with 4:2:0 chroma.
//
// This matches the poster format already published across the video library, and
// it is a perf-budget requirement rather than a taste call. Rendering these at
// 1920x1080 with 4:4:4 chroma (ImageMagick's default for a generated caption)
// produced 115-144 KB posters instead of 18-37 KB, and /videos/ loads every
// poster on the page: cold transfer went 792 KB -> 1851 KB against a 1024 KB
// budget, failing `npm run verify`. Flat text on a flat background needs neither
// the resolution nor the chroma fidelity.
const POSTER_WIDTH = 1280;
const POSTER_HEIGHT = 720;
const CAPTION_WIDTH = 1067;   // same 0.833 x 0.464 proportions the library uses
const CAPTION_HEIGHT = 334;
const POSTER_QUALITY = '78';

// Sanitize subscripts/dashes/slashes that OCR tends to hallucinate.
function sanitize(s) {
  return String(s)
    .replace(/₂/g, '2')
    .replace(/–/g, '-')
    .replace(/\//g, ' ')
    .replace(/[”“]/g, '"')
    .replace(/[‘’]/g, "'");
}

export function buildPoster(slug, { log = console.log } = {}) {
  const manifestPath = path.join(MANIFEST_DIR, `${slug}.json`);
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifest not found: ${manifestPath}`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const outPoster = path.join(VIDEOS_DIR, `${slug}-poster.jpg`);
  const posterText = sanitize(`${manifest.title}\n\n${manifest.description}`);

  const r = spawnSync('convert', [
    '-size', `${CAPTION_WIDTH}x${CAPTION_HEIGHT}`,
    '-background', '#faf9f6',
    '-fill', '#161d1d',
    '-font', path.join(ROOT, 'public', 'fonts', 'proof-unicode.ttf'),
    '-gravity', 'center',
    `caption:${posterText}`,
    '-extent', `${POSTER_WIDTH}x${POSTER_HEIGHT}`,
    '-gravity', 'center',
    '-quality', POSTER_QUALITY,
    '-sampling-factor', '4:2:0',
    '-strip',
    '-interlace', 'Plane',
    outPoster,
  ], { encoding: 'utf8', cwd: ROOT });
  if (r.status !== 0) throw new Error(`convert failed for ${slug}: ${r.stderr || r.stdout}`);

  const bytes = fs.statSync(outPoster).size;
  log(`[${slug}] Wrote ${outPoster} (${(bytes / 1024).toFixed(1)} KB)`);
  return { outPoster, bytes };
}

function main() {
  const argv = process.argv.slice(2);
  const slugIdx = argv.indexOf('--slug');
  const slugs = argv.includes('--all')
    ? fs.readdirSync(MANIFEST_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort()
    : slugIdx >= 0 ? [argv[slugIdx + 1]] : [];

  if (slugs.length === 0) {
    console.error('Usage: --slug <slug> | --all');
    process.exit(1);
  }
  let total = 0;
  for (const slug of slugs) total += buildPoster(slug).bytes;
  console.log(`${slugs.length} poster(s), ${(total / 1024).toFixed(1)} KB total`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
