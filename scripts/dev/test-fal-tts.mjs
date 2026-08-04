#!/usr/bin/env node
// Smoke-test FAL TTS (Orpheus) for a deep-calm explainer voice.
import { fal } from '@fal-ai/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'media', 'projects', 'voice-tests');

if (!process.env.FAL_KEY) {
  console.error('Set FAL_KEY environment variable.');
  process.exit(1);
}

const text = process.argv[2] || 'Lupine Science routes synthesizable materials from prediction to production.';
const voice = process.argv[3] || 'dan';

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`Testing FAL Orpheus TTS with voice “${voice}”...`);
  const result = await fal.subscribe('fal-ai/orpheus-tts', {
    input: { text, voice, temperature: 0.6, repetition_penalty: 1.2 },
    logs: true,
  });
  const url = result.data?.audio?.url;
  if (!url) {
    console.error('No audio URL in response:', JSON.stringify(result.data, null, 2));
    process.exit(1);
  }
  const wavPath = path.join(OUT, `fal-tts-test-${voice}.wav`);
  const mp3Path = path.join(OUT, `fal-tts-test-${voice}.mp3`);

  const wavRes = await fetch(url);
  const buf = Buffer.from(await wavRes.arrayBuffer());
  fs.writeFileSync(wavPath, buf);

  // Convert to MP3/AAC for web preview.
  const r = spawnSync('ffmpeg', ['-y', '-i', wavPath, '-c:a', 'libmp3lame', '-q:a', '4', mp3Path], {
    encoding: 'utf8',
    cwd: ROOT,
  });
  if (r.status !== 0) {
    console.error('ffmpeg conversion failed:', r.stderr);
    process.exit(1);
  }

  const probe = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    mp3Path,
  ], { encoding: 'utf8', cwd: ROOT });

  console.log(`Wrote ${wavPath} (${buf.length} bytes)`);
  console.log(`Wrote ${mp3Path}`);
  console.log(`Duration: ${Number(probe.stdout.trim()).toFixed(2)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
