#!/usr/bin/env node
// Build a motion-rich article video from a manifest of static visuals.
//
// Usage:
//   node scripts/build-article-motion-video.mjs --slug the-02-percent-synthesis-problem
//   node scripts/build-article-motion-video.mjs --manifest data/video-motion/the-02-percent-synthesis-problem.json
//   node scripts/build-article-motion-video.mjs --slug ... --audio public/videos/the-02-percent-synthesis-problem.mp4 --out media/projects/video-motion/renders/the-02-percent-synthesis-problem-motion.mp4

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  WIDTH,
  HEIGHT,
  FPS,
  buildSceneFilter,
  buildConcatFilter,
} from './lib/motion-effects.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    cwd: ROOT,
    ...options,
  });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  }
  return r;
}

function loadManifest(slug) {
  const p = path.join(ROOT, 'data', 'video-motion', `${slug}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function resolveFont() {
  // ffmpeg drawtext requires TrueType/OpenType fonts; woff2 will not load.
  const candidates = [
    path.join(ROOT, 'public', 'fonts', 'proof-unicode.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

function buildVideo(manifest, outPath, audioPath) {
  const scenes = manifest.scenes || [];
  if (scenes.length === 0) throw new Error('manifest has no scenes');

  const fontFile = resolveFont();
  const sceneOutputs = [];
  const inputs = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = { ...scenes[i], fontFile };
    const imgPath = path.resolve(ROOT, scene.image);
    if (!fs.existsSync(imgPath)) throw new Error(`missing image: ${imgPath}`);
    inputs.push({ file: imgPath, index: i });
    sceneOutputs.push(buildSceneFilter(scene, i, scenes.length));
  }

  // Build filter_complex graph
  const sceneFilters = sceneOutputs.map((s) => s.filter).join(';');
  const concatFilter = buildConcatFilter(sceneOutputs);
  const filterComplex = [sceneFilters, concatFilter].filter(Boolean).join(';');

  const inputArgs = inputs.flatMap((i) => ['-loop', '1', '-i', i.file]);
  let finalFilterComplex = filterComplex;
  let mapVideo = '[outv]';
  let mapAudio;

  const outputArgs = [
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '26',
    '-maxrate', '1200k',
    '-bufsize', '2400k',
    '-r', String(FPS),
    '-pix_fmt', 'yuv420p',
    '-color_range', 'tv',
    '-colorspace', 'bt709',
    '-movflags', '+faststart',
  ];

  if (audioPath) {
    outputArgs.push('-shortest');
    inputArgs.push('-i', audioPath);
    finalFilterComplex = `${filterComplex};[${inputs.length}:a]anull[outa]`;
    mapAudio = '[outa]';
    outputArgs.push('-c:a', 'aac', '-ar', '44100', '-ac', '1', '-b:a', '128k');
  }

  outputArgs.unshift('-filter_complex', finalFilterComplex, '-map', mapVideo);
  if (mapAudio) outputArgs.push('-map', mapAudio);
  outputArgs.push('-y', outPath);

  const args = [...inputArgs, ...outputArgs];
  console.log(`Rendering ${scenes.length} scenes to ${outPath}...`);
  run('ffmpeg', args);
  console.log(`Wrote ${outPath}`);
}

function main() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf('--slug');
  const manifestIdx = args.indexOf('--manifest');
  const audioIdx = args.indexOf('--audio');
  const outIdx = args.indexOf('--out');

  const slug = slugIdx >= 0 ? args[slugIdx + 1] : undefined;
  const manifestPath = manifestIdx >= 0 ? args[manifestIdx + 1] : undefined;
  const audioPath = audioIdx >= 0 ? args[audioIdx + 1] : undefined;
  const outPath = outIdx >= 0
    ? args[outIdx + 1]
    : slug
      ? path.join(ROOT, 'media', 'projects', 'video-motion', 'renders', `${slug}-motion.mp4`)
      : undefined;

  if (!slug && !manifestPath) {
    console.error('Usage: --slug <slug> | --manifest <path> [--audio <mp4>] [--out <mp4>]');
    process.exit(1);
  }
  if (!outPath) {
    console.error('--out is required when using --manifest without --slug');
    process.exit(1);
  }

  const manifest = slug ? loadManifest(slug) : JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const audio = audioPath || (slug ? path.join(ROOT, 'public', 'videos', `${slug}.mp4`) : undefined);
  const useAudio = audio && fs.existsSync(audio) ? audio : undefined;

  buildVideo(manifest, outPath, useAudio);
}

main();
