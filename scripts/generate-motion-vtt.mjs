#!/usr/bin/env node
// Build a WebVTT caption track from a motion-video manifest.
// Each scene becomes one cue timed to its visual slot. This is a pragmatic
// first-pass caption; for final publication it should be aligned to the
// actual narration, either by speech-to-text or by hand.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');

const OVERLAP = 0.6; // must match transition duration in motion-effects.mjs

function pad(n) {
  return String(n).padStart(2, '0');
}

function toVttTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad(h)}:${pad(m)}:${s.toFixed(3).padStart(6, '0')}`;
}

function videoDuration(videoPath) {
  const r = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    videoPath,
  ], { encoding: 'utf8', cwd: ROOT });
  if (r.status !== 0) throw new Error(r.stderr);
  return Number(r.stdout.trim());
}

function main() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf('--slug');
  const slug = slugIdx >= 0 ? args[slugIdx + 1] : undefined;
  if (!slug) {
    console.error('Usage: --slug <slug>');
    process.exit(1);
  }

  const manifestPath = path.join(MANIFEST_DIR, `${slug}.json`);
  const videoPath = path.join(VIDEOS_DIR, `${slug}.mp4`);
  const vttPath = path.join(VIDEOS_DIR, `${slug}.vtt`);

  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const scenes = manifest.scenes || [];
  const duration = videoDuration(videoPath);

  const cues = [];
  let start = 0;
  for (let i = 0; i < scenes.length; i++) {
    const d = scenes[i].duration ?? 5;
    const nextStart = i < scenes.length - 1 ? start + d - OVERLAP : duration;
    const end = Math.min(duration, nextStart);
    const text = Array.isArray(scenes[i].text) ? scenes[i].text.join(' ') : (scenes[i].text || '');
    if (text) {
      cues.push({ start, end, text });
    }
    start = nextStart;
  }

  const lines = ['WEBVTT', ''];
  for (let i = 0; i < cues.length; i++) {
    lines.push(String(i + 1));
    lines.push(`${toVttTime(cues[i].start)} --> ${toVttTime(cues[i].end)}`);
    lines.push(cues[i].text);
    lines.push('');
  }

  fs.writeFileSync(vttPath, lines.join('\n'));
  console.log(`Wrote ${vttPath} (${cues.length} cues, ${duration.toFixed(2)}s)`);
}

main();
