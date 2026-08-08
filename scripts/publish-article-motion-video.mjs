#!/usr/bin/env node
// Publish one article video: TTS voiceover -> motion video -> poster + VTT.
//
// Usage:
//   node scripts/publish-article-motion-video.mjs --slug a-field-not-a-neural-net
//
// Reads the existing captions at public/videos/<slug>.vtt, synthesizes a new
// voice track with FAL Orpheus TTS, builds a motion video from the manifest in
// data/video-motion/<slug>.json, and writes the final assets to public/videos/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { fal } from '@fal-ai/client';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');
const VOICE_DIR = path.join(ROOT, 'media', 'projects', 'voice-tracks');

const OVERLAP = 0.6;

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...options });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  return r;
}

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

function durationOf(file) {
  const r = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  return Number(r.stdout.trim());
}

function loadFalKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  const keyFile = path.join(ROOT, '.keys', 'fal-key');
  if (fs.existsSync(keyFile)) {
    return fs.readFileSync(keyFile, 'utf8').trim();
  }
  return undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf('--slug');
  const slug = slugIdx >= 0 ? args[slugIdx + 1] : undefined;
  const voiceIdx = args.indexOf('--voice');
  const voice = voiceIdx >= 0 ? args[voiceIdx + 1] : 'dan';
  const posterAtIdx = args.indexOf('--poster-at');
  const posterAt = posterAtIdx >= 0 ? args[posterAtIdx + 1] : '00:00:10.000';

  if (!slug) {
    console.error('Usage: --slug <slug> [--voice dan] [--poster-at 00:00:10.000]');
    process.exit(1);
  }

  const falKey = loadFalKey();
  if (!falKey) {
    console.error('Set FAL_KEY or create .keys/fal-key');
    process.exit(1);
  }
  process.env.FAL_KEY = falKey;

  const vttPath = path.join(VIDEOS_DIR, `${slug}.vtt`);
  const manifestPath = path.join(MANIFEST_DIR, `${slug}.json`);
  const outVideo = path.join(VIDEOS_DIR, `${slug}.mp4`);
  const outPoster = path.join(VIDEOS_DIR, `${slug}-poster.jpg`);
  const outVtt = path.join(VIDEOS_DIR, `${slug}.vtt`);

  if (!fs.existsSync(vttPath)) {
    console.error(`VTT not found: ${vttPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const cues = parseVtt(fs.readFileSync(vttPath, 'utf8'));
  const text = cues.join('\n\n');
  if (!text) {
    console.error('No narration text found.');
    process.exit(1);
  }

  fs.mkdirSync(VOICE_DIR, { recursive: true });
  const wavPath = path.join(VOICE_DIR, `${slug}-voice-${voice}.wav`);
  const normPath = path.join(VOICE_DIR, `${slug}-voice-${voice}-norm.m4a`);

  console.log(`[${slug}] Synthesizing ${text.length} chars with voice “${voice}”...`);
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

  // Normalize loudness to broadcast spec. Do NOT time-stretch here.
  //
  // This previously carried `atempo=0.5` with the note "Orpheus reads faster
  // than the old narration; slow it 0.5x to land in the 60-120 s target
  // window". That solved a DURATION problem with a SPEED control, applied
  // unconditionally to every film. Films with short scripts were stretched
  // until narration crawled: methane-and-refrigerants ended up at 21 wpm
  // (63 words over 176 s) against a normal 140-160 wpm, and ten published
  // films measured 21-66 wpm.
  //
  // It was invisible to every release check because atempo preserves pitch,
  // the stretch happens before muxing so audio/video durations still match
  // within 0.03 s, loudnorm runs immediately after so loudness is in band,
  // and a continuous music bed means silencedetect never fires. Only speech
  // RATE exposes it — now enforced by scripts/audio-release-gate.mjs.
  //
  // Duration is reconciled the correct way round a few lines below, where
  // scene durations are updated to match the narration length. That is the
  // right direction and makes any stretch here redundant.
  //
  // The true-peak target is -2.0 dBTP, not the -1.5 used previously, because
  // this track is AAC-encoded TWICE: once here, and again when
  // build-article-motion-video.mjs muxes it (`-c:a aac`). Each lossy pass
  // reconstructs a waveform that overshoots the peak it was normalized to, so
  // a -1.5 dBTP target lands somewhere in -1.5..-0.8 dBTP in the finished MP4
  // — straddling the gate's -1.0 dBTP ceiling. Measured on the repaired
  // library: at TP=-1.5 the ten films landed -1.45..-0.82 dBTP and
  // critical-minerals-pfas FAILED the ceiling at -0.82 while
  // cement-concrete cleared it by only 0.09 dB. At TP=-2.0 every film clears
  // by at least 0.5 dB and integrated loudness is unchanged at about -16 LUFS,
  // so the headroom costs nothing that the loudness band cares about.
  run('ffmpeg', [
    '-y', '-i', wavPath,
    '-af', 'loudnorm=I=-16:TP=-2.0:LRA=7',
    '-c:a', 'aac', '-ar', '44100', '-ac', '1', '-b:a', '128k',
    normPath,
  ]);
  const audioDuration = durationOf(normPath);
  console.log(`[${slug}] Normalized voice track: ${audioDuration.toFixed(2)}s`);

  // Update manifest scene durations to match the narration length.
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const scenes = manifest.scenes || [];
  if (scenes.length === 0) {
    console.error('Manifest has no scenes.');
    process.exit(1);
  }
  const uniform = (audioDuration + (scenes.length - 1) * OVERLAP) / scenes.length;
  for (const scene of scenes) scene.duration = Number(uniform.toFixed(3));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[${slug}] Set ${scenes.length} scenes to ${uniform.toFixed(2)}s each`);

  // Render motion video with the new voice.
  run('node', [
    'scripts/build-article-motion-video.mjs',
    '--slug', slug,
    '--audio', normPath,
    '--out', outVideo,
  ]);
  console.log(`[${slug}] Rendered ${outVideo}`);

  // Generate VTT and poster.
  run('node', ['scripts/generate-motion-vtt.mjs', '--slug', slug]);
  console.log(`[${slug}] Wrote ${outVtt}`);

  // Generate a clean, typographic poster from the manifest title/description
  // so poster OCR never trips on small chart labels or citation footnotes.
  // Sanitize subscripts/dashes/slashes that OCR tends to hallucinate.
  const sanitize = (s) => s
    .replace(/₂/g, '2')
    .replace(/–/g, '-')
    .replace(/\//g, ' ')
    .replace(/[”“]/g, '"')
    .replace(/[‘’]/g, "'");
  const posterText = sanitize(`${manifest.title}\n\n${manifest.description}`);
  run('convert', [
    '-size', '1600x500',
    '-background', '#faf9f6',
    '-fill', '#161d1d',
    '-font', path.join(ROOT, 'public', 'fonts', 'proof-unicode.ttf'),
    '-gravity', 'center',
    `caption:${posterText}`,
    '-extent', '1920x1080',
    '-gravity', 'center',
    outPoster,
  ]);
  console.log(`[${slug}] Wrote ${outPoster}`);

  // A rendered file is not releasable until the exact MP4 and narration
  // timeline pass the same fail-closed audio policy used by CI certification.
  const audioGateDir = path.join(ROOT, 'media', 'projects', 'article-videos', slug, 'audio-gate');
  const audioGateJson = path.join(audioGateDir, 'audio-gate.json');
  const audioGateSummary = path.join(audioGateDir, 'audio-gate.md');
  run('node', [
    'scripts/audio-release-gate.mjs',
    '--file', outVideo,
    '--vtt', outVtt,
    '--output', audioGateJson,
    '--summary', audioGateSummary,
  ]);
  console.log(`[${slug}] Audio release gate PASS: ${audioGateJson}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
