// The check that was missing while ten films published with 33-71% of their
// script. These tests pin the thresholds so nobody can quietly widen them back
// to "accept whatever the provider returned".

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  countWords,
  expectedSeconds,
  measureTrack,
  verifyChunk,
  verifyFilm,
  findRateOutliers,
  maxSeconds,
  probeDuration,
  EXPECTED_WPM,
  MIN_LENGTH_RATIO,
  MAX_CHUNK_WPM_RATIO_TO_MEDIAN,
  MAX_PLAUSIBLE_WPM,
} from '../scripts/lib/verify-narration.mjs';
import { PROVIDERS, resolveProvider, narratorVoice, DEFAULT_PROVIDER } from '../scripts/lib/tts-provider.mjs';
import {
  writeNarrationVtt, splitIntoCueTexts, cachedNarrationMatches, CUE_GAP_SECONDS,
} from '../scripts/lib/synthesize-narration.mjs';
import {
  normalizeLoudness, measureLoudness, detectSilence,
  TRUE_PEAK_TARGET_DBTP, LOUDNESS_TARGET_LUFS,
} from '../scripts/lib/audio-normalize.mjs';
import { parseVtt, narrationDeadAir } from '../scripts/audio-release-gate.mjs';
import { recoveredPayloadMatches } from '../scripts/recover-narration-scripts.mjs';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';

/** A silent wav of an exact duration — enough to exercise every duration check. */
function toneWav(seconds, dir, name) {
  const out = path.join(dir, name);
  const r = spawnSync(FFMPEG, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=mono:sample_rate=44100',
    '-t', String(seconds), '-c:a', 'pcm_s16le', out,
  ], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return out;
}

// Every fixture is a decoded PCM wav, so a run of this file writes tens of
// megabytes. Track the directories and remove them when the process exits, or
// repeated runs silently fill /tmp — which is exactly what happened while
// developing these tests.
const scratchDirs = [];
process.on('exit', () => {
  for (const dir of scratchDirs) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // best effort; never fail a run over cleanup
    }
  }
});

function tmpdir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'narration-verify-'));
  scratchDirs.push(dir);
  return dir;
}

// A 145-word script: one minute of narration at the model rate, which makes the
// arithmetic in these tests checkable by eye.
const SCRIPT_145 = Array.from({ length: 145 }, (_, i) => `word${i}`).join(' ');

test('word counting and expected duration follow the 145 wpm model', () => {
  assert.equal(countWords(SCRIPT_145), 145);
  assert.equal(countWords('  spaced   out \n words '), 3);
  assert.equal(Math.round(expectedSeconds(SCRIPT_145)), 60);
  assert.equal(EXPECTED_WPM, 145);
});

test('a film delivering the full script is accepted', () => {
  const dir = tmpdir();
  const audio = toneWav(60, dir, 'full.wav');
  const m = verifyFilm({ label: 'full', text: SCRIPT_145, audioPath: audio });
  assert.ok(m.lengthRatio >= 0.99 && m.lengthRatio <= 1.01, `ratio ${m.lengthRatio}`);
});

test('the truncation that shipped is rejected, with the numbers in the message', () => {
  const dir = tmpdir();
  // The real corruption spanned 29-67% of intended length. Check both ends.
  for (const fraction of [0.29, 0.5, 0.67]) {
    const audio = toneWav(60 * fraction, dir, `trunc-${fraction}.wav`);
    assert.throws(
      () => verifyFilm({ label: 'shipped-corruption', text: SCRIPT_145, audioPath: audio }),
      (err) => {
        assert.match(err.message, /NARRATION TRUNCATED/);
        // The failure must be diagnosable from the log line alone.
        assert.match(err.message, /145 words/);
        assert.match(err.message, /expected 60\.00s/);
        assert.match(err.message, /% of expected/);
        assert.match(err.message, /wpm/);
        return true;
      },
      `fraction ${fraction} should be rejected`,
    );
  }
});

test('the floor sits between the two observed populations', () => {
  const dir = tmpdir();
  assert.equal(MIN_LENGTH_RATIO, 0.85);
  // Just below the floor fails; just above passes. No silent acceptance either side.
  const bad = toneWav(60 * 0.84, dir, 'just-under.wav');
  assert.throws(() => verifyFilm({ label: 'under', text: SCRIPT_145, audioPath: bad }), /NARRATION TRUNCATED/);
  const good = toneWav(60 * 0.86, dir, 'just-over.wav');
  assert.ok(verifyFilm({ label: 'over', text: SCRIPT_145, audioPath: good }).lengthRatio >= 0.85);
});

test('numeral-heavy prose that reads slowly is NOT a false rejection', () => {
  // Real paragraph from a-field-not-a-neural-net: 19 counted words, spoken as
  // ~30 because "2.2 million" and "736" expand. It measured 11.98s against a
  // 7.86s prediction (152%). A ratio ceiling of 1.45 rejected it twice; the
  // fixed-overhead chunk model must accept it.
  const dir = tmpdir();
  const text = 'Okay, so Google DeepMind predicted 2.2 million crystals. Huge. '
    + 'But by late 2023, only 736 had been independently synthesized.';
  assert.equal(countWords(text), 19);
  const audio = toneWav(11.98, dir, 'numerals.wav');
  const m = verifyChunk({ label: 'numerals', text, audioPath: audio });
  assert.ok(m.ratio > 1.45, `expected ratio above the old 1.45 ceiling, got ${m.ratio}`);
});

test('hallucinated padding is still rejected', () => {
  // ~25s of babble appended to a 30-word paragraph, the observed signature.
  const dir = tmpdir();
  const text = Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ');
  const expected = expectedSeconds(text);
  const audio = toneWav(expected + 25, dir, 'babble.wav');
  assert.throws(
    () => verifyChunk({ label: 'babble', text, audioPath: audio }),
    (err) => {
      assert.match(err.message, /NARRATION OVERLONG/);
      assert.match(err.message, /hallucination signature/);
      return true;
    },
  );
});

test('the ceiling scales with length and carries a fixed overhead', () => {
  // Short chunks get proportionally more slack, because lead-in/trailing silence
  // does not scale with word count.
  assert.ok(maxSeconds(8) / 8 > maxSeconds(120) / 120);
  assert.ok(maxSeconds(0) > 0, 'overhead must be nonzero');
});

test('sentence-scale rate spread on a real film does not trip the outlier check', () => {
  // Actual measured cue rates, including a legitimately brisk 209 wpm question and
  // a numeral-heavy 96 wpm line. A threshold tight enough to flag either of these
  // would reject valid narration, so it must not.
  const real = [100.5, 96.4, 151, 209, 130, 120, 124, 137, 141, 121, 128, 116, 127, 140]
    .map((wpm, i) => ({ index: i + 1, measuredWpm: wpm, words: 20, actualSeconds: 20 / wpm * 60 }));
  const clean = findRateOutliers(real);
  assert.equal(clean.outliers.length, 0, `false positives: ${JSON.stringify(clean.outliers)}`);
  assert.equal(MAX_CHUNK_WPM_RATIO_TO_MEDIAN, 2.0);

  // A cue that lost most of its script reads far past the median and is localised.
  const withTruncated = [...real, { index: 15, measuredWpm: 275, words: 20, actualSeconds: 4.4 }];
  const flagged = findRateOutliers(withTruncated);
  assert.equal(flagged.outliers.length, 1);
  assert.equal(flagged.outliers[0].index, 15);
});

test('a chunk faster than speech allows is rejected as truncation', () => {
  const dir = tmpdir();
  const text = Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ');
  // 30 words in 5s is 360 wpm — nothing spoke those words.
  const audio = toneWav(5, dir, 'impossible.wav');
  assert.throws(
    () => verifyChunk({ label: 'impossible', text, audioPath: audio }),
    (err) => {
      assert.match(err.message, /NARRATION TRUNCATED/);
      assert.match(err.message, /faster than speech can be delivered/);
      return true;
    },
  );
  assert.equal(MAX_PLAUSIBLE_WPM, 280);
});

test('a brisk short sentence is accepted at chunk scope', () => {
  // "What if that is solving the wrong problem?" — eight monosyllables in 2.3s is
  // 209 wpm and completely correct. A chunk-level ratio floor rejected it three
  // times and aborted the film, which is why chunk scope checks physical bounds
  // only and the ratio floor lives at film scope.
  const dir = tmpdir();
  const text = 'What if that is solving the wrong problem?';
  assert.equal(countWords(text), 8);
  const audio = toneWav(2.3, dir, 'brisk.wav');
  const m = verifyChunk({ label: 'brisk', text, audioPath: audio });
  assert.ok(m.measuredWpm > 200, `measured ${m.measuredWpm}`);
  assert.ok(m.ratio < MIN_LENGTH_RATIO, 'this chunk is below the film-scope floor by design');
});

test('rate outlier detection abstains rather than guessing on too few chunks', () => {
  const { median, outliers } = findRateOutliers([{ index: 1, measuredWpm: 500, words: 10, actualSeconds: 1.2 }]);
  assert.equal(median, null);
  assert.deepEqual(outliers, []);
});

test('measureTrack reports from the file, never from a provider claim', () => {
  const dir = tmpdir();
  const audio = toneWav(30, dir, 'measured.wav');
  const m = measureTrack({ text: SCRIPT_145, audioPath: audio });
  assert.equal(m.actualSeconds, 30);
  assert.equal(Math.round(probeDuration(audio)), 30);
  assert.equal(m.bytes, fs.statSync(audio).size);
});

test('a missing narration file fails loudly instead of defaulting', () => {
  assert.throws(
    () => measureTrack({ text: SCRIPT_145, audioPath: '/nonexistent/narration.wav' }),
    /Narration file not found/,
  );
});

// ── provider abstraction ─────────────────────────────────────────────────────

test('minimax is the default provider and fal remains available', () => {
  assert.equal(DEFAULT_PROVIDER, 'minimax');
  assert.deepEqual(Object.keys(PROVIDERS).sort(), ['fal', 'minimax']);
  // The FAL path must not be deleted — it has to work when the account is restored.
  assert.equal(typeof PROVIDERS.fal.synthesize, 'function');
  assert.equal(typeof PROVIDERS.minimax.synthesize, 'function');
});

test('an unknown provider names the available ones', () => {
  assert.throws(() => resolveProvider('elevenlabs'), (err) => {
    assert.match(err.message, /Unknown TTS provider "elevenlabs"/);
    assert.match(err.message, /minimax/);
    assert.match(err.message, /fal/);
    return true;
  });
});

test('the legacy FAL voice name maps to each provider namespace', () => {
  assert.equal(narratorVoice(PROVIDERS.minimax, 'dan'), 'English_expressive_narrator');
  assert.equal(narratorVoice(PROVIDERS.minimax, undefined), 'English_expressive_narrator');
  assert.equal(narratorVoice(PROVIDERS.fal, 'dan'), 'dan');
  // An explicit non-legacy voice passes through untouched.
  assert.equal(narratorVoice(PROVIDERS.minimax, 'English_calm_narrator'), 'English_calm_narrator');
});

// ── caption safety ───────────────────────────────────────────────────────────

test('narration VTT cues carry spoken text and parse under the release gate', () => {
  const dir = tmpdir();
  const vttPath = path.join(dir, 'out.vtt');
  const cues = [
    { start: 0, end: 10.53, text: 'Okay, so Google DeepMind predicted 2.2 million crystals.' },
    { start: 10.98, end: 22.71, text: 'The usual response is: build a bigger neural net.' },
  ];
  writeNarrationVtt({ cues, vttPath, note: 'Narration transcript. Verified.' });
  const text = fs.readFileSync(vttPath, 'utf8');
  assert.match(text, /^WEBVTT\n/);
  assert.match(text, /^NOTE Narration transcript\./m);

  // The release gate must accept it, and must count the SPOKEN words for
  // speech-rate — that is the whole point of publishing a real transcript.
  const parsed = parseVtt(text);
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.cues.length, 2);
  assert.equal(parsed.cues[0].text, cues[0].text);
});

test('paragraph gaps keep cues non-overlapping, which the gate requires', () => {
  const dir = tmpdir();
  const vttPath = path.join(dir, 'gapped.vtt');
  let cursor = 0;
  const cues = [12, 14, 11].map((d, i, arr) => {
    const start = cursor;
    const end = start + d;
    cursor = end + (i < arr.length - 1 ? CUE_GAP_SECONDS : 0);
    return { start, end, text: `paragraph ${i + 1} spoken text` };
  });
  writeNarrationVtt({ cues, vttPath, note: 'Narration transcript. Verified.' });
  const parsed = parseVtt(fs.readFileSync(vttPath, 'utf8'));
  assert.deepEqual(parsed.errors, [], 'gapped cues must not overlap');
  // The gap must stay under the gate's 0.75s dead-air threshold as well.
  assert.ok(CUE_GAP_SECONDS < 0.75);
});

// ── cue splitting ────────────────────────────────────────────────────────────

test('cues split at sentence boundaries, not paragraph boundaries', () => {
  // Paragraph-length cues span the provider's ~0.92s sentence pause, which the
  // release gate correctly flags as dead air under a caption.
  const paragraphs = [
    'Flip that field, add it beside the existing model, and under-coordinated structures '
    + 'move back toward reference energies. The forces are analytic, so simulations stay '
    + 'physically consistent.',
  ];
  const cues = splitIntoCueTexts(paragraphs);
  assert.equal(cues.length, 2);
  assert.match(cues[0], /reference energies\.$/);
  assert.match(cues[1], /^The forces are analytic/);
});

test('short sentences get their own cue rather than being merged', () => {
  // Merging a runt forward reintroduces the sentence pause the split exists to
  // remove. It failed a real film: "Then actually destroy them. That second step
  // is brutal..." carried 0.78s of silence at its internal boundary, inside one
  // cue. Short cues are the lesser problem, and here they are the script's own
  // rhetorical rhythm.
  const cues = splitIntoCueTexts(['Then actually destroy them. That second step is brutal '
    + 'because the carbon-fluorine bond packs about four hundred eighty-five kilojoules per mole.']);
  assert.equal(cues.length, 2);
  assert.equal(cues[0], 'Then actually destroy them.');

  const staccato = splitIntoCueTexts(['Measure the error. Correct the physics. Prove the boundary.']);
  assert.deepEqual(staccato, ['Measure the error.', 'Correct the physics.', 'Prove the boundary.']);
});

test('a sentence split across two source paragraphs is rejoined', () => {
  // The recovered scripts inherit their paragraph breaks from the ORIGINAL VTT
  // cues, which cut mid-sentence. Splitting each paragraph separately would hand
  // the narrator a fragment and caption a fragment.
  const cues = splitIntoCueTexts([
    'A 100 millielectron volt error can change a',
    'predicted hopping rate 50-fold. The correction measures that systematic error.',
  ]);
  assert.equal(cues.length, 2);
  assert.equal(cues[0], 'A 100 millielectron volt error can change a predicted hopping rate 50-fold.');
});

test('no published cue begins mid-sentence', () => {
  const dir = path.join(path.resolve(import.meta.dirname, '..'), 'data', 'narration-scripts');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    for (const cue of splitIntoCueTexts(doc.paragraphs)) {
      assert.match(cue, /^["\u201c'\u2018(]?[A-Z0-9]/, `${file}: fragment cue "${cue}"`);
    }
  }
});

test('decimals and figures are not mistaken for sentence ends', () => {
  // Lupine narration is dense with numbers. Splitting "2.2 million" would both
  // wreck the captions and hand the TTS a fragment.
  const cues = splitIntoCueTexts([
    'Okay, so Google DeepMind predicted 2.2 million crystals. Huge. '
    + 'But by late 2023, only 736 had been independently synthesized.',
  ]);
  assert.ok(cues.every((c) => !/^\d+ (million|percent)/.test(c)), `bad split: ${JSON.stringify(cues)}`);
  assert.ok(cues.some((c) => c.includes('2.2 million crystals')));
  assert.ok(cues.some((c) => c.includes('late 2023, only 736')), `2023/736 mis-split: ${JSON.stringify(cues)}`);
});

test('splitting preserves every word of the script', () => {
  const paragraphs = JSON.parse(fs.readFileSync(
    path.join(path.resolve(import.meta.dirname, '..'), 'data', 'narration-scripts', 'a-field-not-a-neural-net.json'),
    'utf8',
  )).paragraphs;
  const cues = splitIntoCueTexts(paragraphs);
  // Nothing dropped, nothing duplicated — the cue set is the script.
  assert.equal(countWords(cues.join(' ')), countWords(paragraphs.join(' ')));
  assert.ok(cues.length > paragraphs.length, 'sentences should outnumber paragraphs');
  // Every cue is exactly one sentence, so each ends on sentence punctuation.
  for (const cue of cues) {
    assert.match(cue, /[.!?]["\u201d'\u2019)]?$/, `cue does not end a sentence: "${cue}"`);
  }
});

// ── loudness normalization ───────────────────────────────────────────────────

test('two-pass normalization is deterministic', () => {
  const dir = tmpdir();
  const src = path.join(dir, 'src.wav');
  const r = spawnSync(FFMPEG, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=44100:duration=6',
    '-af', 'volume=0.9', '-c:a', 'pcm_s16le', '-ac', '1', src,
  ], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);

  const first = normalizeLoudness({ inPath: src, outPath: path.join(dir, 'a.wav') });
  const second = normalizeLoudness({ inPath: src, outPath: path.join(dir, 'b.wav') });

  assert.equal(first.normalizationType, 'linear (two-pass)');
  assert.equal(first.targetTruePeakDbtp, TRUE_PEAK_TARGET_DBTP);
  // PCM by default, so the muxer's AAC encode is the only lossy pass.
  assert.equal(first.intermediateCodec, 'pcm');
  // Same input, same measurement — that is the property single-pass lacks.
  assert.deepEqual(first, second);
  // Byte-identical output, which is what makes gate results reproducible.
  assert.deepEqual(
    fs.readFileSync(path.join(dir, 'a.wav')),
    fs.readFileSync(path.join(dir, 'b.wav')),
  );

  const after = measureLoudness(path.join(dir, 'a.wav'));
  assert.ok(Math.abs(Number(after.input_i) - LOUDNESS_TARGET_LUFS) <= 0.5, `loudness ${after.input_i} LUFS`);
  assert.ok(Number(after.input_tp) <= TRUE_PEAK_TARGET_DBTP, `true peak ${after.input_tp} dBTP`);
});

test('peaks are limited to the target without sacrificing loudness', () => {
  // A quiet body with loud transients: normalizing its LOUDNESS up to -16 LUFS
  // would drive its PEAKS past the target, so the true-peak constraint has to bind.
  // This is the case that matters — loudnorm limits the peaks rather than pulling
  // global gain down, which is why a -3.0 dBTP target costs almost no loudness
  // (measured -16.1 LUFS at TP=-2.0 vs -16.5 LUFS at TP=-3.0 on a real film).
  const dir = tmpdir();
  const quiet = path.join(dir, 'quiet.wav');
  const spike = path.join(dir, 'spike.wav');
  // ffmpeg's `sine` emits 0.125 amplitude, so the spike needs 8x to reach full scale.
  for (const [file, vol, dur] of [[quiet, '0.15', '3'], [spike, '8.0', '0.05']]) {
    const r = spawnSync(FFMPEG, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'lavfi', '-i', `sine=frequency=330:sample_rate=44100:duration=${dur}`,
      '-af', `volume=${vol}`, '-c:a', 'pcm_s16le', '-ac', '1', file,
    ], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
  }
  const list = path.join(dir, 'list.txt');
  fs.writeFileSync(list, [quiet, spike, quiet, spike, quiet].map((f) => `file '${f}'`).join('\n') + '\n');
  const src = path.join(dir, 'peaky.wav');
  let r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', src], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);

  const before = measureLoudness(src);
  assert.ok(
    Number(before.input_tp) > TRUE_PEAK_TARGET_DBTP,
    `fixture must actually have hot peaks, got ${before.input_tp} dBTP`,
  );

  const out = path.join(dir, 'limited.wav');
  normalizeLoudness({ inPath: src, outPath: out });
  const after = measureLoudness(out);

  // The peak lands at the target, not above it.
  assert.ok(Number(after.input_tp) <= TRUE_PEAK_TARGET_DBTP + 0.1, `true peak ${after.input_tp} dBTP`);
  // And with 2 dB of headroom below the gate's -1.0 dBTP ceiling for the AAC
  // overshoot that follows.
  assert.ok(Number(after.input_tp) <= -2.0, `insufficient AAC headroom: ${after.input_tp} dBTP`);
  // Loudness is still inside the gate's -18..-14 LUFS band.
  assert.ok(Number(after.input_i) >= -18 && Number(after.input_i) <= -14, `loudness ${after.input_i} LUFS`);
});

test('silence detection uses the release gate thresholds', () => {
  const dir = tmpdir();
  const speech = path.join(dir, 'tone.wav');
  const gap = toneWav(1.2, dir, 'silence.wav');
  let r = spawnSync(FFMPEG, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=44100:duration=2',
    '-c:a', 'pcm_s16le', '-ac', '1', speech,
  ], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);

  const list = path.join(dir, 'list.txt');
  fs.writeFileSync(list, [`file '${speech}'`, `file '${gap}'`, `file '${speech}'`].join('\n') + '\n');
  const joined = path.join(dir, 'joined.wav');
  r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);

  const silences = detectSilence(joined);
  assert.equal(silences.length, 1);
  assert.ok(silences[0].start >= 1.9 && silences[0].start <= 2.1, JSON.stringify(silences));

  // A cue spanning that gap is dead air; cues on either side of it are not.
  assert.equal(narrationDeadAir([{ start: 0, end: 5.2 }], silences).length, 1);
  assert.equal(narrationDeadAir([{ start: 0, end: 2.0 }, { start: 3.2, end: 5.2 }], silences).length, 0);
});

test('the inserted chunk gap stays below the dead-air detection threshold', () => {
  // 0.3s insert plus ~0.2s of provider edge padding each side is ~0.7s, under the
  // gate's 0.75s detector — so the seam never registers as silence at all.
  assert.equal(CUE_GAP_SECONDS, 0.3);
  assert.ok(CUE_GAP_SECONDS + 0.4 < 0.75);
});

// ── script provenance ────────────────────────────────────────────────────────

test('recovered narration scripts still match commit 4641d96', () => {
  // The scripts survive nowhere else: generate-motion-vtt.mjs overwrote the
  // working-tree copies with scene titles. This pins them to their stated source
  // so a later edit cannot quietly become "the script" without provenance.
  const root = path.resolve(import.meta.dirname, '..');
  const r = spawnSync('node', [path.join(root, 'scripts', 'recover-narration-scripts.mjs'), '--check'], {
    encoding: 'utf8', cwd: root,
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /DRIFTED|MISSING/);
  // All ten affected films, each a real script rather than a title placeholder.
  const lines = r.stdout.trim().split('\n').filter((l) => l.includes(' OK '));
  assert.equal(lines.length, 10, r.stdout);
});

test('water-and-air recovery preserves the reviewed theorem-count exclusion', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const script = JSON.parse(fs.readFileSync(path.join(
    root,
    'data/narration-scripts/water-and-air-correcting-the-molecules-we-drink-and-breathe.json',
  ), 'utf8'));
  const text = script.paragraphs.join(' ');
  assert.doesNotMatch(text, /one hundred ninety build-locked Lean 4 theorems/i);
  assert.match(text, /A membrane ranking is supported only when/);
  assert.match(script.source, /reviewed editorial exclusions applied/);
});

test('synthesis-film recovery cannot restore the retired failure-cost claim', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const slug = 'the-02-percent-synthesis-problem';
  const script = JSON.parse(fs.readFileSync(path.join(root, `data/narration-scripts/${slug}.json`), 'utf8'));
  const text = script.paragraphs.join(' ');
  assert.doesNotMatch(text, /thousands of dollars/i);
  assert.match(text, /Weeks of lab time disappear/i);
  assert.match(script.source, /reviewed editorial exclusions applied/);
});

test('recovery payload validation fails closed on every provenance field', () => {
  const expected = {
    slug: 'film',
    source: 'source',
    recoveredAt: '2026-08-08',
    words: 2,
    chars: 11,
    paragraphs: ['hello world'],
  };
  assert.equal(recoveredPayloadMatches(expected, expected), true);
  for (const [field, value] of [
    ['slug', 'other'],
    ['source', 'other'],
    ['recoveredAt', '1900-01-01'],
    ['words', 3],
    ['chars', 10],
    ['paragraphs', ['other']],
  ]) {
    assert.equal(recoveredPayloadMatches({ ...expected, [field]: value }, expected), false, field);
  }
});

test('every narration script is prose, not the scene-title placeholder', () => {
  const dir = path.join(path.resolve(import.meta.dirname, '..'), 'data', 'narration-scripts');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    assert.ok(doc.paragraphs.length >= 5, `${file}: too few paragraphs`);
    // Placeholder VTTs carried 35-74 words per film; real scripts carry 270-320.
    assert.ok(doc.words >= 200, `${file}: ${doc.words} words looks like a placeholder`);
    assert.equal(doc.words, countWords(doc.paragraphs.join(' ')), `${file}: word count is stale`);
    assert.match(doc.source, /4641d96/, `${file}: provenance not recorded`);
  }
});

// ── narration reuse ─────────────────────────────────────────────────────────

test('reusing a cached narration requires the same script and the same cue split', () => {
  const paragraphs = ['Measure the error. Correct the physics.', 'Prove the boundary.'];
  const cues = splitIntoCueTexts(paragraphs);
  const cached = { words: countWords(paragraphs.join(' ')), cues: cues.map((text) => ({ text })) };

  assert.equal(cachedNarrationMatches(cached, paragraphs).ok, true);

  // A changed script must invalidate the cache, or --reuse-narration would render
  // yesterday's audio under today's captions.
  const edited = [...paragraphs, 'And stop when the proof runs out.'];
  const changed = cachedNarrationMatches(cached, edited);
  assert.equal(changed.ok, false);
  assert.match(changed.reason, /script changed/);

  // Same words, different cue text: the audio was cut differently, so its pause
  // placement and cue timings no longer describe it.
  const recut = {
    words: cached.words,
    cues: [{ text: 'Measure the error. Correct the physics.' }, { text: 'Prove the boundary.' }],
  };
  const split = cachedNarrationMatches(recut, paragraphs);
  assert.equal(split.ok, false);
  assert.match(split.reason, /cue splitting changed|text differs/);

  assert.equal(cachedNarrationMatches(null, paragraphs).ok, false);
  assert.equal(cachedNarrationMatches({ words: 6 }, paragraphs).ok, false);
});

test('the true-peak target leaves room for the AAC overshoot', () => {
  // The gate ceiling is -1.0 dBTP. Two-pass normalization hits its target exactly,
  // but the muxer's AAC encode overshoots by a content-dependent amount measured
  // between +0.2 and +1.2 dB across these films. -2.0 dBTP was not enough:
  // critical-minerals-pfas landed -0.8 dBTP and failed.
  assert.equal(LOUDNESS_TARGET_LUFS, -16);
  assert.equal(TRUE_PEAK_TARGET_DBTP, -3.0);
  assert.ok(TRUE_PEAK_TARGET_DBTP + 1.2 <= -1.5, 'must survive the largest measured overshoot with margin');
});

test('generate-motion-vtt refuses to overwrite a narration transcript', () => {
  // The regression that destroyed ten narration scripts and put scene titles
  // on screen under a `default` track.
  const root = path.resolve(import.meta.dirname, '..');
  const slug = 'a-field-not-a-neural-net';
  const vttPath = path.join(root, 'public', 'videos', `${slug}.vtt`);
  const before = fs.readFileSync(vttPath, 'utf8');
  assert.match(before, /^NOTE Narration transcript\./m, 'published VTT should be a real transcript');

  const r = spawnSync('node', [path.join(root, 'scripts', 'generate-motion-vtt.mjs'), '--slug', slug], {
    encoding: 'utf8', cwd: root,
  });
  assert.equal(r.status, 1, 'must refuse');
  assert.match(r.stderr, /REFUSED/);
  assert.match(r.stderr, /narration transcript/);
  assert.equal(fs.readFileSync(vttPath, 'utf8'), before, 'file must be untouched');
});
