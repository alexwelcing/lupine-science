#!/usr/bin/env node
// Validate every manifest in data/video-motion/:
// - JSON is well-formed
// - slug matches filename
// - every scene references an existing image
// - effects are known
// - durations are positive

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KENBURNS } from './lib/motion-effects.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_DIR = path.join(ROOT, 'data', 'video-motion');

let errors = 0;

const files = fs.readdirSync(MANIFEST_DIR).filter((f) => f.endsWith('.json'));
for (const file of files) {
  const slug = file.replace(/\.json$/, '');
  const p = path.join(MANIFEST_DIR, file);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`${file}: invalid JSON — ${e.message}`);
    errors++;
    continue;
  }

  if (manifest.slug !== slug) {
    console.error(`${file}: slug mismatch (“${manifest.slug}” vs filename “${slug}”)`);
    errors++;
  }

  if (!Array.isArray(manifest.scenes) || manifest.scenes.length === 0) {
    console.error(`${file}: missing or empty scenes`);
    errors++;
    continue;
  }

  for (let i = 0; i < manifest.scenes.length; i++) {
    const scene = manifest.scenes[i];
    if (!scene.image) {
      console.error(`${file}: scene ${i} missing image`);
      errors++;
      continue;
    }
    const imgPath = path.resolve(ROOT, scene.image);
    if (!fs.existsSync(imgPath)) {
      console.error(`${file}: scene ${i} missing image file ${scene.image}`);
      errors++;
    }
    if (typeof scene.duration !== 'number' || scene.duration <= 0) {
      console.error(`${file}: scene ${i} invalid duration ${scene.duration}`);
      errors++;
    }
    if (scene.effect && !KENBURNS[scene.effect]) {
      console.error(`${file}: scene ${i} unknown effect “${scene.effect}”`);
      errors++;
    }
  }
}

console.log(`Verified ${files.length} manifests; ${errors} error(s).`);
if (errors) process.exit(1);
