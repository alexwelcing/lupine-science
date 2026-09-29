import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';

import { classifyP0, frameStats, sampleTimes, technicalVideoNotes } from '../scripts/video-quality-reviewer.mjs';

test('frameStats reads the current Sharp channels[].stdev API', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lupine-video-frame-'));
  const file = path.join(directory, 'gradient.png');
  const pixels = Buffer.from([
    0, 0, 0,
    255, 255, 255,
  ]);
  await sharp(pixels, { raw: { width: 2, height: 1, channels: 3 } }).png().toFile(file);
  const result = await frameStats(file);
  assert.ok(Number.isFinite(result.avgStd));
  assert.ok(result.avgStd > 0);
});

test('sample-analysis errors are P0 instead of silently preserving a high score', () => {
  const report = {
    technical: { notes: [] },
    poster: { notes: [] },
    captions: { notes: [] },
    brand: { notes: [] },
    posterAnalysis: { unknown: [] },
  };
  const sample = {
    samples: [{ time: 1, error: 'statistics unavailable' }],
    blankFrames: [],
    ocrHits: [],
  };
  assert.deepEqual(classifyP0(report, sample), ['frames:sample failures at 1.0s: statistics unavailable']);
});

test('every technical conformance failure is P0', () => {
  const technicalNotes = [
    'resolution 640x360',
    'frame rate 24/1',
    'audio codec mp3',
    'sample rate 48000',
    'channels 2 (expected mono)',
    'could not measure loudness',
  ];
  const report = {
    technical: { notes: technicalNotes },
    poster: { notes: [] },
    captions: { notes: [] },
    brand: { notes: [] },
    posterAnalysis: { unknown: [] },
  };
  assert.deepEqual(
    classifyP0(report),
    technicalNotes.map((note) => `technical:${note}`),
  );
});

test('technical video conformance requires exact 30 fps and BT.709 metadata', () => {
  const conforming = {
    width: 1920,
    height: 1080,
    avg_frame_rate: '30/1',
    codec_name: 'h264',
    pix_fmt: 'yuv420p',
    color_space: 'bt709',
    color_primaries: 'bt709',
    color_transfer: 'bt709',
  };
  assert.deepEqual(technicalVideoNotes(conforming), []);
  assert.ok(technicalVideoNotes({ ...conforming, avg_frame_rate: '300/1' }).includes('frame rate 300/1'));
  assert.ok(technicalVideoNotes({ ...conforming, avg_frame_rate: '30/2' }).includes('frame rate 30/2'));
  assert.ok(technicalVideoNotes({ ...conforming, color_space: 'bt2020nc' }).includes('color space bt2020nc'));
  assert.ok(technicalVideoNotes({ ...conforming, color_primaries: 'bt2020' }).includes('color primaries bt2020'));
  assert.ok(technicalVideoNotes({ ...conforming, color_transfer: 'smpte2084' }).includes('color transfer smpte2084'));
});

test('production brand builder has no partial-publication escape hatch', async () => {
  const source = await fs.readFile(new URL('../scripts/build-midwest-2076-brand-library.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /allow-partial|allowPartial/);
  assert.match(source, /accepted\.length !== 100/);
});

test('content samples settle inside cues instead of treating exact dark cut frames as blank scenes', () => {
  const times = sampleTimes(12, [
    { start: 2, end: 5 },
    { start: 5, end: 9 },
  ]);
  assert.ok(times.includes(2.4));
  assert.ok(times.includes(5.4));
  assert.ok(!times.includes(2));
  assert.ok(!times.includes(5));
});

test('video reviewer exposes a targeted slug option', async () => {
  const source = await fs.readFile(new URL('../scripts/video-quality-reviewer.mjs', import.meta.url), 'utf8');
  assert.match(source, /if \(a === '--slug'\) flags\.slug = args\[\+\+i\]/);
  assert.match(source, /f === `\$\{flags\.slug\}\.mp4`/);
  assert.match(source, /videoSha256: createHash\('sha256'\)/);
});

test('video reviewer accepts explicit private candidate assets without changing canonical placement names', async () => {
  const source = await fs.readFile(new URL('../scripts/video-quality-reviewer.mjs', import.meta.url), 'utf8');
  assert.match(source, /if \(a === '--video'\) flags\.videoPath = path\.resolve\(args\[\+\+i\]\)/);
  assert.match(source, /if \(a === '--vtt'\) flags\.vttPath = path\.resolve\(args\[\+\+i\]\)/);
  assert.match(source, /if \(a === '--poster'\) flags\.posterPath = path\.resolve\(args\[\+\+i\]\)/);
  assert.match(source, /if \(a === '--report-dir'\) flags\.reportDir = path\.resolve\(args\[\+\+i\]\)/);
  assert.match(source, /checkArticleIntegration\(slug, `\$\{slug\}\.mp4`, `\$\{slug\}-poster\.jpg`\)/);
});