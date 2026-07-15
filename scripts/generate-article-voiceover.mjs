#!/usr/bin/env node
// Generate a new narrated voiceover for an article video using FAL Orpheus TTS.
//
// Usage:
//   FAL_KEY=... node scripts/generate-article-voiceover.mjs --slug the-02-percent-synthesis-problem
//
// Reads the existing captions at public/videos/<slug>.vtt, concatenates the cue
// payloads, synthesizes a single audio file, and writes an AAC track ready for
// muxing into the motion video.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { fal } from '@fal-ai/client';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');
const OUT_DIR = path.join(ROOT, 'media', 'projects', 'voice-tracks');

function parseVtt(text) {
  const lines = text.split(/\r?\n/);
  const cues = [];
  let i = 0;
  if (lines[i]?.trim().toLowerCase() === 'webvtt') i++;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || /^NOTE|^\d+$/.test(line)) {
      i++;
      continue;
    }
    const arrowMatch = line.match(/^(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (arrowMatch) {
      i++;
      let payload = '';
      while (i < lines.length && lines[i].trim() !== '') {
        payload += (payload ? ' ' : '') + lines[i].trim();
        i++;
      }
      cues.push(payload);
      continue;
    }
    i++;
  }
  return cues;
}

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...options });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  return r;
}

async function main() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf('--slug');
  const slug = slugIdx >= 0 ? args[slugIdx + 1] : undefined;
  const voiceIdx = args.indexOf('--voice');
  const voice = voiceIdx >= 0 ? args[voiceIdx + 1] : 'dan';

  if (!slug) {
    console.error('Usage: --slug <slug> [--voice dan|leo|...]');
    process.exit(1);
  }
  if (!process.env.FAL_KEY) {
    console.error('Set FAL_KEY environment variable.');
    process.exit(1);
  }

  const vttPath = path.join(VIDEOS_DIR, `${slug}.vtt`);
  if (!fs.existsSync(vttPath)) {
    console.error(`VTT not found: ${vttPath}`);
    process.exit(1);
  }

  const cues = parseVtt(fs.readFileSync(vttPath, 'utf8'));
  if (cues.length === 0) {
    console.error('No cues found in VTT.');
    process.exit(1);
  }

  const text = cues.join('\n\n');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const wavPath = path.join(OUT_DIR, `${slug}-voice-${voice}.wav`);
  const aacPath = path.join(OUT_DIR, `${slug}-voice-${voice}.m4a`);

  console.log(`Synthesizing ${text.length} characters with voice “${voice}”...`);
  const result = await fal.subscribe('fal-ai/orpheus-tts', {
    input: { text, voice, temperature: 0.6, repetition_penalty: 1.2 },
    logs: true,
  });
  const url = result.data?.audio?.url;
  if (!url) {
    console.error('No audio URL:', JSON.stringify(result.data, null, 2));
    process.exit(1);
  }

  const wavRes = await fetch(url);
  fs.writeFileSync(wavPath, Buffer.from(await wavRes.arrayBuffer()));

  run('ffmpeg', [
    '-y', '-i', wavPath,
    '-c:a', 'aac', '-ar', '44100', '-ac', '1', '-b:a', '128k',
    aacPath,
  ]);

  const probe = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    aacPath,
  ]);
  console.log(`Voice track: ${aacPath}`);
  console.log(`Duration: ${Number(probe.stdout.trim()).toFixed(2)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
