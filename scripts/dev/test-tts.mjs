#!/usr/bin/env node
// Smoke-test a TTS provider and show the verification numbers it would be judged on.
//
// Replaces the old scripts/dev/test-fal-tts.mjs, which could only test FAL and
// only listened to the result — it reported "wrote N bytes" and nothing about
// whether the audio contained the script. That is how truncation went unnoticed.
//
// Usage:
//   node scripts/dev/test-tts.mjs
//   node scripts/dev/test-tts.mjs --tts-provider fal
//   node scripts/dev/test-tts.mjs --text "..." --voice English_expressive_narrator
//   node scripts/dev/test-tts.mjs --slug a-field-not-a-neural-net   # real script, one call

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProvider, narratorVoice, PROVIDERS } from '../lib/tts-provider.mjs';
import { measureTrack, MIN_LENGTH_RATIO, MAX_LENGTH_RATIO } from '../lib/verify-narration.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(ROOT, 'media', 'projects', 'voice-tracks', 'smoke');

const DEFAULT_TEXT = 'Corrected barriers can expose rare sites that break this trap, '
  + 'and open lower-temperature methanol or cleaner hydrogen routes.';

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

async function main() {
  const argv = process.argv.slice(2);
  const providerName = arg(argv, '--tts-provider');
  const voiceArg = arg(argv, '--voice');
  const slug = arg(argv, '--slug');

  // Show credential status for every provider first: "which providers can I use
  // right now" is the question you actually have when one vendor is down.
  console.log('Provider credentials:');
  for (const p of Object.values(PROVIDERS)) {
    console.log(`  ${p.id.padEnd(8)} ${p.credentials() ? 'available' : 'MISSING — ' + p.hint}`);
  }
  console.log('');

  let text = arg(argv, '--text') || DEFAULT_TEXT;
  if (slug) {
    const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'narration-scripts', `${slug}.json`), 'utf8'));
    text = doc.paragraphs.join(' ');
  }

  const provider = resolveProvider(providerName);
  const voice = narratorVoice(provider, voiceArg);
  const outPath = path.join(OUT_DIR, `tts-smoke-${provider.id}-${voice}.${provider.extension}`);

  console.log(`Provider ${provider.id} (${provider.model}), voice ${voice}`);
  console.log(`Input: ${text.trim().split(/\s+/).length} words / ${text.length} chars`);
  const started = Date.now();
  const meta = await provider.synthesize({ text, voice, outPath });
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  const m = measureTrack({ text, audioPath: outPath });
  console.log(`Wrote ${path.relative(ROOT, outPath)} in ${elapsed}s (${m.bytes} bytes)`);
  if (meta.reportedMs !== null) console.log(`Provider-reported length: ${(meta.reportedMs / 1000).toFixed(2)}s`);
  console.log(`Measured duration:  ${m.actualSeconds.toFixed(2)}s`);
  console.log(`Expected duration:  ${m.expectedSeconds.toFixed(2)}s`);
  console.log(`Length ratio:       ${(m.ratio * 100).toFixed(1)}% (accept ${MIN_LENGTH_RATIO * 100}-${MAX_LENGTH_RATIO * 100}%)`);
  console.log(`Measured rate:      ${m.measuredWpm} wpm`);
  console.log(m.ok ? 'VERDICT: would be ACCEPTED' : 'VERDICT: would be REJECTED');
  if (!m.ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
