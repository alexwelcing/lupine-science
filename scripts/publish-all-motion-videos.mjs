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

    // Skip only on positive evidence that this film is already published from a
    // verified narration: a caption track that is a real transcript.
    //
    // The previous test was `mp4 larger than 4 MB`, on the theory that new renders
    // are bigger than old ones. File size says nothing about whether the audio
    // contains the script — every one of the corrupted films was comfortably over
    // 4 MB and would have been skipped as "already published".
    if (!force && fs.existsSync(outVideo) && fs.existsSync(outVtt)
        && /^NOTE Narration transcript\./m.test(fs.readFileSync(outVtt, 'utf8'))) {
      console.log(`${slug}: skipped (already published from a verified narration)`);
      skipped++;
      continue;
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
