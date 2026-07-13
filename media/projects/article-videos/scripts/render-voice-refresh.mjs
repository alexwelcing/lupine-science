#!/usr/bin/env node
/**
 * Re-render article videos after a voice change.
 *
 * For each episode with a manifest.yaml:
 *   1. Regenerates TTS audio with the current manifest voice (--force).
 *   2. Measures the resulting audio duration.
 *   3. Scales every scene duration proportionally so the visual timeline
 *      matches the new narration timing.
 *   4. Re-assembles the 1080p MP4, poster, and WebVTT captions.
 *   5. Copies the results to public/videos/.
 *
 * Usage:
 *   FAL_KEY=... node scripts/render-voice-refresh.mjs
 *   FAL_KEY=... node scripts/render-voice-refresh.mjs --slug why-lupi
 */
import { readFile, writeFile, copyFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..', '..');
const PUBLIC_VIDEOS = join(ROOT, 'public', 'videos');
const FAL_KEY = process.env.FAL_KEY;

const EXCLUDED = new Set([
  'scripts', 'docs', 'assets', 'components', 'compositions', 'reviews',
  'prototype-fal-test', 'article-video-prototype', 'prototype-01-the-02-percent-synthesis-problem',
  'beyond-carbon-error-geometry', 'node_modules', 'hyperframes-ref',
]);

function log(...args) {
  console.log('[refresh]', ...args);
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

async function getAudioDuration(path) {
  const { stdout } = await runCapture('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ]);
  const dur = parseFloat(stdout.trim());
  if (!Number.isFinite(dur) || dur <= 0) throw new Error(`invalid audio duration: ${stdout}`);
  return dur;
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
      else resolve({ stdout: out, stderr: err });
    });
  });
}

function proportionalDurations(scenes, targetDuration) {
  const texts = scenes.map((s) => String(s.narration || '').trim());
  const weights = texts.map((t) => Math.max(t.length, 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const scaled = scenes.map((s, i) => {
    const share = weights[i] / totalWeight;
    return Number((targetDuration * share).toFixed(3));
  });
  // Fix rounding drift by adding the remainder to the last scene.
  const sum = scaled.reduce((a, b) => a + b, 0);
  const drift = Number((targetDuration - sum).toFixed(3));
  scaled[scaled.length - 1] = Number((scaled[scaled.length - 1] + drift).toFixed(3));
  return scaled;
}

async function refreshSlug(slug) {
  const base = join(__dirname, '..');
  const manifestPath = join(base, slug, 'manifest.yaml');
  if (!existsSync(manifestPath)) {
    log('skip', slug, '(no manifest.yaml)');
    return;
  }

  log('──', slug, '──');

  // 1. Regenerate TTS.
  await run('node', [
    'scripts/fal-enrich.mjs',
    '--manifest', `${slug}/manifest.yaml`,
    '--only', 'tts',
    '--force',
  ], { cwd: base, env: { ...process.env, FAL_KEY } });

  // 2. Measure audio.
  const audioPath = join(base, slug, 'assets', 'audio', `${slug}-narration.mp3`);
  const audioDuration = await getAudioDuration(audioPath);
  log('audio duration', audioDuration.toFixed(2), 's');

  // 3. Adjust scene durations to match audio timing.
  const raw = await readFile(manifestPath, 'utf8');
  const manifest = yaml.load(raw);
  const newDurations = proportionalDurations(manifest.scenes, audioDuration);
  for (let i = 0; i < manifest.scenes.length; i++) {
    manifest.scenes[i].duration = newDurations[i];
    if (i === 0) {
      manifest.scenes[i].start = 0;
    } else {
      manifest.scenes[i].start = Number((manifest.scenes[i - 1].start + manifest.scenes[i - 1].duration).toFixed(3));
    }
  }
  await writeFile(manifestPath, yaml.dump(manifest, { lineWidth: -1, noRefs: true }));
  log('updated scene durations, total', manifest.scenes[manifest.scenes.length - 1].start + manifest.scenes[manifest.scenes.length - 1].duration, 's');

  // 4. Assemble video.
  await run('node', [
    'scripts/assemble-ffmpeg.mjs',
    '--manifest', `${slug}/manifest.yaml`,
    '--with-captions',
  ], { cwd: base });

  // 5. Publish to public/videos.
  const rendersDir = join(base, slug, 'renders');
  await mkdir(PUBLIC_VIDEOS, { recursive: true });
  await copyFile(join(rendersDir, `${slug}-web-1080p.mp4`), join(PUBLIC_VIDEOS, `${slug}.mp4`));
  await copyFile(join(rendersDir, `${slug}-poster.jpg`), join(PUBLIC_VIDEOS, `${slug}-poster.jpg`));
  await copyFile(join(rendersDir, `${slug}.vtt`), join(PUBLIC_VIDEOS, `${slug}.vtt`));
  log('published', slug);
}

async function main() {
  if (!FAL_KEY) {
    console.error('FAL_KEY environment variable is not set');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const slugArgIdx = args.indexOf('--slug');
  const requestedSlug = slugArgIdx !== -1 ? args[slugArgIdx + 1] : null;

  const base = join(__dirname, '..');
  const entries = await readdir(base, { withFileTypes: true });
  const slugs = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const slug = e.name;
    if (EXCLUDED.has(slug)) continue;
    if (requestedSlug && slug !== requestedSlug) continue;
    const manifest = join(base, slug, 'manifest.yaml');
    if (existsSync(manifest)) slugs.push(slug);
  }

  log('refreshing', slugs.length, 'videos:', slugs.join(', '));

  for (const slug of slugs) {
    try {
      await refreshSlug(slug);
    } catch (err) {
      console.error('[refresh] FAILED', slug, err.message);
      process.exitCode = 1;
    }
  }

  if (!requestedSlug) {
    log('running final build/verify/lint/test...');
    await run('npm', ['run', 'build'], { cwd: ROOT });
    await run('npm', ['run', 'verify'], { cwd: ROOT });
    await run('npm', ['run', 'lint'], { cwd: ROOT });
    await run('npm', ['test'], { cwd: ROOT });
  }

  log('refresh complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
