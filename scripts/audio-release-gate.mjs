#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const AUDIO_POLICY = Object.freeze({
  integratedLufsMin: -18,
  integratedLufsMax: -14,
  effectiveSilenceFloorLufs: -50,
  meanVolumeFloorDb: -45,
  truePeakCeilingDbtp: -1,
  durationToleranceMs: 100,
  silenceNoiseDb: -45,
  silenceMinimumSeconds: 0.75,
  cueSilenceOverlapSeconds: 0.5,
});

function run(command, args) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function requiredValue(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing required ${flag}`);
  return argv[index + 1];
}

function optionalValue(argv, flag) {
  const index = argv.indexOf(flag);
  return index === -1 ? null : requiredValue(argv, flag);
}

function timestampToSeconds(timestamp) {
  const parts = timestamp.split(':').map(Number);
  if (parts.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    if (minutes >= 60 || seconds >= 60) return null;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    if (minutes >= 60 || seconds >= 60) return null;
    return minutes * 60 + seconds;
  }
  return null;
}

export function parseVtt(text) {
  const cues = [];
  const errors = [];
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (!/^WEBVTT(?:[ \t].*)?$/.test(lines[0] || '') || lines[0].includes('-->')) {
    errors.push('missing WEBVTT header');
  }

  const headerEnd = lines.findIndex((line, index) => index > 0 && line.trim() === '');
  if (headerEnd === -1) {
    errors.push('WEBVTT header is not followed by a blank line');
  } else if (lines.slice(1, headerEnd).some((line) => line.includes('-->'))) {
    errors.push('cue timing found inside WEBVTT header metadata');
  }

  const blocks = [];
  let block = [];
  for (let index = headerEnd === -1 ? lines.length : headerEnd + 1; index <= lines.length; index += 1) {
    const line = index < lines.length ? lines[index] : '';
    if (line.trim() === '') {
      if (block.length > 0) blocks.push(block);
      block = [];
    } else {
      block.push({ line: line.trim(), number: index + 1 });
    }
  }

  let seenCue = false;
  for (const entries of blocks) {
    const first = entries[0].line;
    if (/^NOTE(?:[ \t]|$)/.test(first)) {
      if (entries.some((entry) => entry.line.includes('-->'))) {
        errors.push(`cue timing found inside NOTE block on VTT line ${entries[0].number}`);
      }
      continue;
    }
    if (first === 'STYLE' || first === 'REGION') {
      if (seenCue) errors.push(`${first} block appears after a cue on VTT line ${entries[0].number}`);
      if (entries.some((entry) => entry.line.includes('-->'))) {
        errors.push(`cue timing found inside ${first} block on VTT line ${entries[0].number}`);
      }
      continue;
    }

    const timingIndex = entries[0].line.includes('-->') ? 0 : 1;
    if (!entries[timingIndex]?.line.includes('-->')) {
      errors.push(`malformed cue block on VTT line ${entries[0].number}`);
      continue;
    }
    const additionalTimings = entries.slice(timingIndex + 1).filter((entry) => entry.line.includes('-->'));
    if (additionalTimings.length > 0) {
      errors.push(`cue blocks require a blank separator before VTT line ${additionalTimings[0].number}`);
      continue;
    }

    const timing = entries[timingIndex];
    const match = timing.line.match(/^((?:\d{2}:)?\d{2}:\d{2}\.\d{3})[ \t]+-->[ \t]+((?:\d{2}:)?\d{2}:\d{2}\.\d{3})(.*)$/);
    if (!match) {
      errors.push(`malformed cue timing on VTT line ${timing.number}`);
      continue;
    }
    if (match[3].trim() !== '') {
      errors.push(`unsupported cue settings on VTT line ${timing.number}`);
      continue;
    }
    const startText = match[1];
    const start = timestampToSeconds(startText);
    const end = timestampToSeconds(match[2]);
    if (start === null || end === null || end <= start) {
      errors.push(`invalid cue timing on VTT line ${timing.number}`);
      continue;
    }
    const payload = entries.slice(timingIndex + 1).map((entry) => entry.line);
    if (payload.join(' ').replace(/<[^>]*>/g, '').trim() === '') {
      errors.push(`blank cue payload on VTT line ${timing.number}`);
    }
    // Retain the cue text: the parser already computed `payload` and discarded
    // it, which made speech-rate measurement impossible. Tags are stripped so
    // word counts reflect spoken words, not markup.
    const spoken = payload.join(' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    cues.push({ start, end, text: spoken });
    seenCue = true;
  }
  if (cues.length === 0) errors.push('no VTT cues parsed');
  for (let index = 1; index < cues.length; index += 1) {
    if (cues[index].start < cues[index - 1].end) {
      errors.push(`VTT cue ${index + 1} overlaps cue ${index}`);
    }
  }
  return { cues, errors };
}

function streamDuration(stream) {
  const direct = Number(stream?.duration);
  if (Number.isFinite(direct) && direct >= 0) return direct;
  const durationTs = Number(stream?.duration_ts);
  const [numerator, denominator] = String(stream?.time_base || '').split('/').map(Number);
  if (Number.isFinite(durationTs) && Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
    return durationTs * numerator / denominator;
  }
  return null;
}

function probeMedia(file) {
  const result = run('ffprobe', [
    '-v', 'error',
    '-print_format', 'json',
    '-show_streams',
    '-show_format',
    file,
  ]);
  if (result.status !== 0) throw new Error(`ffprobe failed: ${(result.stderr || result.stdout).trim()}`);
  let probe;
  try {
    probe = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`ffprobe returned invalid JSON: ${error.message}`);
  }
  const video = probe.streams?.find((stream) => stream.codec_type === 'video') || null;
  const audio = probe.streams?.find((stream) => stream.codec_type === 'audio') || null;
  return {
    video,
    audio,
    videoDurationSeconds: streamDuration(video),
    audioDurationSeconds: streamDuration(audio),
    formatDurationSeconds: Number(probe.format?.duration) || null,
  };
}

function parseMetric(text, pattern) {
  const match = text.match(pattern);
  if (!match) return { value: null, raw: null };
  const raw = match[1];
  if (raw === '-inf') return { value: null, raw };
  const value = Number(raw);
  return { value: Number.isFinite(value) ? value : null, raw };
}

function parseSilences(stderr, durationSeconds) {
  const events = [];
  const pattern = /silence_(start|end):\s*([0-9.]+)/g;
  let match;
  while ((match = pattern.exec(stderr)) !== null) {
    events.push({ type: match[1], time: Number(match[2]) });
  }
  const intervals = [];
  let start = null;
  for (const event of events) {
    if (event.type === 'start') start = event.time;
    if (event.type === 'end' && start !== null) {
      intervals.push({ start, end: event.time, duration: event.time - start });
      start = null;
    }
  }
  if (start !== null && Number.isFinite(durationSeconds)) {
    intervals.push({ start, end: durationSeconds, duration: durationSeconds - start });
  }
  return intervals;
}

function measureAudio(file, durationSeconds) {
  const filter = [
    '[0:a:0]asplit=3[loudness][volume][silence]',
    '[loudness]loudnorm=I=-16:TP=-1:LRA=7:print_format=json[loudness_out]',
    '[volume]volumedetect[volume_out]',
    `[silence]silencedetect=noise=${AUDIO_POLICY.silenceNoiseDb}dB:d=${AUDIO_POLICY.silenceMinimumSeconds}[silence_out]`,
  ].join(';');
  const result = run('ffmpeg', [
    '-hide_banner',
    '-nostats',
    '-i', file,
    '-filter_complex', filter,
    '-map', '[loudness_out]',
    '-map', '[volume_out]',
    '-map', '[silence_out]',
    '-f', 'null',
    '-',
  ]);
  if (result.status !== 0) throw new Error(`ffmpeg audio analysis failed: ${(result.stderr || result.stdout).trim()}`);
  const stderr = result.stderr || '';
  const integrated = parseMetric(stderr, /"input_i"\s*:\s*"?(-inf|-?\d+(?:\.\d+)?)"?/);
  const truePeak = parseMetric(stderr, /"input_tp"\s*:\s*"?(-inf|-?\d+(?:\.\d+)?)"?/);
  const lra = parseMetric(stderr, /"input_lra"\s*:\s*"?(-?\d+(?:\.\d+)?)"?/);
  const meanVolume = parseMetric(stderr, /mean_volume:\s*(-inf|-?\d+(?:\.\d+)?)\s*dB/);
  return {
    integratedLufs: integrated.value,
    integratedLufsRaw: integrated.raw,
    truePeakDbtp: truePeak.value,
    truePeakDbtpRaw: truePeak.raw,
    loudnessRangeLu: lra.value,
    meanVolumeDb: meanVolume.value,
    meanVolumeDbRaw: meanVolume.raw,
    silenceIntervals: parseSilences(stderr, durationSeconds),
  };
}

function overlapSeconds(left, right) {
  return Math.max(0, Math.min(left.end, right.end) - Math.max(left.start, right.start));
}

export function narrationDeadAir(cues, silenceIntervals) {
  const defects = [];
  for (let cueIndex = 0; cueIndex < cues.length; cueIndex += 1) {
    const cue = cues[cueIndex];
    const cueDuration = cue.end - cue.start;
    for (const silence of silenceIntervals) {
      const overlap = overlapSeconds(cue, silence);
      const threshold = Math.min(AUDIO_POLICY.cueSilenceOverlapSeconds, cueDuration * 0.5);
      if (overlap >= threshold) {
        defects.push({
          cue: cueIndex + 1,
          cueStart: cue.start,
          cueEnd: cue.end,
          silenceStart: silence.start,
          silenceEnd: silence.end,
          overlapSeconds: Number(overlap.toFixed(3)),
        });
      }
    }
  }
  return defects;
}

function check(id, passed, detail, severity, metrics = {}) {
  return { id, status: passed ? 'pass' : 'fail', severity: passed ? null : severity, detail, ...metrics };
}

export function evaluateAudio({ probe, measurements, vtt }) {
  const checks = [];
  const hasAudio = Boolean(probe.audio);
  checks.push(check('audio-stream-present', hasAudio, hasAudio ? 'audio stream present' : 'no audio stream', 'silent'));
  if (!hasAudio) return checks;

  const effectivelySilent = measurements.integratedLufsRaw === '-inf'
    || measurements.integratedLufs === null
    || measurements.integratedLufs <= AUDIO_POLICY.effectiveSilenceFloorLufs;
  checks.push(check(
    'not-effectively-silent',
    !effectivelySilent,
    effectivelySilent ? `integrated loudness is ${measurements.integratedLufsRaw ?? 'unmeasurable'}` : `integrated loudness ${measurements.integratedLufs.toFixed(1)} LUFS`,
    'silent',
    { integratedLufs: measurements.integratedLufs },
  ));

  const loudnessInBand = measurements.integratedLufs !== null
    && measurements.integratedLufs >= AUDIO_POLICY.integratedLufsMin
    && measurements.integratedLufs <= AUDIO_POLICY.integratedLufsMax;
  checks.push(check(
    'integrated-loudness-band',
    loudnessInBand,
    measurements.integratedLufs === null ? 'integrated loudness unavailable' : `${measurements.integratedLufs.toFixed(1)} LUFS; required -18.0 to -14.0 LUFS`,
    'loudness',
    { integratedLufs: measurements.integratedLufs },
  ));

  const meanAboveFloor = measurements.meanVolumeDb !== null && measurements.meanVolumeDb >= AUDIO_POLICY.meanVolumeFloorDb;
  checks.push(check(
    'mean-volume-floor',
    meanAboveFloor,
    measurements.meanVolumeDb === null ? `mean volume is ${measurements.meanVolumeDbRaw ?? 'unavailable'}` : `${measurements.meanVolumeDb.toFixed(1)} dB; floor -45.0 dB`,
    'loudness',
    { meanVolumeDb: measurements.meanVolumeDb },
  ));

  const peakPass = measurements.truePeakDbtp !== null && measurements.truePeakDbtp <= AUDIO_POLICY.truePeakCeilingDbtp;
  checks.push(check(
    'true-peak-ceiling',
    peakPass,
    measurements.truePeakDbtp === null ? `true peak is ${measurements.truePeakDbtpRaw ?? 'unavailable'}` : `${measurements.truePeakDbtp.toFixed(1)} dBTP; ceiling -1.0 dBTP`,
    'clipping',
    { truePeakDbtp: measurements.truePeakDbtp },
  ));

  const durationDeltaMs = probe.videoDurationSeconds === null || probe.audioDurationSeconds === null
    ? null
    : Math.abs(probe.videoDurationSeconds - probe.audioDurationSeconds) * 1000;
  checks.push(check(
    'audio-video-duration-match',
    durationDeltaMs !== null && durationDeltaMs <= AUDIO_POLICY.durationToleranceMs,
    durationDeltaMs === null ? 'stream duration unavailable' : `audio/video delta ${durationDeltaMs.toFixed(1)} ms; tolerance 100 ms`,
    'duration',
    { audioDurationSeconds: probe.audioDurationSeconds, videoDurationSeconds: probe.videoDurationSeconds, durationDeltaMs },
  ));

  const mediaDurationSeconds = probe.videoDurationSeconds === null || probe.audioDurationSeconds === null
    ? null
    : Math.min(probe.videoDurationSeconds, probe.audioDurationSeconds);
  const outOfRangeCues = vtt?.cues.filter((cue) => (
    mediaDurationSeconds === null
    || cue.start < 0
    || cue.end > mediaDurationSeconds + AUDIO_POLICY.durationToleranceMs / 1000
  )) || [];
  const vttValid = vtt && vtt.errors.length === 0 && vtt.cues.length > 0 && outOfRangeCues.length === 0;
  const timelineErrors = [
    ...(vtt?.errors || []),
    ...outOfRangeCues.map((cue) => `cue ${cue.start.toFixed(3)}-${cue.end.toFixed(3)}s exceeds media duration`),
  ];
  checks.push(check(
    'narration-timeline-present',
    vttValid,
    vttValid ? `${vtt.cues.length} valid VTT cues` : `cannot verify narrated intervals: ${timelineErrors.join('; ') || 'VTT missing'}`,
    'timeline',
  ));
  if (vttValid) {
    const deadAir = narrationDeadAir(vtt.cues, measurements.silenceIntervals);
    checks.push(check(
      'no-dead-air-during-narration',
      deadAir.length === 0,
      deadAir.length === 0 ? 'no long silence overlaps a narrated VTT cue' : `${deadAir.length} narrated cue(s) overlap long silence`,
      'dead-air',
      { defects: deadAir },
    ));
    const rate = speechRate(vtt.cues);
    const rateOk = rate.wpm !== null
      && (rate.words < SPEECH_RATE_MIN_WORDS
        || (rate.wpm >= SPEECH_RATE_MIN_WPM && rate.wpm <= SPEECH_RATE_MAX_WPM));
    checks.push(check(
      'speech-rate-in-band',
      rateOk,
      rate.wpm === null
        ? 'speech rate unmeasurable: narration timeline has no duration'
        : `${rate.wpm.toFixed(0)} wpm over ${rate.narratedSeconds.toFixed(0)} s of narration (${rate.words} words); required ${SPEECH_RATE_MIN_WPM}-${SPEECH_RATE_MAX_WPM} wpm`,
      'speech-rate',
      { wpm: rate.wpm, words: rate.words, narratedSeconds: rate.narratedSeconds },
    ));
  } else {
    checks.push(check('no-dead-air-during-narration', false, 'dead-air check refused without a valid narration timeline', 'dead-air'));
    checks.push(check('speech-rate-in-band', false, 'speech-rate check refused without a valid narration timeline', 'speech-rate'));
  }
  return checks;
}

// Speech rate from the narration timeline. This is the ONLY check that catches
// pitch-preserved time-stretching (e.g. a stray `atempo=0.5`): such audio keeps
// its pitch, keeps audio/video duration aligned, stays inside the loudness band
// because loudnorm runs after the stretch, and shows no dead air under a
// continuous music bed. Every other check in this gate reads clean on it.
//
// Ten published films measured 21-66 wpm before this existed; the worst was
// 63 words spread over 176 s. Normal narration is 140-160 wpm.
//
// The floor is CALIBRATED to the observed corpus, not picked. Measured rates fall
// into two populations with a clean gap: the stretched films span 21-66 wpm, and
// legitimate content starts at 105 (short brand films with deliberate pauses for
// visual beats: an-order-of-effort 105, the-savings-stack 107, the-trust-layer
// 110) rising to 155 for full narration. A floor of 100 sits inside that gap with
// margin on both sides. A floor of 110 was tried first and failed the two 105-107
// brand films — a gate that fails legitimate content gets disabled, so it must
// separate the populations rather than clip the tail of the healthy one.
const SPEECH_RATE_MIN_WPM = 100;
const SPEECH_RATE_MAX_WPM = 190;
const SPEECH_RATE_MIN_WORDS = 25;

export function speechRate(cues) {
  const narrated = cues.reduce((total, cue) => total + Math.max(0, cue.end - cue.start), 0);
  const words = cues.reduce((total, cue) => total + String(cue.text || '').split(/\s+/).filter(Boolean).length, 0);
  if (narrated <= 0) return { words, narratedSeconds: 0, wpm: null };
  return { words, narratedSeconds: narrated, wpm: (60 * words) / narrated };
}

function resolveVtt(file, explicitVtt) {
  if (explicitVtt) return explicitVtt;
  const candidate = file.replace(/\.[^.]+$/, '.vtt');
  return fs.existsSync(candidate) ? candidate : null;
}

export function auditAudioFile(file, { vttPath = null, displayPath = null } = {}) {
  const absoluteFile = path.resolve(file);
  const shownPath = displayPath || path.relative(ROOT, absoluteFile);
  const result = {
    file: shownPath,
    absoluteFile,
    vtt: null,
    verdict: 'fail',
    rank: null,
    checks: [],
    measurements: null,
  };
  try {
    const probe = probeMedia(absoluteFile);
    const resolvedVtt = resolveVtt(absoluteFile, vttPath);
    let vtt = null;
    if (resolvedVtt && fs.existsSync(resolvedVtt)) {
      vtt = parseVtt(fs.readFileSync(resolvedVtt, 'utf8'));
      result.vtt = path.relative(ROOT, path.resolve(resolvedVtt));
    }
    const measurements = probe.audio ? measureAudio(absoluteFile, probe.audioDurationSeconds || probe.formatDurationSeconds) : {
      integratedLufs: null,
      integratedLufsRaw: null,
      truePeakDbtp: null,
      truePeakDbtpRaw: null,
      loudnessRangeLu: null,
      meanVolumeDb: null,
      meanVolumeDbRaw: null,
      silenceIntervals: [],
    };
    result.measurements = measurements;
    result.checks = evaluateAudio({ probe, measurements, vtt });
  } catch (error) {
    result.checks = [check('analysis-completed', false, error.message, 'analysis')];
  }
  result.verdict = result.checks.every((entry) => entry.status === 'pass') ? 'pass' : 'fail';
  return result;
}

const SEVERITY_RANK = Object.freeze({ silent: 0, clipping: 1, 'speech-rate': 2, 'dead-air': 3, duration: 4, loudness: 5, timeline: 6, analysis: 7 });

function defectRank(file) {
  if (file.verdict === 'pass') return 99;
  return Math.min(...file.checks.filter((entry) => entry.status === 'fail').map((entry) => SEVERITY_RANK[entry.severity] ?? 98));
}

function markdownReport(report) {
  const lines = [
    '# Audio release gate',
    '',
    `Decision: **${report.decision.toUpperCase()}**`,
    `Files: ${report.summary.total}; pass: ${report.summary.passed}; fail: ${report.summary.failed}`,
    `Commit: ${report.commitSha || 'not supplied (local audit)'}`,
    '',
    'Policy: integrated loudness -18 to -14 LUFS (target -16 LUFS); effective-silence floor -50 LUFS; mean-volume floor -45 dB; true peak at or below -1 dBTP; audio/video duration delta at most 100 ms; no silence of at least 0.75 s overlapping a narrated VTT cue by at least 0.5 s or half a short cue; and narration speech rate within 100-190 wpm (films under 25 narrated words are exempt).',
    '',
    '## Ranked verdicts',
    '',
  ];
  for (const file of report.files) {
    lines.push(`### ${file.verdict === 'pass' ? 'PASS' : 'FAIL'} — ${file.file}`);
    for (const entry of file.checks) {
      lines.push(`- ${entry.status === 'pass' ? 'PASS' : `FAIL/${entry.severity}`}: ${entry.id} — ${entry.detail}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function mediaFilesRecursively(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...mediaFilesRecursively(entryPath));
    if (entry.isFile() && /\.(mp4|mov|mkv|webm)$/i.test(entry.name)) files.push(entryPath);
  }
  return files;
}

export function filesFromArgs(argv) {
  const files = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--file') files.push(path.resolve(argv[index + 1]));
  }
  if (files.length > 0) return files;
  const directory = path.resolve(optionalValue(argv, '--directory') || path.join(ROOT, 'public', 'videos'));
  return mediaFilesRecursively(directory).sort();
}

export function auditFiles(files, options = {}) {
  const explicitVtt = options.vttPath || null;
  const audited = files.map((file) => auditAudioFile(file, { vttPath: files.length === 1 ? explicitVtt : null }));
  for (const file of audited) file.rank = defectRank(file);
  audited.sort((left, right) => left.rank - right.rank || left.file.localeCompare(right.file));
  const failed = audited.filter((file) => file.verdict === 'fail').length;
  return {
    schemaVersion: 1,
    policy: AUDIO_POLICY,
    decision: failed === 0 && audited.length > 0 ? 'pass' : 'fail',
    commitSha: options.commitSha || null,
    generatedAt: new Date().toISOString(),
    summary: { total: audited.length, passed: audited.length - failed, failed },
    files: audited,
  };
}
function main(argv = process.argv.slice(2)) {
  const outputPath = path.resolve(optionalValue(argv, '--output') || path.join(ROOT, 'release', 'audio-gate', 'audio-gate.json'));
  const summaryPath = path.resolve(optionalValue(argv, '--summary') || path.join(ROOT, 'release', 'audio-gate', 'audio-gate.md'));
  const report = auditFiles(filesFromArgs(argv), {
    vttPath: optionalValue(argv, '--vtt'),
    commitSha: optionalValue(argv, '--sha'),
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(summaryPath, markdownReport(report));
  console.log(`Audio gate ${report.decision.toUpperCase()}: ${report.summary.passed}/${report.summary.total} passed`);
  console.log(`JSON: ${outputPath}`);
  console.log(`Summary: ${summaryPath}`);
  if (report.decision !== 'pass') process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
