// Verify that a synthesized narration track actually contains the script.
//
// The bug this closes
// ───────────────────
// The publisher sent ~2000 characters to FAL Orpheus in one call, downloaded
// whatever came back, and wrote it to disk. It never asked the one question that
// mattered: is this file long enough to be the script we sent?
//
// It was not. The published films delivered 29-67% of their intended script, and
// one carried ~25 s of hallucinated speech. A track missing half its words is
// still a valid audio file: it normalizes to spec, muxes cleanly, matches the
// video duration (because scene durations were derived FROM it), and never trips
// silencedetect under a music bed. Every downstream check passed. The corruption
// was only visible by comparing duration against WORD COUNT — which nothing did.
//
// So: no synthesized track is accepted until its measured duration is compared
// against the duration its word count predicts, and a shortfall fails loudly
// with the numbers.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

// Narration rate for the expected-duration model.
//
// Measured on this exact provider/voice pair (MiniMax speech-2.8-hd,
// English_expressive_narrator): 23 words -> 9.51 s = 145 wpm, and
// 312 words / 2051 chars -> 125.86 s = 149 wpm. 145 wpm is the conservative end
// of that range, so it under-predicts duration slightly and the ratio check is
// not tripped by a narrator who is merely brisk.
export const EXPECTED_WPM = 145;

// WHERE THIS CHECK HAS POWER, AND WHERE IT DOES NOT
// ─────────────────────────────────────────────────
// A word-count duration model is only meaningful over a long enough span, and it
// is worth being precise about that instead of implying more rigour than exists.
//
// Measured spread on real narration from this provider:
//
//   whole film (270-320 words)   112-120% of expected — tight, consistent
//   one sentence (8-30 words)     96-209 wpm, i.e. 70-150% of expected
//
// Sentence-scale variance is inherent and bidirectional. Numerals expand ("2.2
// million" is one word and six syllables, read at ~95 wpm); strings of
// monosyllables compress ("What if that is solving the wrong problem?" is eight
// words and ten syllables, read at ~209 wpm). Neither is a defect.
//
// So the thresholds are split by scope:
//
//   FILM level    the sharp, load-bearing check. MIN_LENGTH_RATIO applies here,
//                 and it is what catches the failure that actually shipped
//                 (29-67% of script delivered).
//   CHUNK level   a loose physical bound only — MAX_PLAUSIBLE_WPM. It localises a
//                 gross failure to one sentence without rejecting fast prose.
//
// Honest limitation: duration cannot detect a small drop inside a single
// sentence — a 30% loss on one sentence looks like ordinary brisk delivery. That
// residual risk is low for this pipeline because chunks are 40-160 characters and
// the observed corruption came from degrading on ~2000-character input, and the
// film-level check is the backstop. Confirming the exact WORDS would need an ASR
// pass; none is installed on this host.

// Minimum fraction of the expected duration a FILM must deliver.
//
// 0.85 sits in the empty gap between the two populations actually observed:
// intact films land at 1.12-1.20, and the corrupted Orpheus films landed at
// 0.29-0.67. Nothing real was measured between 0.67 and 1.12.
//
// Its error direction is one-sided at film scale: aggregated over ~300 words the
// numeric expansion in Lupine's prose puts intact tracks well ABOVE 1.0, so good
// narration cannot drift down through this floor. It reliably catches shortfalls
// past ~25%.
export const MIN_LENGTH_RATIO = 0.85;

// Fastest rate at which counted words could actually have been spoken.
//
// Intelligible narration tops out near 200-250 wpm; this provider's fastest
// legitimate sentence measured 209 wpm. Above ~280 wpm the arithmetic is claiming
// words were delivered that no voice could have fitted in the audio — which means
// they were counted from the script and never spoken. That is truncation, and
// unlike a ratio test this bound does not care how long the chunk is.
export const MAX_PLAUSIBLE_WPM = 280;

// Hallucination ceiling. A track far LONGER than its script can account for is
// the other half of the corruption: Orpheus padded one film with ~25 s of babble.
//
// NUMERIC EXPANSION is why this cannot be a tight ratio. Word count is a poor
// proxy for speaking time when a token expands into many spoken syllables:
// "Okay, so Google DeepMind predicted 2.2 million crystals. Huge. But by late
// 2023, only 736 had been independently synthesized." counts 19 words but is
// spoken as roughly 30, so it legitimately reads at ~95 wpm and lands at 152% of
// a 145-wpm prediction. A 1.45 ratio ceiling rejected that valid paragraph twice
// before this model replaced it. Lupine narration is dense with figures, so this
// is the normal case, not an edge case.
//
// The fixed term absorbs the per-chunk overhead that does not scale with length
// (lead-in and trailing silence, sentence-final pauses), which dominates on short
// paragraphs. The multiplier absorbs numeric expansion. Together they still catch
// the failure that matters: 25 s of babble on a 30-word paragraph reads 37 s
// against a 27 s ceiling.
export const MAX_LENGTH_FACTOR = 1.9;
export const MAX_LENGTH_OVERHEAD_SECONDS = 4.0;

// Truncation localizer, applied across the chunks of one film.
//
// Truncation shows up as an anomalously HIGH measured rate: the words are counted
// from the script but only some were spoken, so drop half a sentence and its
// apparent rate doubles. Comparing against the film's own median partly cancels
// the calibration problem, since it is the same voice in the same register.
//
// 2.0x, not something tighter, because sentence-scale spread is genuinely wide:
// legitimate cues on one real film ran 96-209 wpm against a ~130 wpm median, so
// the fastest honest sentence already sits at 1.6x. A threshold below 2.0 would
// reject valid narration. What survives is a net for gross loss — half a chunk or
// more — with MAX_PLAUSIBLE_WPM as the absolute backstop.
export const MAX_CHUNK_WPM_RATIO_TO_MEDIAN = 2.0;

/** Words in a narration script, counting the way a narrator speaks them. */
export function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

/** Seconds this script should take to read at EXPECTED_WPM. */
export function expectedSeconds(text, wpm = EXPECTED_WPM) {
  return (countWords(text) / wpm) * 60;
}

/** Decoded duration in seconds, measured from the file itself. */
export function probeDuration(file, ffprobe = process.env.FFPROBE || 'ffprobe') {
  const r = spawnSync(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffprobe failed on ${file}: ${r.stderr || r.stdout}`);
  const seconds = Number(String(r.stdout).trim());
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`ffprobe reported no usable duration for ${file}: "${r.stdout}"`);
  }
  return seconds;
}

/** Longest duration a script of this length may legitimately occupy. */
export function maxSeconds(expected) {
  return expected * MAX_LENGTH_FACTOR + MAX_LENGTH_OVERHEAD_SECONDS;
}

/**
 * Measure a track against its script. Pure: returns the numbers and a verdict,
 * never throws — callers decide whether to fail, and at which scope.
 */
export function measureTrack({ text, audioPath, wpm = EXPECTED_WPM }) {
  if (!fs.existsSync(audioPath)) throw new Error(`Narration file not found: ${audioPath}`);
  const words = countWords(text);
  const expected = (words / wpm) * 60;
  const actual = probeDuration(audioPath);
  const ratio = expected > 0 ? actual / expected : 0;
  const ceiling = maxSeconds(expected);
  return {
    words,
    chars: String(text).trim().length,
    expectedSeconds: Number(expected.toFixed(2)),
    maxSeconds: Number(ceiling.toFixed(2)),
    actualSeconds: Number(actual.toFixed(2)),
    ratio: Number(ratio.toFixed(4)),
    measuredWpm: actual > 0 ? Number(((60 * words) / actual).toFixed(1)) : null,
    bytes: fs.statSync(audioPath).size,
    ok: ratio >= MIN_LENGTH_RATIO && actual <= ceiling,
  };
}

/**
 * Cross-check the chunks of one film against each other. Returns the offending
 * chunks; the caller decides how to fail. See MAX_CHUNK_WPM_RATIO_TO_MEDIAN.
 */
export function findRateOutliers(chunks) {
  const rates = chunks.map((c) => c.measuredWpm).filter((r) => Number.isFinite(r)).sort((a, b) => a - b);
  if (rates.length < 3) return { median: null, outliers: [] };
  const mid = Math.floor(rates.length / 2);
  const median = rates.length % 2 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
  const limit = median * MAX_CHUNK_WPM_RATIO_TO_MEDIAN;
  return {
    median: Number(median.toFixed(1)),
    limit: Number(limit.toFixed(1)),
    outliers: chunks.filter((c) => Number.isFinite(c.measuredWpm) && c.measuredWpm > limit),
  };
}

function numbersFor(m, wpm) {
  return `${m.words} words -> expected ${m.expectedSeconds.toFixed(2)}s at ${wpm} wpm, `
    + `got ${m.actualSeconds.toFixed(2)}s (${(m.ratio * 100).toFixed(1)}% of expected, `
    + `measured ${m.measuredWpm} wpm)`;
}

/**
 * Verify ONE CHUNK (a sentence-sized cue).
 *
 * Only physical bounds apply at this scope — see the note above on where the
 * word-count model has power. A ratio floor here rejects legitimately brisk
 * sentences: "What if that is solving the wrong problem?" is eight monosyllables
 * read in 2.3 s, which is 70% of a 145-wpm prediction and perfectly correct.
 */
export function verifyChunk({ label, text, audioPath, wpm = EXPECTED_WPM }) {
  const m = measureTrack({ text, audioPath, wpm });
  const numbers = numbersFor(m, wpm);
  if (m.measuredWpm !== null && m.measuredWpm > MAX_PLAUSIBLE_WPM) {
    throw new Error(
      `NARRATION TRUNCATED — ${label}: ${numbers}. `
      + `That exceeds ${MAX_PLAUSIBLE_WPM} wpm, faster than speech can be delivered, `
      + `so words counted from the script were never spoken. `
      + `Refusing to publish a partial narration.`,
    );
  }
  if (m.actualSeconds > m.maxSeconds) {
    throw new Error(
      `NARRATION OVERLONG — ${label}: ${numbers}. `
      + `Allowed at most ${m.maxSeconds.toFixed(2)}s `
      + `(${MAX_LENGTH_FACTOR}x expected + ${MAX_LENGTH_OVERHEAD_SECONDS}s overhead). `
      + `This is the hallucination signature (audio with no script to account for it); refusing to publish.`,
    );
  }
  return m;
}

/**
 * Verify a WHOLE FILM's narration — the load-bearing check.
 *
 * `speechSeconds` excludes any silence the pipeline inserted itself, so the track
 * gets no credit for its own padding.
 */
export function verifyFilm({ label, text, audioPath, speechSeconds, wpm = EXPECTED_WPM, minRatio = MIN_LENGTH_RATIO }) {
  const m = measureTrack({ text, audioPath, wpm });
  const speech = speechSeconds ?? m.actualSeconds;
  const ratio = speech / m.expectedSeconds;
  const numbers = `${m.words} words -> expected ${m.expectedSeconds.toFixed(2)}s at ${wpm} wpm, `
    + `got ${speech.toFixed(2)}s of speech (${(ratio * 100).toFixed(1)}% of expected, `
    + `measured ${((60 * m.words) / speech).toFixed(1)} wpm)`;
  if (ratio < minRatio) {
    throw new Error(
      `NARRATION TRUNCATED — ${label}: ${numbers}. `
      + `Required at least ${(minRatio * 100).toFixed(0)}% of expected length. `
      + `The provider did not speak the whole script; refusing to publish a partial narration.`,
    );
  }
  if (speech > m.maxSeconds) {
    throw new Error(
      `NARRATION OVERLONG — ${label}: ${numbers}. `
      + `Allowed at most ${m.maxSeconds.toFixed(2)}s of speech. `
      + `This is the hallucination signature (audio with no script to account for it); refusing to publish.`,
    );
  }
  return { ...m, speechSeconds: Number(speech.toFixed(2)), lengthRatio: Number(ratio.toFixed(4)) };
}
