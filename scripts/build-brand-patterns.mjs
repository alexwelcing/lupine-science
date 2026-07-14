#!/usr/bin/env node
// Procedural brand motif patterns for Lupine Science.
// Output: public/brand-assets/patterns/<id>.svg
// These are pure-vector, palette-locked, text-free patterns suitable for
// slide backgrounds, article section dividers, and deck overlays.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'brand-assets', 'patterns');

const TOKENS = {
  paper: '#faf9f6',
  ink: '#16171d',
  indigo: '#3d4db3',
  indigoWash: 'rgba(61,77,179,0.10)',
  rule: '#e2dfd4',
};

function svgOpen({ width, height, id, title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="${id}-title">
  <title id="${id}-title">${title}</title>
  <rect width="${width}" height="${height}" fill="${TOKENS.paper}"/>`;
}

function svgClose() {
  return '\n</svg>';
}

function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function ribbonPath(width, height, amplitude, frequency, phase) {
  const points = [];
  for (let x = 0; x <= width; x += 4) {
    const y = height / 2 + Math.sin((x / width) * Math.PI * frequency + phase) * amplitude;
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M ${points.join(' L ')}`;
}

function buildHyperRibbon() {
  const width = 1920;
  const height = 1080;
  let svg = svgOpen({ width, height, id: 'hyper-ribbon', title: 'Hyper-ribbon manifold' });

  // faint error vectors
  const r = rand(42);
  for (let i = 0; i < 90; i++) {
    const x = r() * width;
    const y = r() * height;
    const len = 20 + r() * 60;
    const angle = (r() - 0.5) * 1.2; // converge toward horizontal
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len * 0.3;
    const opacity = 0.12 + r() * 0.14;
    svg += `\n  <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${TOKENS.indigo}" stroke-width="1.2" opacity="${opacity.toFixed(2)}"/>`;
  }

  // central ribbon
  const ribbon = ribbonPath(width, height, 120, 2.5, 0.4);
  svg += `\n  <path d="${ribbon}" fill="none" stroke="${TOKENS.indigo}" stroke-width="5" stroke-linecap="round" opacity="0.9"/>`;
  svg += `\n  <path d="${ribbon}" fill="none" stroke="${TOKENS.indigo}" stroke-width="28" stroke-linecap="round" opacity="0.14"/>`;
  svg += `\n  <path d="${ribbon}" fill="none" stroke="${TOKENS.paper}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`;

  svg += svgClose();
  return { id: 'hyper-ribbon', svg };
}

function buildErrorVectors() {
  const width = 1600;
  const height = 900;
  let svg = svgOpen({ width, height, id: 'error-vectors', title: 'Error vectors aligning' });

  const r = rand(7);
  const centerY = height / 2;
  const centerX = width * 0.72;
  const rows = 11;
  const cols = 14;
  const gapX = width * 0.45 / cols;
  const gapY = height * 0.7 / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = 80 + i * gapX + (r() - 0.5) * 12;
      const y = centerY - (rows * gapY) / 2 + j * gapY + (r() - 0.5) * 12;
      const targetX = centerX + (r() - 0.5) * 40;
      const targetY = centerY + (r() - 0.5) * 30;
      const dx = targetX - x;
      const dy = targetY - y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const maxLen = 90 + r() * 70;
      const scale = Math.min(len, maxLen) / len;
      const x2 = x + dx * scale;
      const y2 = y + dy * scale;
      const opacity = 0.16 + (i / cols) * 0.28;
      const strokeWidth = 1 + (i / cols) * 1.4;
      svg += `\n  <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${TOKENS.indigo}" stroke-width="${strokeWidth.toFixed(1)}" opacity="${opacity.toFixed(2)}" stroke-linecap="round"/>`;
      svg += `\n  <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="${(1.5 + (i / cols)).toFixed(1)}" fill="${TOKENS.indigo}" opacity="${opacity.toFixed(2)}"/>`;
    }
  }

  // alignment point
  svg += `\n  <circle cx="${centerX}" cy="${centerY}" r="6" fill="${TOKENS.indigo}" opacity="0.9"/>`;
  svg += `\n  <circle cx="${centerX}" cy="${centerY}" r="28" fill="none" stroke="${TOKENS.indigo}" stroke-width="1.5" opacity="0.25"/>`;

  svg += svgClose();
  return { id: 'error-vectors', svg };
}

function buildLatticeDots() {
  const width = 1200;
  const height = 1200;
  let svg = svgOpen({ width, height, id: 'lattice-dots', title: 'Subtle lattice dot pattern' });

  const spacing = 48;
  const r = rand(99);
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      const jitterX = (r() - 0.5) * 6;
      const jitterY = (r() - 0.5) * 6;
      const opacity = 0.06 + r() * 0.08;
      const radius = 1.2 + r() * 1.6;
      svg += `\n  <circle cx="${(x + jitterX).toFixed(1)}" cy="${(y + jitterY).toFixed(1)}" r="${radius.toFixed(1)}" fill="${TOKENS.indigo}" opacity="${opacity.toFixed(2)}"/>`;
    }
  }

  svg += svgClose();
  return { id: 'lattice-dots', svg };
}

function buildDarkRibbon() {
  const width = 1920;
  const height = 1080;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="dark-ribbon-title">
  <title id="dark-ribbon-title">Hyper-ribbon manifold on dark ground</title>
  <rect width="${width}" height="${height}" fill="#0b0c10"/>`;

  const r = rand(21);
  for (let i = 0; i < 100; i++) {
    const x = r() * width;
    const y = r() * height;
    const len = 20 + r() * 70;
    const angle = (r() - 0.5) * 1.1;
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len * 0.3;
    const opacity = 0.08 + r() * 0.12;
    svg += `\n  <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6b7ff7" stroke-width="1" opacity="${opacity.toFixed(2)}"/>`;
  }

  const ribbon = ribbonPath(width, height, 140, 2.4, 0.3);
  svg += `\n  <path d="${ribbon}" fill="none" stroke="#6b7ff7" stroke-width="5" stroke-linecap="round" opacity="0.95"/>`;
  svg += `\n  <path d="${ribbon}" fill="none" stroke="#6b7ff7" stroke-width="34" stroke-linecap="round" opacity="0.16"/>`;
  svg += `\n  <path d="${ribbon}" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>`;

  svg += svgClose();
  return { id: 'dark-ribbon', svg };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const patterns = [
    buildHyperRibbon(),
    buildErrorVectors(),
    buildLatticeDots(),
    buildDarkRibbon(),
  ];

  const manifest = [];
  for (const { id, svg } of patterns) {
    const outPath = path.join(OUT_DIR, `${id}.svg`);
    fs.writeFileSync(outPath, svg);
    console.log(`Wrote ${outPath}`);
    manifest.push({ id, src: `/brand-assets/patterns/${id}.svg`, title: svg.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] || id });
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${path.join(OUT_DIR, 'index.json')}`);
}

main();
