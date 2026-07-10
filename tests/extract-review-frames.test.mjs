import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'media', 'projects', 'article-videos', 'scripts', 'extract-review-frames.sh');
const RENDER_DURATION = '124.032';

function run(args, options = {}) {
  const result = spawnSync('bash', [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    ...options,
  });
  return result;
}

function ffmpegAvailable() {
  const result = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  return result.status === 0;
}

describe('extract-review-frames.sh', { skip: !ffmpegAvailable() ? 'ffmpeg not installed' : false }, () => {
  let tmpDir;
  let videoPath;
  let outputDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-review-frames-'));
    videoPath = path.join(tmpDir, 'render.mp4');
    outputDir = path.join(tmpDir, 'frames');

    const ffmpegResult = spawnSync('ffmpeg', [
      '-y', '-f', 'lavfi', '-i', 'color=c=black:s=320x240:d=130',
      '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
      '-shortest', '-t', RENDER_DURATION,
      '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28',
      '-c:a', 'aac', '-b:a', '128k', videoPath,
    ], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });

    assert.equal(ffmpegResult.status, 0, `ffmpeg failed: ${ffmpegResult.stderr}`);
  });

  after(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('produces exactly one unique JPEG per manifest row with monotonic timestamps', () => {
    const cueFile = path.join(tmpDir, 'cues.vtt');
    fs.writeFileSync(cueFile, [
      'WEBVTT',
      '',
      '1',
      '00:00:09.000 --> 00:00:10.000',
      'cue 9',
      '',
      '2',
      '00:00:19.000 --> 00:00:20.000',
      'cue 19',
      '',
      '3',
      '00:00:38.000 --> 00:00:39.000',
      'cue 38',
      '',
      '4',
      '00:00:48.000 --> 00:00:49.000',
      'cue 48',
      '',
      '5',
      '00:01:01.000 --> 00:01:02.000',
      'cue 61',
      '',
      '6',
      '00:01:28.000 --> 00:01:29.000',
      'cue 88',
      '',
    ].join('\n'));

    const result = run([
      '-c', cueFile,
      '--cue', '61.437',
      '-o', outputDir,
      videoPath,
    ]);
    assert.equal(result.status, 0, `script failed: ${result.stdout}\n${result.stderr}`);

    const manifestPath = path.join(outputDir, 'manifest.tsv');
    assert.ok(fs.existsSync(manifestPath), 'manifest.tsv should exist');

    const rows = fs.readFileSync(manifestPath, 'utf8')
      .split('\n')
      .filter((line) => line.trim() !== '')
      .slice(1)
      .map((line) => line.split('\t'));

    const frameFiles = new Set(
      fs.readdirSync(outputDir).filter((f) => /^frame-.*\.jpg$/.test(f))
    );
    assert.equal(rows.length, frameFiles.size,
      'manifest row count must equal unique JPEG count');

    const seconds = rows.map((r) => parseFloat(r[1]));
    for (let i = 1; i < seconds.length; i += 1) {
      assert.ok(seconds[i] > seconds[i - 1],
        `timestamps must be monotonic; got ${seconds[i - 1]} then ${seconds[i]}`);
    }

    // Regression guard: exact timestamps that cross minute boundaries and mix
    // interval, VTT, and explicit cues must remain correct.
    const expected = [
      '45.000', '48.000', '50.000', '60.000', '61.000', '61.437', '85.000', '110.000',
    ];
    const present = new Set(rows.map((r) => r[1]));
    for (const ts of expected) {
      assert.ok(present.has(ts), `expected timestamp ${ts} to be present in manifest`);
    }

    // VTT cue at 00:00:48.000 should be marked as a cue, not only interval.
    const row48 = rows.find((r) => r[1] === '48.000');
    assert.ok(row48, 'row for 48.000 must exist');
    assert.match(row48[2], /cue/, '48.000 should have a cue source');

    // Explicit cue 61.437 should be marked as a cue.
    const row61437 = rows.find((r) => r[1] === '61.437');
    assert.ok(row61437, 'row for 61.437 must exist');
    assert.equal(row61437[2], 'cue', '61.437 should be a cue');
  });
});
