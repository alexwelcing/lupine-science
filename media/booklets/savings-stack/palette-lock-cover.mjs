#!/usr/bin/env node
// Palette-lock the Savings Stack cover art to the brand duotone.
// docs/brand-book.md §2.1: "Every generated image is paper + indigo + ink.
// If it drifts, palette-lock it to a warm-white→indigo duotone."
//
// Maps image luminance through a piecewise-linear gradient:
//   0   → ink   #16171d
//   128 → indigo #3d4db3
//   255 → paper #faf9f6
//
// Usage: node media/booklets/savings-stack/palette-lock-cover.mjs
// Input:  media/booklets/savings-stack/cover-raw.png (raw MiniMax output)
// Output: public/brand-assets/minimax/savings-stack-cover.png (brand-locked)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const INPUT = path.join(ROOT, 'media', 'booklets', 'savings-stack', 'cover-raw.png');
const OUTPUT = path.join(ROOT, 'public', 'brand-assets', 'minimax', 'savings-stack-cover.png');

const INK = [0x16, 0x17, 0x1d];
const INDIGO = [0x3d, 0x4d, 0xb3];
const PAPER = [0xfa, 0xf9, 0xf6];

function lerp(a, b, t) {
  return a.map((av, i) => Math.round(av + (b[i] - av) * t));
}

function duotone(v) {
  return v <= 128 ? lerp(INK, INDIGO, v / 128) : lerp(INDIGO, PAPER, (v - 128) / 127);
}

const { data, info } = await sharp(INPUT).grayscale().raw().toBuffer({ resolveWithObject: true });
const rgb = Buffer.alloc(info.width * info.height * 3);
for (let i = 0; i < data.length; i++) {
  const [r, g, b] = duotone(data[i]);
  rgb[i * 3] = r;
  rgb[i * 3 + 1] = g;
  rgb[i * 3 + 2] = b;
}
await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT);
console.log(`palette-locked ${info.width}x${info.height} → ${path.relative(ROOT, OUTPUT)}`);
