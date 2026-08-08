import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  auditAudioFile,
  evaluateAudio,
  filesFromArgs,
  narrationDeadAir,
  parseVtt,
  speechRate,
  applyBaseline,
} from '../scripts/audio-release-gate.mjs';

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function measurements(overrides = {}) {
  return {
    integratedLufs: -16,
    integratedLufsRaw: '-16.00',
    truePeakDbtp: -1.5,
    truePeakDbtpRaw: '-1.50',
    loudnessRangeLu: 2,
    meanVolumeDb: -19,
    meanVolumeDbRaw: '-19.0',
    silenceIntervals: [],
    ...overrides,
  };
}

const probe = {
  audio: { codec_type: 'audio' },
  videoDurationSeconds: 2,
  audioDurationSeconds: 2,
};
const vtt = { cues: [{ start: 0.2, end: 1.8 }], errors: [] };

test('VTT parser accepts narration cues and rejects overlaps', () => {
  const parsed = parseVtt('WEBVTT\n\n00:00:00.200 --> 00:00:01.800\nNarration\n');
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.cues, [{ start: 0.2, end: 1.8, text: 'Narration' }]);

  const overlapping = parseVtt('WEBVTT\n\n00:00.000 --> 00:01.000\nA\n\n00:00.900 --> 00:02.000\nB\n');
  assert.match(overlapping.errors.join('\n'), /overlaps/);

  const oneMillisecondOverlap = parseVtt('WEBVTT\n\n00:00.000 --> 00:01.001\nA\n\n00:01.000 --> 00:02.000\nB\n');
  assert.match(oneMillisecondOverlap.errors.join('\n'), /overlaps/);
});

test('VTT parser fails closed on missing headers, malformed timing, and blank cues', () => {
  const invalid = parseVtt([
    '00:00:00.000 --> 00:00:00.500',
    'Valid-looking cue without a header',
    '',
    '00:00:00.BAD --> 00:00:01.000',
    'Malformed timing',
    '',
    '00:00:01.000 --> 00:00:01.500',
    '',
  ].join('\n'));
  assert.match(invalid.errors.join('\n'), /missing WEBVTT header/);
  assert.match(invalid.errors.join('\n'), /malformed cue timing/);
  assert.match(invalid.errors.join('\n'), /blank cue payload/);

  const outOfRange = parseVtt([
    'WEBVTT',
    '',
    '00:60:00.000 --> 00:60:01.000',
    'Minute component is invalid',
    '',
    '00:00:60.000 --> 00:00:61.000',
    'Second component is invalid',
    '',
    '00:00:01,000 --> 00:00:02,000',
    'Comma-separated milliseconds are not WebVTT',
  ].join('\n'));
  assert.equal(outOfRange.cues.length, 0);
  assert.match(outOfRange.errors.join('\n'), /invalid cue timing/);
  assert.match(outOfRange.errors.join('\n'), /malformed cue timing/);
});

test('VTT parser respects block structure and rejects unsupported cue settings', () => {
  const note = parseVtt([
    'WEBVTT',
    '',
    'NOTE ignored metadata',
    '00:00:00.000 --> 00:00:09.000',
    '',
    '00:00:00.200 --> 00:00:01.800',
    'Narration',
  ].join('\n'));
  assert.match(note.errors.join('\n'), /timing found inside NOTE/);
  assert.deepEqual(note.cues, [{ start: 0.2, end: 1.8, text: 'Narration' }]);

  const settings = parseVtt('WEBVTT\n\n00:00:00.200 --> 00:00:01.800 position:bogus\nNarration\n');
  assert.match(settings.errors.join('\n'), /unsupported cue settings/);

  const missingSeparator = parseVtt([
    'WEBVTT',
    '',
    '00:00:00.200 --> 00:00:01.000',
    'First cue',
    '00:00:01.000 --> 00:00:01.800',
    'Second cue',
  ].join('\n'));
  assert.match(missingSeparator.errors.join('\n'), /blank separator/);

  const prefixedHeader = parseVtt(' WEBVTT\n\n00:00:00.200 --> 00:00:01.800\nNarration\n');
  assert.match(prefixedHeader.errors.join('\n'), /missing WEBVTT header/);

  const timingInHeader = parseVtt('WEBVTT --> invalid\n\n00:00:00.200 --> 00:00:01.800\nNarration\n');
  assert.match(timingInHeader.errors.join('\n'), /missing WEBVTT header/);
});

test('directory discovery recursively includes nested film files', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-audio-discovery-'));
  const nested = path.join(directory, 'campaign');
  fs.mkdirSync(nested);
  fs.writeFileSync(path.join(directory, 'top.mp4'), 'fixture');
  fs.writeFileSync(path.join(nested, 'nested.webm'), 'fixture');
  fs.writeFileSync(path.join(nested, 'ignore.txt'), 'fixture');
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  assert.deepEqual(filesFromArgs(['--directory', directory]), [
    path.join(nested, 'nested.webm'),
    path.join(directory, 'top.mp4'),
  ]);
});

test('dead air is evaluated specifically against narrated cue intervals', () => {
  assert.deepEqual(narrationDeadAir(vtt.cues, [{ start: 1.0, end: 1.8, duration: 0.8 }]), [{
    cue: 1,
    cueStart: 0.2,
    cueEnd: 1.8,
    silenceStart: 1,
    silenceEnd: 1.8,
    overlapSeconds: 0.8,
  }]);
  assert.deepEqual(narrationDeadAir(vtt.cues, [{ start: 1.81, end: 2, duration: 0.19 }]), []);
});

test('policy fails closed on clipping, wrong loudness, duration drift, and narrated dead air', () => {
  const checks = evaluateAudio({
    probe: { ...probe, audioDurationSeconds: 2.2 },
    measurements: measurements({
      integratedLufs: -21,
      integratedLufsRaw: '-21.00',
      truePeakDbtp: 0,
      truePeakDbtpRaw: '0.00',
      silenceIntervals: [{ start: 0.8, end: 1.6, duration: 0.8 }],
    }),
    vtt,
  });
  const failures = checks.filter((entry) => entry.status === 'fail');
  assert.deepEqual(failures.map((entry) => entry.id), [
    'integrated-loudness-band',
    'true-peak-ceiling',
    'audio-video-duration-match',
    'no-dead-air-during-narration',
  ]);
});

test('policy rejects narration cues outside the exact media duration', () => {
  const checks = evaluateAudio({
    probe,
    measurements: measurements(),
    vtt: { cues: [{ start: 1.5, end: 2.5 }], errors: [] },
  });
  assert.equal(checks.find((entry) => entry.id === 'narration-timeline-present')?.status, 'fail');
  assert.equal(checks.find((entry) => entry.id === 'no-dead-air-during-narration')?.status, 'fail');
});

test('real ffmpeg measurement passes a compliant film and rejects one without audio', (t) => {
  if (spawnSync('ffmpeg', ['-version']).status !== 0 || spawnSync('ffprobe', ['-version']).status !== 0) {
    t.skip('ffmpeg and ffprobe are required');
    return;
  }
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-audio-gate-'));
  const good = path.join(directory, 'good.mp4');
  const goodVtt = path.join(directory, 'good.vtt');
  const mute = path.join(directory, 'mute.mp4');
  const deadAir = path.join(directory, 'dead-air.mp4');
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'color=c=#161d1d:s=320x180:r=30:d=2',
    '-f', 'lavfi', '-i', 'sine=frequency=1000:sample_rate=48000:duration=2',
    '-filter:a', 'loudnorm=I=-16:TP=-1.5:LRA=7',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', good,
  ]);
  fs.writeFileSync(goodVtt, 'WEBVTT\n\n00:00:00.200 --> 00:00:01.800\nContinuous narration fixture\n');
  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'color=c=#161d1d:s=320x180:r=30:d=2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', mute,
  ]);
  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'color=c=#161d1d:s=320x180:r=30:d=2',
    '-f', 'lavfi', '-i', 'aevalsrc=if(lt(t\\,1)\\,sin(2*PI*1000*t)\\,0):s=48000:d=2',
    '-filter:a', 'loudnorm=I=-16:TP=-1.5:LRA=7',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', deadAir,
  ]);

  const goodResult = auditAudioFile(good, { vttPath: goodVtt });
  assert.equal(goodResult.verdict, 'pass', JSON.stringify(goodResult, null, 2));
  const muteResult = auditAudioFile(mute, { vttPath: goodVtt });
  assert.equal(muteResult.verdict, 'fail');
  assert.equal(muteResult.checks.find((entry) => entry.id === 'audio-stream-present')?.status, 'fail');
  const deadAirResult = auditAudioFile(deadAir, { vttPath: goodVtt });
  assert.equal(deadAirResult.verdict, 'fail');
  assert.equal(deadAirResult.checks.find((entry) => entry.id === 'no-dead-air-during-narration')?.status, 'fail');
});

test('speech-rate check catches pitch-preserved time stretching', () => {
  // Regression for the atempo=0.5 defect: ten published films shipped at 21-66
  // wpm. Every other gate check read clean on them — pitch preserved, durations
  // aligned within 0.03s, loudness in band because loudnorm ran after the
  // stretch, and no dead air under a continuous music bed. Speech rate is the
  // only signal that exposes it.
  const stretched = parseVtt([
    'WEBVTT', '',
    '00:00:00.000 --> 00:01:00.000',
    'sixty seconds of narration carrying only these twelve words total here',
  ].join('\n'));
  assert.equal(stretched.errors.length, 0);
  const slow = speechRate(stretched.cues);
  assert.equal(slow.words, 11);
  assert.ok(slow.wpm < 100, `expected sub-100 wpm, got ${slow.wpm}`);

  // Healthy narration: ~150 wpm over the same minute.
  const words = Array.from({ length: 150 }, (_, i) => `word${i}`).join(' ');
  const healthy = parseVtt(['WEBVTT', '', '00:00:00.000 --> 00:01:00.000', words].join('\n'));
  const fast = speechRate(healthy.cues);
  assert.equal(fast.words, 150);
  assert.ok(fast.wpm >= 100 && fast.wpm <= 190, `expected in-band, got ${fast.wpm}`);
});

test('parseVtt retains cue text so speech rate is measurable', () => {
  // The parser previously discarded the payload it had already computed, which
  // silently made speech rate unmeasurable: every file reported 0 words and the
  // short-script exemption passed everything.
  const vtt = parseVtt(['WEBVTT', '', '00:00:00.000 --> 00:00:10.000', 'hello <b>tagged</b> world'].join('\n'));
  assert.equal(vtt.errors.length, 0);
  assert.equal(vtt.cues[0].text, 'hello tagged world');
});

test('baseline reports known defects but fails closed on anything new', () => {
  // The retroactive audit found 29 of 32 published films defective. Failing CI on
  // that whole backlog blocks every unrelated PR, which is how a gate gets
  // switched off. Known defects are reported; anything new blocks.
  const report = {
    decision: 'fail',
    files: [
      { file: 'public/videos/known.mp4', verdict: 'fail',
        checks: [{ id: 'speech-rate-in-band', status: 'fail', severity: 'speech-rate' }] },
      { file: 'public/videos/clean.mp4', verdict: 'pass', checks: [] },
    ],
  };
  const baseline = { films: { 'public/videos/known.mp4': ['speech-rate-in-band'] }, trackedBy: 'card' };
  const baselined = applyBaseline(structuredClone(report), baseline);
  assert.equal(baselined.decision, 'pass', 'a fully-baselined defect must not block');
  assert.equal(baselined.blockingFiles, 0);

  // A NEW failing check on the same film is not covered and must block.
  const regressed = structuredClone(report);
  regressed.files[0].checks.push({ id: 'true-peak-ceiling', status: 'fail', severity: 'clipping' });
  assert.equal(applyBaseline(regressed, baseline).decision, 'fail', 'a new defect must fail closed');

  // An unlisted film with a defect must block.
  const unlisted = structuredClone(report);
  unlisted.files.push({ file: 'public/videos/new.mp4', verdict: 'fail',
    checks: [{ id: 'speech-rate-in-band', status: 'fail', severity: 'speech-rate' }] });
  assert.equal(applyBaseline(unlisted, baseline).decision, 'fail', 'an unlisted defective film must fail closed');
});
