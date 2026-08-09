#!/usr/bin/env node
// Generate a narrated voiceover for an article video, through any TTS provider.
//
// Usage:
//   node scripts/generate-article-voiceover.mjs --slug the-02-percent-synthesis-problem
//   LUPINE_TTS_PROVIDER=fal node scripts/generate-article-voiceover.mjs --slug ...
//   node scripts/generate-article-voiceover.mjs --slug ... --tts-provider minimax
//
// This is the standalone voiceover step; publish-article-motion-video.mjs does
// the same thing as part of a full render. Both go through
// scripts/lib/tts-provider.mjs (provider selection, default MiniMax) and
// scripts/lib/synthesize-narration.mjs (per-paragraph synthesis + verification),
// so neither can produce a track the other would reject.
//
// It reads the script from data/narration-scripts/<slug>.json — NOT from
// public/videos/<slug>.vtt, which is an output of the caption step and was
// silently overwritten with scene titles, destroying the narration prose.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { synthesizeNarration } from './lib/synthesize-narration.mjs';
import { probeDuration } from './lib/verify-narration.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_DIR = path.join(ROOT, 'data', 'narration-scripts');
const OUT_DIR = path.join(ROOT, 'media', 'projects', 'voice-tracks');

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
  const voice = voiceIdx >= 0 ? args[voiceIdx + 1] : undefined;
  const providerIdx = args.indexOf('--tts-provider');
  const providerName = providerIdx >= 0 ? args[providerIdx + 1] : undefined;

  if (!slug) {
    console.error('Usage: --slug <slug> [--tts-provider minimax|fal] [--voice <id>]');
    process.exit(1);
  }

  const scriptPath = path.join(SCRIPT_DIR, `${slug}.json`);
  if (!fs.existsSync(scriptPath)) {
    console.error(
      `Narration script not found: ${path.relative(ROOT, scriptPath)}\n`
      + `Recover it with: node scripts/recover-narration-scripts.mjs --slug ${slug}`,
    );
    process.exit(1);
  }
  const doc = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  const paragraphs = (doc.paragraphs || []).map((p) => String(p).trim()).filter(Boolean);
  if (paragraphs.length === 0) {
    console.error(`Narration script has no paragraphs: ${scriptPath}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const wavPath = path.join(OUT_DIR, `${slug}-narration.wav`);
  const aacPath = path.join(OUT_DIR, `${slug}-narration.m4a`);
  const workDir = path.join(ROOT, 'media', 'projects', 'article-videos', slug, 'narration-chunks');

  // Throws with the measured numbers if any paragraph or the whole track falls
  // short of the duration its word count predicts.
  const narration = await synthesizeNarration({
    slug, paragraphs, providerName, voice, workDir, outPath: wavPath,
  });

  run('ffmpeg', [
    '-y', '-i', wavPath,
    '-c:a', 'aac', '-ar', '44100', '-ac', '1', '-b:a', '128k',
    aacPath,
  ]);

  console.log(`Voice track: ${aacPath}`);
  console.log(`Duration: ${probeDuration(aacPath).toFixed(2)}s`);
  console.log(`Provider: ${narration.provider} (${narration.model}), voice ${narration.voice}`);
  console.log(`Verified: ${narration.words} words at ${narration.measuredWpm} wpm, `
    + `${(narration.lengthRatio * 100).toFixed(1)}% of expected length`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
