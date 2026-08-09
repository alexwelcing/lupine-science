// Synthesize a full article narration, one cue at a time, verifying as it goes.
//
// Why chunk at all
// ────────────────
// Not to avoid the truncation bug — MiniMax returned 97% of expected length on
// the exact 2051-character input that made Orpheus drop most of its script, so a
// single call would have been safe. Chunking earns its place for two other
// reasons:
//
//   1. Captions timed to the real audio, with no speech-to-text. Each cue is its
//      own file with its own measured duration, so the cue boundaries of the
//      finished track are known EXACTLY: the caption text is the script that was
//      spoken, and the timings come from the audio that was produced. This is
//      what makes it safe to write a VTT at all. Transcribing the old corrupt
//      audio would have published hallucinated babble into a `<track ... default>`
//      element that the site displays automatically.
//
//   2. Pause placement. The provider puts ~0.92 s of silence at sentence
//      boundaries. Inside a paragraph-length cue that is dead air under a caption,
//      which the release gate correctly fails. Cutting at sentences moves every
//      such pause to a cue boundary. See splitIntoCueTexts.
//
// Chunking does NOT buy much verification power, and it would be misleading to
// claim otherwise: at 8-30 words a duration model cannot distinguish brisk
// delivery from a small dropped clause. The load-bearing length check is at film
// scope. See the note at the top of verify-narration.mjs.
//
// The concatenated result is the narration; nothing is time-stretched.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  verifyChunk, verifyFilm, countWords, findRateOutliers, probeDuration,
  EXPECTED_WPM, MAX_CHUNK_WPM_RATIO_TO_MEDIAN,
} from './verify-narration.mjs';
import { resolveProvider, narratorVoice } from './tts-provider.mjs';
import { detectSilence } from './audio-normalize.mjs';
import { narrationDeadAir } from '../audio-release-gate.mjs';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';

// Silence inserted between cues.
//
// Sized against what the provider does on its own: reading a two-sentence
// paragraph in one call, MiniMax puts ~0.92 s between the sentences. Chunks carry
// ~0.15-0.20 s of their own edge padding, so a 0.30 s insert reconstructs a
// ~0.65 s sentence beat — slightly tighter than the provider's natural pause, and
// below the release gate's 0.75 s dead-air detection threshold, so the seam never
// registers as silence at all.
export const CUE_GAP_SECONDS = 0.3;

/**
 * Split a narration script into one cue per sentence.
 *
 * ONE CUE PER SENTENCE, EXACTLY. Both halves of that rule were learned the hard
 * way:
 *
 *  - Not larger. The provider puts a ~0.9 s pause at every sentence boundary.
 *    Inside a multi-sentence cue that is a long silence under a caption, which
 *    `no-dead-air-during-narration` correctly fails. An earlier version merged
 *    short sentences into their neighbours to avoid tiny cues; that reintroduced
 *    the very pause the split existed to remove, and failed a film on cue 9
 *    ("Then actually destroy them. That second step is brutal because...", 0.78 s
 *    of silence at the internal boundary). Short cues are the lesser problem —
 *    and for this script they are not a problem at all, because the punchy
 *    fragments ("Measure the error. Correct the physics. Prove the boundary.")
 *    are the rhetorical rhythm and read well one to a line.
 *
 *  - Not smaller, and not per paragraph either. The recovered scripts inherit
 *    their paragraph breaks from the ORIGINAL VTT cue boundaries, which cut
 *    mid-sentence: one paragraph ends "...can change a" and the next begins
 *    "predicted hopping rate 50-fold." Splitting each paragraph separately would
 *    hand the narrator a fragment and caption a fragment. So the paragraphs are
 *    joined back into continuous prose FIRST, and sentences are found in that.
 *
 * The boundary requires a following capital or digit, so decimals survive: "2.2
 * million" and "0.906" are not sentence ends.
 */
export function splitIntoCueTexts(paragraphs) {
  return String(Array.isArray(paragraphs) ? paragraphs.join(' ') : paragraphs)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=["“'‘(]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Is a cached narration record still usable for this script?
 *
 * Only if it was produced from THIS script by THIS cue splitter. A word-total
 * match is not sufficient: a track cut into different cues has different cue text
 * and different pause placement, so reusing it would publish captions that do not
 * match the audio — the original bug wearing a different hat. Comparing the cue
 * texts catches a changed script and changed splitting at once.
 */
export function cachedNarrationMatches(cached, paragraphs) {
  if (!cached || !Array.isArray(cached.cues)) {
    return { ok: false, reason: 'no cached narration record' };
  }
  const expected = splitIntoCueTexts(paragraphs);
  const cachedCues = cached.cues.map((c) => c.text);
  const words = countWords(paragraphs.join(' '));
  if (cached.words !== words) {
    return { ok: false, reason: `script changed: ${cached.words} words cached vs ${words} now` };
  }
  if (cachedCues.length !== expected.length) {
    return { ok: false, reason: `cue splitting changed: ${cachedCues.length} cues cached vs ${expected.length} now` };
  }
  const differs = cachedCues.findIndex((t, i) => t !== expected[i]);
  if (differs >= 0) {
    return { ok: false, reason: `cue ${differs + 1} text differs from the current script` };
  }
  return { ok: true, reason: `${words} words in ${expected.length} cues` };
}

function ff(args) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr || r.stdout}`);
}

/** Decode any container to a uniform PCM wav so chunks concat without re-encoding. */
function toPcm(inPath, outPath) {
  ff(['-y', '-i', inPath, '-c:a', 'pcm_s16le', '-ar', '44100', '-ac', '1', outPath]);
}

function silenceWav(seconds, outPath) {
  ff([
    '-y', '-f', 'lavfi', '-i', 'anullsrc=channel_layout=mono:sample_rate=44100',
    '-t', String(seconds), '-c:a', 'pcm_s16le', outPath,
  ]);
}

/**
 * Synthesize `paragraphs` into a single narration wav at `outPath`.
 *
 * Each cue is checked against physical bounds before it is kept, the assembled
 * track is checked against the full script, and the cue set is pre-flighted
 * against the release gate's dead-air rule. Returns the per-cue timings needed to
 * write a caption track that matches the audio.
 */
export async function synthesizeNarration({
  slug,
  paragraphs,
  providerName,
  voice,
  workDir,
  outPath,
  gapSeconds = CUE_GAP_SECONDS,
  wpm = EXPECTED_WPM,
  retries = 2,
  log = console.log,
}) {
  const provider = resolveProvider(providerName);
  const voiceId = narratorVoice(provider, voice);
  fs.mkdirSync(workDir, { recursive: true });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const script = paragraphs.join(' ');
  const cueTexts = splitIntoCueTexts(paragraphs);
  log(`[${slug}] provider=${provider.id} model=${provider.model} voice=${voiceId} — `
    + `${paragraphs.length} paragraphs -> ${cueTexts.length} cues, `
    + `${countWords(script)} words, ${script.length} chars`);

  const chunks = [];
  for (let i = 0; i < cueTexts.length; i++) {
    const text = cueTexts[i];
    const label = `${slug} cue ${i + 1}/${cueTexts.length}`;
    const raw = path.join(workDir, `chunk-${String(i + 1).padStart(2, '0')}.${provider.extension}`);
    const pcm = path.join(workDir, `chunk-${String(i + 1).padStart(2, '0')}.wav`);

    let measured;
    let lastError;
    // A retry is legitimate here: a provider that truncated once can return the
    // full cue on a second call. What is NOT legitimate is accepting the short
    // file, which is precisely what used to happen.
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      let meta;
      try {
        meta = await provider.synthesize({ text, voice: voiceId, outPath: raw });
        toPcm(raw, pcm);
        measured = verifyChunk({ label: `${label} (attempt ${attempt})`, text, audioPath: pcm, wpm });
        measured.providerMeta = meta;
        break;
      } catch (e) {
        lastError = e;
        measured = undefined;
        log(`[${slug}]   attempt ${attempt} rejected: ${e.message}`);
        if (attempt <= retries) await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (!measured) throw lastError;

    log(`[${slug}]   cue ${i + 1}: ${measured.words}w ${measured.actualSeconds.toFixed(2)}s `
      + `(${(measured.ratio * 100).toFixed(0)}% of expected, ${measured.measuredWpm} wpm)`);
    chunks.push({ index: i + 1, text, pcm, ...measured });
  }

  // Concatenate: chunk, gap, chunk, gap, ... chunk. Uniform PCM throughout, so
  // stream copy is exact and no chunk is resampled or re-encoded.
  const gapPath = path.join(workDir, 'gap.wav');
  silenceWav(gapSeconds, gapPath);
  const listPath = path.join(workDir, 'concat.txt');
  const entries = [];
  chunks.forEach((c, i) => {
    entries.push(`file '${c.pcm.replace(/'/g, "'\\''")}'`);
    if (i < chunks.length - 1) entries.push(`file '${gapPath.replace(/'/g, "'\\''")}'`);
  });
  fs.writeFileSync(listPath, entries.join('\n') + '\n');
  ff(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outPath]);

  // Verify the assembled track against the WHOLE script.
  //
  // The inserted cue gaps are silence WE added, so they are subtracted
  // before comparing against the expected reading time. Judging wall-clock
  // duration against a words-per-minute model would credit the track for its own
  // padding — the same class of mistake as trusting a provider's self-reported
  // length.
  const gapTotal = gapSeconds * (chunks.length - 1);
  const whole = verifyFilm({
    label: `${slug} assembled narration (${gapTotal.toFixed(2)}s of inserted gaps excluded)`,
    text: script,
    audioPath: outPath,
    speechSeconds: probeDuration(outPath) - gapTotal,
    wpm,
  });
  const speechSeconds = whole.speechSeconds;
  const speechRatio = whole.lengthRatio;

  // Cross-chunk consistency. One anomalously FAST chunk means words were counted
  // that were never spoken — the truncation signature, localised to the paragraph
  // that broke. This is sharper than the absolute floor because it is normalised
  // to this film's own read rate instead of a global wpm guess.
  const rate = findRateOutliers(chunks);
  if (rate.outliers.length > 0) {
    const detail = rate.outliers
      .map((c) => `cue ${c.index} at ${c.measuredWpm} wpm (${c.words} words in ${c.actualSeconds.toFixed(2)}s)`)
      .join('; ');
    throw new Error(
      `NARRATION INCONSISTENT — ${slug}: ${detail}. Film median is ${rate.median} wpm, `
      + `limit ${rate.limit} wpm (${MAX_CHUNK_WPM_RATIO_TO_MEDIAN}x median). `
      + `A cue reading far faster than the rest of the film means part of its script was not spoken.`,
    );
  }
  if (rate.median !== null) {
    log(`[${slug}] Chunk rate consistency OK: median ${rate.median} wpm, `
      + `all ${chunks.length} chunks under ${rate.limit} wpm`);
  }

  // Cue boundaries of the finished track, derived from real chunk durations.
  let cursor = 0;
  const cues = chunks.map((c, i) => {
    const start = cursor;
    const end = start + c.actualSeconds;
    cursor = end + (i < chunks.length - 1 ? gapSeconds : 0);
    return { index: c.index, text: c.text, start, end, words: c.words };
  });

  // Pre-flight the release gate's dead-air check against these cues, using the
  // gate's own detector and its own comparison function.
  //
  // The gate already runs at the end of publishing, but only after a slow render.
  // Discovering here that a cue spans a long pause costs nothing; discovering it
  // after the render wastes the render and, in a batch, silently drops a film.
  // Same thresholds, same code path, so the publisher cannot pass its own check
  // and then fail CI's.
  const silences = detectSilence(outPath);
  const deadAir = narrationDeadAir(cues, silences);
  if (deadAir.length > 0) {
    const detail = deadAir
      .map((d) => `cue ${d.cue} (${d.cueStart.toFixed(2)}-${d.cueEnd.toFixed(2)}s) contains `
        + `${d.overlapSeconds}s of silence at ${d.silenceStart.toFixed(2)}s`)
      .join('; ');
    throw new Error(
      `NARRATION DEAD AIR — ${slug}: ${detail}. `
      + `A caption cue must not span a long pause: the release gate's `
      + `no-dead-air-during-narration check fails it, and on screen the text sits `
      + `over silence. Split the offending cue's text at the pause.`,
    );
  }
  log(`[${slug}] Dead-air pre-check OK: ${silences.length} long silence(s), none inside a cue`);

  const summary = {
    slug,
    provider: provider.id,
    model: provider.model,
    voice: voiceId,
    wpmModel: wpm,
    gapSeconds,
    words: whole.words,
    chars: whole.chars,
    expectedSeconds: whole.expectedSeconds,
    actualSeconds: whole.actualSeconds,
    speechSeconds: Number(speechSeconds.toFixed(2)),
    lengthRatio: Number(speechRatio.toFixed(4)),
    measuredWpm: Number(((60 * whole.words) / speechSeconds).toFixed(1)),
    medianChunkWpm: rate.median,
    chunkWpmLimit: rate.limit ?? null,
    chunks: chunks.map((c) => ({
      index: c.index, words: c.words, chars: c.chars,
      expectedSeconds: c.expectedSeconds, actualSeconds: c.actualSeconds,
      ratio: c.ratio, measuredWpm: c.measuredWpm,
    })),
    cues,
  };

  log(`[${slug}] VERIFIED: ${summary.words} words, ${summary.actualSeconds.toFixed(2)}s total `
    + `(${summary.speechSeconds.toFixed(2)}s speech, ${(summary.lengthRatio * 100).toFixed(1)}% of expected, `
    + `${summary.measuredWpm} wpm)`);
  return summary;
}

/** Write a WebVTT whose cue text is the spoken script and whose times are measured. */
export function writeNarrationVtt({ cues, vttPath, note }) {
  const pad = (n) => String(n).padStart(2, '0');
  const t = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${pad(h)}:${pad(m)}:${(sec % 60).toFixed(3).padStart(6, '0')}`;
  };
  const lines = ['WEBVTT', ''];
  if (note) {
    lines.push(`NOTE ${note}`, '');
  }
  cues.forEach((c, i) => {
    lines.push(String(i + 1));
    lines.push(`${t(c.start)} --> ${t(c.end)}`);
    lines.push(c.text);
    lines.push('');
  });
  fs.mkdirSync(path.dirname(vttPath), { recursive: true });
  fs.writeFileSync(vttPath, lines.join('\n'));
  return cues.length;
}
