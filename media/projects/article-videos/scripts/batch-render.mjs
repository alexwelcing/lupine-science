#!/usr/bin/env node
/**
 * Batch render all article videos that have a manifest.yaml but no published MP4.
 *
 * 1. Generates FAL assets (TTS + images) for each episode.
 * 2. Assembles a 1080p MP4 with ffmpeg.
 * 3. Copies MP4, poster, and VTT to public/videos/.
 * 4. Runs npm build/verify/lint/test at the end.
 */
import { spawn } from 'node:child_process';
import { readdir, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const readdirAsync = promisify(readdir);
const existsAsync = (p) => Promise.resolve(existsSync(p));
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..', '..');
const PUBLIC_VIDEOS = join(ROOT, 'public', 'videos');
const FAL_KEY = process.env.FAL_KEY;

function log(...args) {
  console.log('[batch]', ...args);
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

async function main() {
  if (!FAL_KEY) {
    console.error('FAL_KEY not set');
    process.exit(1);
  }

  const base = join(__dirname, '..');
  const entries = await readdirAsync(base, { withFileTypes: true });
  const slugs = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const slug = e.name;
    if (['scripts','docs','assets','components','compositions','reviews','prototype-fal-test','article-video-prototype','hyperframes-ref','node_modules'].includes(slug)) continue;
    const manifest = join(base, slug, 'manifest.yaml');
    const published = join(PUBLIC_VIDEOS, `${slug}.mp4`);
    if (existsSync(manifest) && !existsSync(published)) {
      slugs.push(slug);
    }
  }

  log('rendering', slugs.length, 'videos:', slugs.join(', '));

  for (const slug of slugs) {
    log('──', slug, '──');
    try {
      await run('node', ['scripts/fal-enrich.mjs', '--manifest', `${slug}/manifest.yaml`], { cwd: base, env: { ...process.env, FAL_KEY } });
      await run('node', ['scripts/assemble-ffmpeg.mjs', '--manifest', `${slug}/manifest.yaml`, '--with-captions'], { cwd: base });
      const renders = join(base, slug, 'renders');
      const mp4 = join(renders, `${slug}-web-1080p.mp4`);
      const poster = join(renders, `${slug}-poster.jpg`);
      const vtt = join(renders, `${slug}.vtt`);
      await run('cp', [mp4, join(PUBLIC_VIDEOS, `${slug}.mp4`)]);
      await run('cp', [poster, join(PUBLIC_VIDEOS, `${slug}-poster.jpg`)]);
      await run('cp', [vtt, join(PUBLIC_VIDEOS, `${slug}.vtt`)]);
      log('published', slug);
    } catch (err) {
      console.error('[batch] FAILED', slug, err.message);
    }
  }

  log('running final build/verify/lint/test...');
  await run('npm', ['run', 'build'], { cwd: ROOT });
  await run('npm', ['run', 'verify'], { cwd: ROOT });
  await run('npm', ['run', 'lint'], { cwd: ROOT });
  await run('npm', ['test'], { cwd: ROOT });
  log('batch complete');
}

main().catch((e) => { console.error(e); process.exit(1); });
