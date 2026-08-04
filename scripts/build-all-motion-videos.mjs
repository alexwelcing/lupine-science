#!/usr/bin/env node
// Batch-render motion videos for every manifest in data/video-motion/.
//
// Usage:
//   node scripts/build-all-motion-videos.mjs
//   node scripts/build-all-motion-videos.mjs --force

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');
const OUT_DIR = path.join(ROOT, 'media', 'projects', 'video-motion', 'renders');

function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    cwd: ROOT,
    ...options,
  });
  return r;
}

function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifests = fs.readdirSync(MANIFEST_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();

  let built = 0;
  let skipped = 0;
  let failed = 0;

  for (const slug of manifests) {
    const out = path.join(OUT_DIR, `${slug}-motion.mp4`);
    if (!force && fs.existsSync(out)) {
      console.log(`${slug}: skipped (already rendered)`);
      skipped++;
      continue;
    }
    console.log(`${slug}: rendering...`);
    const r = run('node', [
      'scripts/build-article-motion-video.mjs',
      '--slug', slug,
      '--out', out,
    ]);
    if (r.status !== 0) {
      console.error(`${slug}: failed`);
      console.error(r.stderr || r.stdout);
      failed++;
    } else {
      console.log(`${slug}: wrote ${out}`);
      built++;
    }
  }

  console.log(`\nBuilt: ${built}, skipped: ${skipped}, failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main();
