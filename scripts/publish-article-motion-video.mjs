#!/usr/bin/env node
// Publish one article video: TTS voiceover -> motion video -> poster + VTT.
//
// Usage:
//   node scripts/publish-article-motion-video.mjs --slug a-field-not-a-neural-net
//   LUPINE_TTS_PROVIDER=fal node scripts/publish-article-motion-video.mjs --slug ...
//   node scripts/publish-article-motion-video.mjs --slug ... --tts-provider minimax
//   node scripts/publish-article-motion-video.mjs --slug ... --reuse-narration
//
// Reads the narration script from data/narration-scripts/<slug>.json, synthesizes
// it paragraph by paragraph through the selected TTS provider (default MiniMax;
// see scripts/lib/tts-provider.mjs), VERIFIES every chunk and the assembled track
// against the script's word count, builds a motion video from the manifest in
// data/video-motion/<slug>.json, and writes the final assets to public/videos/.
//
// Three things changed here, all of them the same bug from different angles:
//
//   1. The script no longer comes from public/videos/<slug>.vtt. That file is an
//      OUTPUT of this pipeline (generate-motion-vtt.mjs rewrites it at the end),
//      so reading the input from it created a loop in which a caption step ate
//      the narration script. It did: the prose survives only in git history at
//      commit 4641d96. See scripts/recover-narration-scripts.mjs.
//
//   2. The provider is no longer hard-coded to FAL Orpheus. One locked account
//      ("Exhausted balance") took the entire narration pipeline offline.
//
//   3. Nothing is accepted on faith. Every synthesized track is measured against
//      the duration its word count predicts and rejected below ~85%. That check
//      is exactly what was missing while ten films published with 29-67% of
//      their script and one with ~25 s of hallucinated speech.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  synthesizeNarration, writeNarrationVtt, cachedNarrationMatches,
} from './lib/synthesize-narration.mjs';
import { probeDuration, verifyFilm } from './lib/verify-narration.mjs';
import { normalizeLoudness } from './lib/audio-normalize.mjs';
import { buildPoster } from './build-motion-poster.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');
const VOICE_DIR = path.join(ROOT, 'media', 'projects', 'voice-tracks');
const SCRIPT_DIR = path.join(ROOT, 'data', 'narration-scripts');

const OVERLAP = 0.6;

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...options });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  return r;
}

// NOTE: this script used to parse public/videos/<slug>.vtt to obtain its own
// narration input. That is gone deliberately — see the header comment. The
// script source is data/narration-scripts/<slug>.json, which nothing overwrites.

function durationOf(file) {
  return probeDuration(file);
}

/**
 * Load the narration script. The ONLY accepted source is
 * data/narration-scripts/<slug>.json, which no other step writes.
 */
function loadNarrationScript(slug) {
  const scriptPath = path.join(SCRIPT_DIR, `${slug}.json`);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(
      `Narration script not found: ${path.relative(ROOT, scriptPath)}. `
      + `Recover it with: node scripts/recover-narration-scripts.mjs --slug ${slug}`,
    );
  }
  const doc = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  const paragraphs = (doc.paragraphs || []).map((p) => String(p).trim()).filter(Boolean);
  if (paragraphs.length === 0) throw new Error(`Narration script has no paragraphs: ${scriptPath}`);
  return { paragraphs, source: doc.source || scriptPath };
}

async function main() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf('--slug');
  const slug = slugIdx >= 0 ? args[slugIdx + 1] : undefined;
  const voiceIdx = args.indexOf('--voice');
  const voice = voiceIdx >= 0 ? args[voiceIdx + 1] : undefined;
  const providerIdx = args.indexOf('--tts-provider');
  const providerName = providerIdx >= 0 ? args[providerIdx + 1] : undefined;
  const reuse = args.includes('--reuse-narration');

  if (!slug) {
    console.error('Usage: --slug <slug> [--tts-provider minimax|fal] [--voice <id>] [--reuse-narration]');
    process.exit(1);
  }

  const manifestPath = path.join(MANIFEST_DIR, `${slug}.json`);
  const outVideo = path.join(VIDEOS_DIR, `${slug}.mp4`);
  const outVtt = path.join(VIDEOS_DIR, `${slug}.vtt`);

  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const { paragraphs, source } = loadNarrationScript(slug);
  console.log(`[${slug}] Narration script source: ${source}`);

  fs.mkdirSync(VOICE_DIR, { recursive: true });
  const wavPath = path.join(VOICE_DIR, `${slug}-narration.wav`);
  // PCM, not m4a: the muxer does the single AAC encode. See normalizeLoudness.
  const normPath = path.join(VOICE_DIR, `${slug}-narration-norm.wav`);
  const workDir = path.join(ROOT, 'media', 'projects', 'article-videos', slug, 'narration-chunks');
  const narrationJson = path.join(ROOT, 'media', 'projects', 'article-videos', slug, 'narration.json');

  // Synthesize + VERIFY. This throws with the measured numbers if any cue or the
  // assembled track fails its length check, so a truncated or hallucinated
  // narration can never reach the renderer.
  //
  // `--reuse-narration` re-renders from the cached narration instead of
  // re-synthesizing, for when something downstream of the voice changed (a
  // loudness target, an encoder setting) and the narration itself has not. It
  // still VERIFIES the cached track against the current script before using it,
  // so reuse cannot smuggle in an unverified or stale-script narration — the
  // check is the same one a fresh synthesis passes, not a bypass of it.
  let narration;
  const cached = reuse && fs.existsSync(wavPath) && fs.existsSync(narrationJson)
    ? JSON.parse(fs.readFileSync(narrationJson, 'utf8'))
    : null;
  if (cached) {
    const script = paragraphs.join(' ');
    const match = cachedNarrationMatches(cached, paragraphs);
    if (!match.ok) {
      console.error(
        `[${slug}] Cached narration is unusable — ${match.reason}. `
        + `Re-run without --reuse-narration.`,
      );
      process.exit(1);
    }
    const gapTotal = cached.gapSeconds * (cached.cues.length - 1);
    const check = verifyFilm({
      label: `${slug} cached narration`,
      text: script,
      audioPath: wavPath,
      speechSeconds: probeDuration(wavPath) - gapTotal,
    });
    narration = cached;
    console.log(`[${slug}] Reusing cached narration: ${check.words} words, `
      + `${(check.lengthRatio * 100).toFixed(1)}% of expected length, `
      + `${((60 * check.words) / check.speechSeconds).toFixed(1)} wpm — VERIFIED`);
  } else {
    narration = await synthesizeNarration({
      slug,
      paragraphs,
      providerName,
      voice,
      workDir,
      outPath: wavPath,
    });
  }
  narration.scriptSource = source;
  fs.mkdirSync(path.dirname(narrationJson), { recursive: true });
  fs.writeFileSync(narrationJson, JSON.stringify(narration, null, 2) + '\n');

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
  // Normalization is TWO-PASS and the true-peak target is -2.0 dBTP.
  //
  // Two-pass because single-pass loudnorm normalizes dynamically and does not
  // deliver the peak it was asked for — nor the same peak twice. Two renders of
  // this film measured -1.85 and -0.55 dBTP from identical settings; one passed
  // the gate and one failed it. That is the mechanism behind flaky
  // `true-peak-ceiling` results. See scripts/lib/audio-normalize.mjs.
  //
  // -2.0 dBTP rather than -1.5 because the muxer re-encodes to AAC and a lossy
  // pass overshoots the peak it was normalized to, so -1.5 lands -1.5..-0.8 dBTP
  // in the finished MP4 — straddling the gate's -1.0 dBTP ceiling. (PR #59 reached
  // the -2.0 target independently; two-pass normalization is what makes it hold.)
  //
  // The normalized track stays PCM so the muxer's AAC encode is the ONLY lossy
  // pass. Encoding AAC here as well stacked two overshoots and left just 0.1 dB
  // of margin under the ceiling.
  const loudness = normalizeLoudness({ inPath: wavPath, outPath: normPath });
  narration.loudness = loudness;
  fs.writeFileSync(narrationJson, JSON.stringify(narration, null, 2) + '\n');
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

  // Write captions from the VERIFIED narration — not from scene titles.
  //
  // scripts/generate-motion-vtt.mjs used to run here. It writes one cue per
  // scene containing that scene's TITLE, and flags itself as "a pragmatic
  // first-pass caption; for final publication it should be aligned to the actual
  // narration". It never was. The result was published as a `<track ... default>`
  // element, which build-articles.mjs marks default, so the site displayed
  // scene headlines while the narrator read entirely different prose — and it
  // destroyed the narration script in the process, because the publisher read
  // its input from the same file this step overwrites.
  //
  // These cues instead carry the exact text that was spoken, timed by the
  // measured duration of each synthesized paragraph. Text and timing both come
  // from audio that passed verification, so the captions cannot describe
  // narration that was not delivered.
  const videoDuration = durationOf(outVideo);
  const cues = narration.cues.map((c) => ({
    text: c.text,
    start: Math.min(c.start, videoDuration),
    end: Math.min(c.end, videoDuration),
  })).filter((c) => c.end > c.start);
  const cueCount = writeNarrationVtt({
    cues,
    vttPath: outVtt,
    note: `Narration transcript. Text is the script synthesized by ${narration.provider} `
      + `(${narration.model}, voice ${narration.voice}); each cue was synthesized as its own `
      + `audio file and is timed by that file's measured duration. Verified at `
      + `${(narration.lengthRatio * 100).toFixed(1)}% of expected length, ${narration.measuredWpm} wpm `
      + `(median cue ${narration.medianChunkWpm} wpm). Script source: ${source}`,
  });
  console.log(`[${slug}] Wrote ${outVtt} (${cueCount} narration cues)`);

  // Poster: see scripts/build-motion-poster.mjs. Kept out of this script so a
  // poster can be regenerated without re-rendering the film.
  buildPoster(slug);

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
