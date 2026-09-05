#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = { source: null, candidate: null, remove: null, output: null, minCorrelation: 0.99 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source') flags.source = path.resolve(args[++i]);
    else if (args[i] === '--candidate') flags.candidate = path.resolve(args[++i]);
    else if (args[i] === '--remove') flags.remove = args[++i].split(':').map(Number);
    else if (args[i] === '--output') flags.output = path.resolve(args[++i]);
    else if (args[i] === '--min-correlation') flags.minCorrelation = Number(args[++i]);
  }
  if (!flags.source || !flags.candidate || !flags.output || flags.remove?.length !== 2 || flags.remove.some((n) => !Number.isFinite(n))) {
    throw new Error('Usage: verify-audio-excision.mjs --source <audio> --candidate <media> --remove <start:end> --output <json> [--min-correlation 0.99]');
  }
  return flags;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || result.stdout || '').slice(-3000)}`);
}

function floats(buffer) {
  return new Float32Array(buffer.buffer, buffer.byteOffset, Math.floor(buffer.byteLength / 4));
}

function correlationAt(x, y, shift, start = 0, length = Infinity) {
  const xs = start + Math.max(0, -shift);
  const ys = start + Math.max(0, shift);
  const count = Math.min(length, x.length - xs, y.length - ys);
  let dot = 0;
  let sumX = 0;
  let sumY = 0;
  let mse = 0;
  for (let i = 0; i < count; i++) {
    const a = x[xs + i];
    const b = y[ys + i];
    dot += a * b;
    sumX += a * a;
    sumY += b * b;
    mse += (a - b) ** 2;
  }
  return {
    correlation: sumX && sumY ? dot / Math.sqrt(sumX * sumY) : 0,
    meanSquaredError: count ? mse / count : Infinity,
    count,
  };
}

async function main() {
  const flags = parseArgs();
  const [start, end] = flags.remove;
  if (!(start >= 0 && end > start)) throw new Error(`Invalid excision interval ${start}:${end}`);
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'lupine-audio-excision-'));
  const expectedFile = path.join(temporary, 'expected.f32');
  const actualFile = path.join(temporary, 'actual.f32');
  try {
    run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', flags.source,
      '-filter_complex',
      `[0:a]atrim=start=0:end=${start},asetpts=PTS-STARTPTS[a0];[0:a]atrim=start=${end},asetpts=PTS-STARTPTS[a1];[a0][a1]concat=n=2:v=0:a=1,aresample=44100,aformat=channel_layouts=mono[out]`,
      '-map', '[out]', '-f', 'f32le', expectedFile,
    ]);
    run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', flags.candidate,
      '-ar', '44100', '-ac', '1', '-f', 'f32le', actualFile,
    ]);

    const expected = floats(await fs.readFile(expectedFile));
    const actual = floats(await fs.readFile(actualFile));
    const midpoint = Math.min(4_800_000, Math.floor(Math.min(expected.length, actual.length) / 2));
    const window = Math.min(120_000, expected.length - midpoint - 4096, actual.length - midpoint - 4096);
    let best = { correlation: -Infinity, shift: 0 };
    for (let shift = -2048; shift <= 2048; shift += 16) {
      const score = correlationAt(expected, actual, shift, midpoint, window);
      if (score.correlation > best.correlation) best = { correlation: score.correlation, shift };
    }
    const whole = correlationAt(expected, actual, best.shift);
    const decision = whole.correlation >= flags.minCorrelation ? 'pass' : 'fail';
    const report = {
      schemaVersion: 1,
      decision,
      source: flags.source,
      candidate: flags.candidate,
      removedIntervalSeconds: [start, end],
      removedDurationSeconds: end - start,
      expectedSamples: expected.length,
      actualSamples: actual.length,
      bestAlignmentSamples: best.shift,
      decodedPcmCorrelation: whole.correlation,
      meanSquaredError: whole.meanSquaredError,
      minimumCorrelation: flags.minCorrelation,
    };
    await fs.mkdir(path.dirname(flags.output), { recursive: true });
    await fs.writeFile(flags.output, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Audio excision ${decision.toUpperCase()}: correlation ${whole.correlation.toFixed(8)} (minimum ${flags.minCorrelation})`);
    if (decision !== 'pass') process.exitCode = 1;
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
