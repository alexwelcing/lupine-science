#!/usr/bin/env node
// Publish motion + voice videos for every manifest in data/video-motion/.
//
// Usage:
//   node scripts/publish-all-motion-videos.mjs
//   node scripts/publish-all-motion-videos.mjs --force

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...options });
  return r;
}

function main() {
  const force = process.argv.includes('--force');
  const slugs = fs.readdirSync(MANIFEST_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();

  let built = 0;
  let skipped = 0;
  let failed = 0;

  for (const slug of slugs) {
    const outVideo = path.join(VIDEOS_DIR, `${slug}.mp4`);
    if (!force && fs.existsSync(outVideo)) {
      const stat = fs.statSync(outVideo);
      // Skip if the file was created after the motion pipeline existed (heuristic:
      // larger than a typical old video). Old videos were ~2-4 MB; new renders
      // with motion are 4-8 MB.
      if (stat.size > 4 * 1024 * 1024) {
        console.log(`${slug}: skipped (already published)`);
        skipped++;
        continue;
      }
    }
    console.log(`\n=== ${slug} ===`);
    const r = run('node', [
      'scripts/publish-article-motion-video.mjs',
      '--slug', slug,
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
