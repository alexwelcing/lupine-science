// Deterministic EBU R128 loudness normalization.
//
// Why two passes
// ──────────────
// `-af loudnorm=I=-16:TP=-2.0:LRA=7` in a single pass runs in DYNAMIC mode: it
// adapts as it streams, having not yet seen the whole file, and the true peak it
// actually delivers is not the one you asked for. Measured on this repo's
// narration: a -2.0 dBTP request produced -0.6 dBTP after the pipeline's two AAC
// encodes — over the release gate's -1.0 dBTP ceiling.
//
// Worse, it is not reproducible. Two renders of the same film landed -1.85 dBTP
// and -0.55 dBTP: one passed the gate, one failed. That is the mechanism behind
// flaky `true-peak-ceiling` failures — the check was right and the encoder was
// inconsistent.
//
// Measuring first and then applying with `linear=true` and the measured values
// makes the filter a fixed gain. Same input, same output, every time. Measured on
// the same narration: -16.1 LUFS and -1.8 dBTP after both AAC encodes, clearing
// the ceiling by 0.8 dB.
//
// Both AAC encodes matter. Each lossy pass reconstructs a waveform that overshoots
// the peak it was normalized to, which is why the target is -2.0 dBTP rather than
// a value closer to the -1.0 dBTP ceiling.

import { spawnSync } from 'node:child_process';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';

export const LOUDNESS_TARGET_LUFS = -16;
export const LOUDNESS_RANGE_LU = 7;

// True-peak target: -3.0 dBTP, against a release-gate ceiling of -1.0 dBTP.
//
// The 2 dB gap is not padding, it is the measured cost of the AAC encode that the
// muxer performs afterwards. Two-pass normalization hits its target exactly — a
// normalized track measures -3.0 dBTP to the tenth — but a lossy encode
// reconstructs a waveform that overshoots, and by a CONTENT-DEPENDENT amount:
//
//   film                      normalized   after AAC   overshoot
//   a-field-not-a-neural-net    -2.0 dBTP   -1.8 dBTP    +0.2 dB
//   critical-minerals-pfas      -2.0 dBTP   -0.8 dBTP    +1.2 dB  <- FAILED the gate
//
// So a target chosen from one film's overshoot fails on another's. -2.5 dBTP left
// critical-minerals at -1.5 dBTP, half a decibel from the ceiling. -3.0 dBTP puts
// it at -2.8 dBTP, with margin that content variation cannot eat.
//
// The loudness cost is negligible, because loudnorm limits peaks rather than
// pulling down overall gain: critical-minerals measured -16.1 LUFS at TP=-2.0 and
// -16.5 LUFS at TP=-3.0, both comfortably inside the gate's -18..-14 LUFS band.
export const TRUE_PEAK_TARGET_DBTP = -3.0;

function ff(args, { capture = false } = {}) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-nostats', ...args], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${(r.stderr || r.stdout || '').slice(-2000)}`);
  return capture ? `${r.stdout}\n${r.stderr}` : null;
}

/** Pass 1: measure the file's loudness statistics. */
export function measureLoudness(inPath, {
  targetLufs = LOUDNESS_TARGET_LUFS,
  targetTp = TRUE_PEAK_TARGET_DBTP,
  lra = LOUDNESS_RANGE_LU,
} = {}) {
  const out = ff([
    '-i', inPath,
    '-af', `loudnorm=I=${targetLufs}:TP=${targetTp}:LRA=${lra}:print_format=json`,
    '-f', 'null', '-',
  ], { capture: true });

  // loudnorm prints its JSON block to stderr among other log lines.
  const match = out.match(/\{[^{}]*"input_i"[\s\S]*?\}/);
  if (!match) throw new Error(`Could not parse loudnorm measurement for ${inPath}`);
  const stats = JSON.parse(match[0]);
  for (const key of ['input_i', 'input_tp', 'input_lra', 'input_thresh']) {
    if (!Number.isFinite(Number(stats[key]))) {
      throw new Error(`loudnorm measurement missing ${key} for ${inPath}: ${match[0]}`);
    }
  }
  return stats;
}

/**
 * Normalize to spec and encode AAC, deterministically.
 * Returns the measurement used, for the provenance record.
 */
export function normalizeLoudness({
  inPath,
  outPath,
  targetLufs = LOUDNESS_TARGET_LUFS,
  targetTp = TRUE_PEAK_TARGET_DBTP,
  lra = LOUDNESS_RANGE_LU,
  // Lossless by default. See "One lossy pass, not two" below.
  codec = 'pcm',
} = {}) {
  const stats = measureLoudness(inPath, { targetLufs, targetTp, lra });
  const filter = [
    `loudnorm=I=${targetLufs}`,
    `TP=${targetTp}`,
    `LRA=${lra}`,
    `measured_I=${stats.input_i}`,
    `measured_TP=${stats.input_tp}`,
    `measured_LRA=${stats.input_lra}`,
    `measured_thresh=${stats.input_thresh}`,
    // `linear=true` is what makes this a fixed gain instead of a dynamic,
    // stream-adaptive correction. Without it the second pass is no more
    // reproducible than the first.
    'linear=true',
  ].join(':');

  // One lossy pass, not two.
  //
  // This step used to encode AAC, and then the muxer encoded AAC again. Each
  // lossy pass reconstructs a waveform that overshoots the peak it was normalized
  // to, and the two stacked: a track normalized to -2.0 dBTP arrived in the
  // finished MP4 at -1.1 dBTP, clearing the gate's -1.0 dBTP ceiling by a tenth
  // of a decibel. Handing the muxer PCM leaves exactly one AAC encode in the
  // chain, so the overshoot is roughly halved and nothing is transcoded twice.
  const codecArgs = codec === 'aac'
    ? ['-c:a', 'aac', '-b:a', '128k']
    : ['-c:a', 'pcm_s16le'];

  ff([
    '-loglevel', 'error', '-y', '-i', inPath,
    '-af', filter,
    ...codecArgs, '-ar', '44100', '-ac', '1',
    outPath,
  ]);

  return {
    targetLufs,
    targetTruePeakDbtp: targetTp,
    measuredInputLufs: Number(stats.input_i),
    measuredInputTruePeakDbtp: Number(stats.input_tp),
    normalizationType: 'linear (two-pass)',
    intermediateCodec: codec,
  };
}

/**
 * Silence intervals, using the same detector and thresholds as the release gate
 * so the publisher cannot pass its own check and then fail CI's.
 */
export function detectSilence(inPath, { noiseDb = -45, minimumSeconds = 0.75 } = {}) {
  const out = ff([
    '-i', inPath,
    '-af', `silencedetect=noise=${noiseDb}dB:d=${minimumSeconds}`,
    '-f', 'null', '-',
  ], { capture: true });

  const intervals = [];
  let start = null;
  for (const line of out.split(/\r?\n/)) {
    const s = line.match(/silence_start:\s*(-?[\d.]+)/);
    if (s) { start = Number(s[1]); continue; }
    const e = line.match(/silence_end:\s*(-?[\d.]+)/);
    if (e && start !== null) {
      intervals.push({ start, end: Number(e[1]) });
      start = null;
    }
  }
  return intervals;
}
