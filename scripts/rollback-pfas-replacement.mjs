#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = 'critical-minerals-pfas-and-the-remediation-imperative';
const manifestPath = path.join(ROOT, 'release', 'video-replacements', `${slug}.json`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const rollbackPaths = [
  `articles/${slug}.md`,
  `public/videos/${slug}.mp4`,
  `public/videos/${slug}.vtt`,
  `public/videos/${slug}-poster.jpg`,
  `public/videos/${slug}-poster.avif`,
  `public/videos/${slug}-poster.webp`,
];

if (manifest.sourceMainCommit !== 'e0cccacca7e8050d6fb6d208cce3248689653532') {
  throw new Error('Refusing PFAS rollback: pinned baseline commit drifted');
}
if (manifest.releaseState !== 'replacement-active') {
  throw new Error(`Refusing PFAS rollback from state: ${manifest.releaseState}`);
}

execFileSync('git', ['restore', '--source', manifest.sourceMainCommit, '--worktree', '--', ...rollbackPaths], {
  cwd: ROOT,
  stdio: 'inherit',
});
manifest.releaseState = 'baseline-rollback';
manifest.rollback.executedAt = new Date().toISOString();
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('PFAS baseline bytes restored. Run npm run build && npm run verify, then commit and redeploy through protected environments.');
