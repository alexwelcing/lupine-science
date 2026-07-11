#!/usr/bin/env node

import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const PAGES_MAX_ASSET_BYTES = 25 * 1024 * 1024;
const DEFAULT_DIRECTORY = resolve(process.argv[2] ?? 'public/videos');
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && VIDEO_EXTENSIONS.has(extname(entry.name).toLowerCase())) files.push(path);
  }

  return files;
}

function formatMiB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

let files;
try {
  files = await walk(DEFAULT_DIRECTORY);
} catch (error) {
  console.error(`Unable to inspect ${DEFAULT_DIRECTORY}: ${error.message}`);
  process.exit(2);
}

const assets = await Promise.all(files.map(async (path) => ({
  path,
  bytes: (await stat(path)).size,
})));
assets.sort((left, right) => right.bytes - left.bytes);

const oversized = assets.filter(({ bytes }) => bytes > PAGES_MAX_ASSET_BYTES);
const totalBytes = assets.reduce((sum, { bytes }) => sum + bytes, 0);

console.log(`Video hosting audit: ${relative(process.cwd(), DEFAULT_DIRECTORY) || '.'}`);
console.log(`Assets: ${assets.length}`);
console.log(`Total video volume: ${formatMiB(totalBytes)}`);
console.log(`Cloudflare Pages per-asset ceiling: ${formatMiB(PAGES_MAX_ASSET_BYTES)}`);

for (const asset of assets) {
  const marker = asset.bytes > PAGES_MAX_ASSET_BYTES ? 'OVER LIMIT' : 'ok';
  console.log(`- ${relative(process.cwd(), asset.path)}: ${formatMiB(asset.bytes)} (${marker})`);
}

if (oversized.length > 0) {
  console.error(`\nR2 migration required: ${oversized.length} video asset(s) exceed the Pages 25 MiB limit.`);
  process.exit(1);
}

console.log('\nPages remains valid: every current video is within the 25 MiB per-asset limit.');
console.log('Use R2 when any final encode exceeds 25 MiB, or earlier if independent media deploys are operationally preferable.');
