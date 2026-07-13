#!/usr/bin/env node
// Build brand-compliant result graphics as SVGs from data/result-graphics.json.
// Output: public/result-graphics/<id>.svg

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'data', 'result-graphics.json');
const OUT_DIR = path.join(ROOT, 'public', 'result-graphics');

const TOKENS = {
  paper: '#faf9f6',
  paperDeep: '#f2efe7',
  ink: '#16171d',
  inkSoft: '#4c4e58',
  inkFaint: '#6e707a',
  indigo: '#3d4db3',
  indigoDeep: '#2e3a87',
  indigoWash: 'rgba(61,77,179,0.08)',
  rule: '#e2dfd4',
  serif: 'Newsreader, Georgia, serif',
  mono: 'IBM Plex Mono, ui-monospace, monospace',
};

const CATEGORY_COLORS = {
  reference: '#4c4e58',
  'low-gwp': '#3a8f5b',
  current: '#3d4db3',
  co2: '#4c4e58',
  methane: '#8a5e1f',
  halocarbon: '#3d4db3',
  n2o: '#6e707a',
};

function formatNumber(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildBarChart(g) {
  const margin = { top: 80, right: 40, bottom: 100, left: 64 };
  const width = g.width - margin.left - margin.right;
  const height = g.height - margin.top - margin.bottom;
  const max = Math.max(...g.data.map((d) => d.value));
  const barWidth = width / g.data.length * 0.6;
  const step = width / g.data.length;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}" width="${g.width}" height="${g.height}" role="img" aria-labelledby="${g.id}-title">
  <title id="${g.id}-title">${g.title}</title>
  <rect width="${g.width}" height="${g.height}" fill="${TOKENS.paper}"/>
  <text x="${margin.left}" y="42" font-family="${TOKENS.serif}" font-size="22" fill="${TOKENS.ink}" font-weight="500">${g.title}</text>
  <text x="${margin.left}" y="64" font-family="${TOKENS.mono}" font-size="11" fill="${TOKENS.inkFaint}" text-transform="uppercase" letter-spacing="0.06em">${g.subtitle}</text>
  <g transform="translate(${margin.left},${margin.top})">
    <line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${TOKENS.rule}" stroke-width="1"/>
`;

  for (const [i, d] of g.data.entries()) {
    const x = i * step + (step - barWidth) / 2;
    const barHeight = (d.value / max) * height;
    const y = height - barHeight;
    const color = CATEGORY_COLORS[d.category] || TOKENS.indigo;
    const labelInside = y < 22;
    const labelY = labelInside ? y + 16 : y - 8;
    const labelColor = labelInside ? TOKENS.paper : TOKENS.inkSoft;
    svg += `    <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${color}" rx="3"/>
    <text x="${(x + barWidth / 2).toFixed(2)}" y="${labelY.toFixed(2)}" text-anchor="middle" font-family="${TOKENS.mono}" font-size="11" fill="${labelColor}">${formatNumber(d.value)}</text>
`;
    const labelLines = wrapText(d.label, 10);
    labelLines.forEach((line, li) => {
      svg += `    <text x="${(x + barWidth / 2).toFixed(2)}" y="${(height + 18 + li * 14).toFixed(2)}" text-anchor="middle" font-family="${TOKENS.mono}" font-size="10" fill="${TOKENS.inkSoft}">${line}</text>
`;
    });
  }

  svg += `  </g>
  <text x="${margin.left}" y="${g.height - 28}" font-family="${TOKENS.mono}" font-size="9" fill="${TOKENS.inkFaint}">Source: ${g.source}</text>
  <text x="${margin.left}" y="${g.height - 14}" font-family="${TOKENS.serif}" font-size="10" fill="${TOKENS.inkSoft}" font-style="italic">${g.note}</text>
</svg>`;
  return svg;
}

function buildStackedBar(g) {
  const margin = { top: 80, right: 40, bottom: 100, left: 64 };
  const width = g.width - margin.left - margin.right;
  const height = g.height - margin.top - margin.bottom;
  const total = g.data.reduce((sum, d) => sum + d.value, 0);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}" width="${g.width}" height="${g.height}" role="img" aria-labelledby="${g.id}-title">
  <title id="${g.id}-title">${g.title}</title>
  <rect width="${g.width}" height="${g.height}" fill="${TOKENS.paper}"/>
  <text x="${margin.left}" y="42" font-family="${TOKENS.serif}" font-size="22" fill="${TOKENS.ink}" font-weight="500">${g.title}</text>
  <text x="${margin.left}" y="64" font-family="${TOKENS.mono}" font-size="11" fill="${TOKENS.inkFaint}" text-transform="uppercase" letter-spacing="0.06em">${g.subtitle}</text>
  <g transform="translate(${margin.left},${margin.top})">
    <line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${TOKENS.rule}" stroke-width="1"/>
    <rect x="0" y="${height * 0.25}" width="${width}" height="${height * 0.5}" fill="${TOKENS.paperDeep}" rx="4"/>
`;

  let x = 0;
  for (const d of g.data) {
    const w = (d.value / total) * width;
    const color = CATEGORY_COLORS[d.category] || TOKENS.indigo;
    svg += `    <rect x="${x.toFixed(2)}" y="${(height * 0.25).toFixed(2)}" width="${w.toFixed(2)}" height="${(height * 0.5).toFixed(2)}" fill="${color}" rx="2"/>
    <text x="${(x + w / 2).toFixed(2)}" y="${(height * 0.5 + 4).toFixed(2)}" text-anchor="middle" font-family="${TOKENS.mono}" font-size="12" fill="${TOKENS.paper}">${formatNumber(d.value)}</text>
`;
    const labelLines = wrapText(d.label, 8);
    labelLines.forEach((line, li) => {
      svg += `    <text x="${(x + w / 2).toFixed(2)}" y="${(height + 18 + li * 14).toFixed(2)}" text-anchor="middle" font-family="${TOKENS.mono}" font-size="10" fill="${TOKENS.inkSoft}">${line}</text>
`;
    });
    x += w;
  }

  svg += `  </g>
  <text x="${margin.left}" y="${g.height - 28}" font-family="${TOKENS.mono}" font-size="9" fill="${TOKENS.inkFaint}">Source: ${g.source}</text>
  <text x="${margin.left}" y="${g.height - 14}" font-family="${TOKENS.serif}" font-size="10" fill="${TOKENS.inkSoft}" font-style="italic">${g.note}</text>
</svg>`;
  return svg;
}

function buildFunnel(g) {
  const margin = { top: 80, right: 160, bottom: 100, left: 220 };
  const width = g.width - margin.left - margin.right;
  const height = g.height - margin.top - margin.bottom;
  const max = g.data[0].value;
  const step = height / g.data.length;
  const barHeight = step * 0.7;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}" width="${g.width}" height="${g.height}" role="img" aria-labelledby="${g.id}-title">
  <title id="${g.id}-title">${g.title}</title>
  <rect width="${g.width}" height="${g.height}" fill="${TOKENS.paper}"/>
  <text x="${margin.left}" y="42" font-family="${TOKENS.serif}" font-size="22" fill="${TOKENS.ink}" font-weight="500">${g.title}</text>
  <text x="${margin.left}" y="64" font-family="${TOKENS.mono}" font-size="11" fill="${TOKENS.inkFaint}" text-transform="uppercase" letter-spacing="0.06em">${g.subtitle}</text>
  <g transform="translate(${margin.left},${margin.top})">
`;

  for (const [i, d] of g.data.entries()) {
    const y = i * step + (step - barHeight) / 2;
    const barWidth = (d.value / max) * width;
    const opacity = 1 - i * 0.12;
    svg += `    <rect x="0" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${TOKENS.indigo}" opacity="${opacity.toFixed(2)}" rx="3"/>
    <text x="${(barWidth + 10).toFixed(2)}" y="${(y + barHeight / 2 + 4).toFixed(2)}" font-family="${TOKENS.mono}" font-size="11" fill="${TOKENS.inkSoft}">${formatNumber(d.value)} · ${d.share}%</text>
    <text x="-10" y="${(y + barHeight / 2 + 4).toFixed(2)}" text-anchor="end" font-family="${TOKENS.serif}" font-size="12" fill="${TOKENS.ink}">${d.label}</text>
`;
  }

  svg += `  </g>
  <text x="${margin.left}" y="${g.height - 28}" font-family="${TOKENS.mono}" font-size="9" fill="${TOKENS.inkFaint}">Source: ${g.source}</text>
  <text x="${margin.left}" y="${g.height - 14}" font-family="${TOKENS.serif}" font-size="10" fill="${TOKENS.inkSoft}" font-style="italic">${g.note}</text>
</svg>`;
  return svg;
}

function buildLineChart(g) {
  const margin = { top: 80, right: 40, bottom: 100, left: 64 };
  const width = g.width - margin.left - margin.right;
  const height = g.height - margin.top - margin.bottom;
  const max = Math.max(...g.data.map((d) => d.value));
  const min = Math.min(...g.data.map((d) => d.value));
  const range = max - min || 1;

  const points = g.data.map((d, i) => {
    const x = (i / (g.data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height * 0.8) - height * 0.1;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}" width="${g.width}" height="${g.height}" role="img" aria-labelledby="${g.id}-title">
  <title id="${g.id}-title">${g.title}</title>
  <rect width="${g.width}" height="${g.height}" fill="${TOKENS.paper}"/>
  <text x="${margin.left}" y="42" font-family="${TOKENS.serif}" font-size="22" fill="${TOKENS.ink}" font-weight="500">${g.title}</text>
  <text x="${margin.left}" y="64" font-family="${TOKENS.mono}" font-size="11" fill="${TOKENS.inkFaint}" text-transform="uppercase" letter-spacing="0.06em">${g.subtitle}</text>
  <g transform="translate(${margin.left},${margin.top})">
    <line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${TOKENS.rule}" stroke-width="1"/>
    <line x1="0" y1="0" x2="0" y2="${height}" stroke="${TOKENS.rule}" stroke-width="1"/>
    <path d="${pathD}" fill="none" stroke="${TOKENS.indigo}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
`;

  for (const p of points) {
    svg += `    <circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4" fill="${TOKENS.paper}" stroke="${TOKENS.indigo}" stroke-width="2"/>
    <text x="${p.x.toFixed(2)}" y="${(p.y - 12).toFixed(2)}" text-anchor="middle" font-family="${TOKENS.mono}" font-size="10" fill="${TOKENS.inkSoft}">${p.value}</text>
`;
  }

  svg += `  </g>
  <text x="${margin.left}" y="${g.height - 28}" font-family="${TOKENS.mono}" font-size="9" fill="${TOKENS.inkFaint}">Source: ${g.source}</text>
  <text x="${margin.left}" y="${g.height - 14}" font-family="${TOKENS.serif}" font-size="10" fill="${TOKENS.inkSoft}" font-style="italic">${g.note}</text>
</svg>`;
  return svg;
}

function buildGraphic(g) {
  switch (g.type) {
    case 'bar':
      return buildBarChart(g);
    case 'stacked-bar':
      return buildStackedBar(g);
    case 'funnel':
      return buildFunnel(g);
    case 'line':
      return buildLineChart(g);
    default:
      throw new Error(`Unknown graphic type: ${g.type}`);
  }
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const g of data.graphics) {
    const svg = buildGraphic(g);
    const outPath = path.join(OUT_DIR, `${g.id}.svg`);
    fs.writeFileSync(outPath, svg);
    console.log(`Wrote ${outPath}`);
  }

  // Write an index manifest for consumers
  const manifest = data.graphics.map((g) => ({
    id: g.id,
    title: g.title,
    src: `/result-graphics/${g.id}.svg`,
  }));
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${path.join(OUT_DIR, 'index.json')}`);
}

main();
