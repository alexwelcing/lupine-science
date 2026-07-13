#!/usr/bin/env node
/**
 * Migrate old HyperFrames-pipeline article videos to the FAL Adam-voice pipeline
 * using existing article images as scene visuals.
 *
 * Usage:
 *   FAL_KEY=... node migrate-old-videos.mjs
 */
import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..');
const PUBLIC = join(ROOT, 'public');
const PUBLIC_VIDEOS = join(PUBLIC, 'videos');
const ARTICLES = join(PUBLIC, 'articles');
const FAL_KEY = process.env.FAL_KEY;

const SLUGS = [
  'a-field-not-a-neural-net',
  'beyond-carbon-the-error-geometry-of-environmental-materials',
  'critical-minerals-pfas-and-the-remediation-imperative',
  'five-materials-for-5-to-12-gtco2-year',
  'investing-in-the-trust-layer',
  'methane-and-refrigerants-cutting-the-non-co2-climate-forcers',
  'the-02-percent-synthesis-problem',
];

const PROJECT_DIR_BY_SLUG = {
  'beyond-carbon-the-error-geometry-of-environmental-materials': 'beyond-carbon-error-geometry',
  'the-02-percent-synthesis-problem': 'prototype-01-the-02-percent-synthesis-problem',
};

function log(...args) {
  console.log('[migrate]', ...args);
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('close', (code) => {
      if (code !== 0) reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`));
      else resolve();
    });
  });
}

function runCapture(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => {
      if (code !== 0) reject(new Error(`${cmd} exited ${code}: ${err || out}`));
      else resolve(out.trim());
    });
  });
}

function parseTime(t) {
  const [h, m, s] = t.split(':');
  return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseFloat(s);
}

async function parseVttFile(path) {
  const raw = await readFile(path, 'utf8');
  const cues = [];
  const blocks = raw.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    const timingIdx = lines.findIndex(l => l.includes('-->'));
    if (timingIdx === -1) continue;
    const timing = lines[timingIdx];
    const text = lines.slice(timingIdx + 1).join(' ').trim();
    if (!text) continue;
    const m = timing.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (!m) continue;
    const start = parseTime(m[1]);
    const end = parseTime(m[2]);
    cues.push({ start, end, duration: end - start, text });
  }
  return cues;
}

function groupCues(cues, nGroups) {
  const total = cues.reduce((s, c) => s + c.duration, 0);
  const target = total / nGroups;
  const groups = [];
  let current = { cues: [], duration: 0, text: [] };
  for (const cue of cues) {
    current.cues.push(cue);
    current.duration += cue.duration;
    current.text.push(cue.text);
    if (groups.length < nGroups - 1 && current.duration >= target * 0.8) {
      groups.push(current);
      current = { cues: [], duration: 0, text: [] };
    }
  }
  if (current.cues.length) {
    if (groups.length < nGroups) {
      groups.push(current);
    } else {
      groups[groups.length - 1].cues.push(...current.cues);
      groups[groups.length - 1].duration += current.duration;
      groups[groups.length - 1].text.push(...current.text);
    }
  }
  return groups.map(g => ({
    duration: g.duration,
    narration: g.text.join(' ').replace(/\s+/g, ' ').trim(),
  }));
}

async function getAudioDuration(path) {
  const out = await runCapture('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ]);
  const d = parseFloat(out);
  if (!Number.isFinite(d) || d <= 0) throw new Error(`invalid audio duration ${out}`);
  return d;
}

async function findArticleImages(slug) {
  const dir = join(ARTICLES, slug, 'images');
  const files = await readdir(dir);
  return files
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .filter(f => !f.endsWith('-poster.jpg'))
    .sort();
}

async function convertImage(src, dest) {
  await run('ffmpeg', [
    '-y', '-i', src,
    '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
    dest,
  ]);
}

async function processSlug(slug) {
  log('──', slug, '──');
  const projectDirName = PROJECT_DIR_BY_SLUG[slug] || slug;
  const projectDir = join(__dirname, projectDirName);
  const assetsDir = join(projectDir, 'assets');
  const imagesDir = join(assetsDir, 'images');
  const rendersDir = join(projectDir, 'renders');
  const manifestPath = join(projectDir, 'manifest.yaml');
  const vttPath = join(PUBLIC_VIDEOS, `${slug}.vtt`);

  if (!existsSync(vttPath)) {
    throw new Error(`missing VTT ${vttPath}`);
  }

  // Ensure project directory exists (needed for five-materials)
  await mkdir(projectDir, { recursive: true });

  const cues = await parseVttFile(vttPath);
  if (!cues.length) throw new Error('no cues parsed');

  const articleImages = await findArticleImages(slug);
  if (!articleImages.length) throw new Error('no article images');
  const nGroups = Math.min(10, articleImages.length);
  const groups = groupCues(cues, nGroups);

  // Build manifest with old durations
  let start = 0;
  const scenes = groups.map((g, i) => {
    const scene = {
      id: `scene-${String(i + 1).padStart(2, '0')}`,
      start,
      duration: g.duration,
      narration: g.narration,
      visual: { type: 'image', prompt: 'local article image asset' },
    };
    start += g.duration;
    return scene;
  });

  const manifest = {
    slug,
    script: `public/videos/${slug}.vtt`,
    voice: {
      endpoint: 'fal-ai/elevenlabs/tts/turbo-v2.5',
      voice: 'Adam',
      speed: 1,
      seed: 42,
    },
    scenes,
  };

  await writeFile(manifestPath, yaml.dump(manifest, { lineWidth: -1 }));
  log('wrote manifest');

  // Generate TTS
  log('generating TTS');
  await run('node', [
    join(__dirname, 'scripts', 'fal-enrich.mjs'),
    '--manifest', manifestPath,
    '--only', 'tts',
    '--force',
  ], { env: { ...process.env, FAL_KEY } });

  const audioPath = join(assetsDir, 'audio', `${slug}-narration.mp3`);
  const audioDuration = await getAudioDuration(audioPath);
  log('audio duration', audioDuration.toFixed(2));

  // Redistribute durations to match audio
  const totalOld = scenes.reduce((s, sc) => s + sc.duration, 0);
  let cumulative = 0;
  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    sc.start = cumulative;
    if (i === scenes.length - 1) {
      sc.duration = Math.max(0.5, audioDuration - cumulative);
    } else {
      sc.duration = audioDuration * (sc.duration / totalOld);
    }
    cumulative += sc.duration;
  }
  await writeFile(manifestPath, yaml.dump(manifest, { lineWidth: -1 }));
  log('updated manifest durations');

  // Convert article images to assembly PNGs
  await mkdir(imagesDir, { recursive: true });
  for (let i = 0; i < scenes.length; i++) {
    const imgPath = join(ARTICLES, slug, 'images', articleImages[i]);
    const outPath = join(imagesDir, `${scenes[i].id}.png`);
    await convertImage(imgPath, outPath);
  }
  log('converted images');

  // Assemble
  await run('node', [
    join(__dirname, 'scripts', 'assemble-ffmpeg.mjs'),
    '--manifest', manifestPath,
    '--with-captions',
  ]);

  // Publish
  const mp4 = join(rendersDir, `${slug}-web-1080p.mp4`);
  const poster = join(rendersDir, `${slug}-poster.jpg`);
  const vttOut = join(rendersDir, `${slug}.vtt`);
  await copyFile(mp4, join(PUBLIC_VIDEOS, `${slug}.mp4`));
  await copyFile(poster, join(PUBLIC_VIDEOS, `${slug}-poster.jpg`));
  await copyFile(vttOut, join(PUBLIC_VIDEOS, `${slug}.vtt`));
  log('published');
}

async function main() {
  if (!FAL_KEY) {
    console.error('FAL_KEY not set');
    process.exit(1);
  }
  const slugs = process.argv[2] ? [process.argv[2]] : SLUGS;
  for (const slug of slugs) {
    try {
      await processSlug(slug);
    } catch (err) {
      console.error('[migrate] FAILED', slug, err.message);
      process.exitCode = 1;
    }
  }
  log('running final build/verify/lint/test...');
  await run('npm', ['run', 'build'], { cwd: ROOT });
  await run('npm', ['run', 'verify'], { cwd: ROOT });
  await run('npm', ['run', 'lint'], { cwd: ROOT });
  await run('npm', ['test'], { cwd: ROOT });
  log('migration complete');
}

main().catch((e) => { console.error(e); process.exit(1); });
