#!/usr/bin/env node
// Publish motion + voice videos for every manifest in data/video-motion/.
//
// Usage:
//   node scripts/publish-all-motion-videos.mjs
//   node scripts/publish-all-motion-videos.mjs --force
//   node scripts/publish-all-motion-videos.mjs --tts-provider fal
//
// Only manifests with a recovered narration script in data/narration-scripts/
// are publishable; the rest are reported as skipped rather than narrated from
// whatever text happened to be lying around.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');
const SCRIPT_DIR = path.join(ROOT, 'data', 'narration-scripts');

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...options });
  return r;
}

function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes('--force');
  const providerIdx = argv.indexOf('--tts-provider');
  const providerName = providerIdx >= 0 ? argv[providerIdx + 1] : undefined;

  const slugs = fs.readdirSync(MANIFEST_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();

  let built = 0;
  let skipped = 0;
  let failed = 0;

  for (const slug of slugs) {
    const outVideo = path.join(VIDEOS_DIR, `${slug}.mp4`);
    const outVtt = path.join(VIDEOS_DIR, `${slug}.vtt`);
    const scriptPath = path.join(SCRIPT_DIR, `${slug}.json`);

    if (!fs.existsSync(scriptPath)) {
      console.log(`${slug}: skipped (no narration script at ${path.relative(ROOT, scriptPath)})`);
      skipped++;
      continue;
    }

    // Skip only on positive evidence that this film PASSED its release checks. The
    // marker is written by the publisher only after the poster and the audio release
    // gate have both succeeded, and it records the MP4's sha256.
    //
    // Two earlier versions of this test both failed open:
    //   1. `mp4 larger than 4 MB`, on the theory that new renders are bigger. File
    //      size says nothing about whether the audio contains the script — every
    //      corrupted film was comfortably over 4 MB and was skipped as "published".
    //   2. `mp4 + vtt exist and the vtt carries the NOTE`. The publisher writes that
    //      NOTE before buildPoster and before the gate, so a film that FAILED the
    //      gate still satisfied it: the next run skipped it and exited 0, leaving a
    //      rejected artifact live.
    //
    // Evidence of intent is not evidence of success — only a post-gate record is.
    //
    // The previous test was "mp4 and vtt exist and the vtt carries the NOTE". That
    // fails open: the publisher writes the NOTE before buildPoster and before the
    // gate, so a film that FAILED the gate still satisfied it. The next batch run
    // skipped that film as "already published from a verified narration" and exited
    // 0, leaving a rejected artifact live. Evidence of intent is not evidence of
    // success — only a post-gate record is.
    //
    // Hashing the MP4 also means a re-render invalidates the marker automatically
    // rather than inheriting the previous run's pass.
    if (!force && fs.existsSync(outVideo) && fs.existsSync(outVtt)) {
      const marker = path.join(ROOT, 'data', 'video-motion', 'published', `${slug}.json`);
      if (fs.existsSync(marker)) {
        let record;
        try { record = JSON.parse(fs.readFileSync(marker, 'utf8')); } catch { record = null; }
        const actual = crypto.createHash('sha256').update(fs.readFileSync(outVideo)).digest('hex');
        if (record?.mp4_sha256 === actual) {
          console.log(`${slug}: skipped (gate passed for this exact mp4, ${record.narration_wpm} wpm)`);
          skipped++;
          continue;
        }
        console.log(`${slug}: republishing — marker does not match the mp4 on disk`);
      }
    }

    console.log(`\n=== ${slug} ===`);
    const r = run('node', [
      'scripts/publish-article-motion-video.mjs',
      '--slug', slug,
      ...(providerName ? ['--tts-provider', providerName] : []),
    ]);
    if (r.status !== 0) {
      console.error(`FAILED: ${slug}`);
      console.error(r.stderr || r.stdout);
      failed++;
    } else {
      console.log(r.stdout);
      built++;
    }
  }

  console.log(`\nPublished: ${built}, skipped: ${skipped}, failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main();
