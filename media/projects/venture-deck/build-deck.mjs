#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderDeckPdf } from '../../../scripts/venture-deck-tools.mjs';

const PROJECT = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(PROJECT, '../../..');

function parseArgs(argv) {
  const supplied = new Set();
  const options = {
    htmlPath: path.join(PROJECT, 'index.html'),
    pdfPath: path.join(PROJECT, 'lupine-science-venture-deck.pdf'),
    webRoot: path.join(ROOT, 'public'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      console.log('Usage: node media/projects/venture-deck/build-deck.mjs [--html <path>] [--pdf <path>] [--web-root <path>]');
      process.exit(0);
    }
    if (argument !== '--html' && argument !== '--pdf' && argument !== '--web-root') throw new Error(`unknown argument: ${argument}`);
    supplied.add(argument);
    const value = argv[index + 1];
    if (!value) throw new Error(`${argument} requires a path`);
    if (argument === '--html') options.htmlPath = path.resolve(value);
    else if (argument === '--pdf') options.pdfPath = path.resolve(value);
    else options.webRoot = path.resolve(value);
    index += 1;
  }
  if (!supplied.has('--html') || !supplied.has('--pdf')) throw new Error('--html and --pdf must be provided together for fixture rendering');
  return options;
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.warn('[deprecated] build-deck.mjs without explicit paths routes to the canonical venture builder; prefer `npm run venture:build`.');
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts/build-venture-deck.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
}

try {
  const options = parseArgs(args);
  const report = await renderDeckPdf(options);
  console.log(`rendered ${report.slideCount} slides to ${report.pdfPath} (${report.pageCount} pages)`);
} catch (error) {
  console.error(error.stack || error.message || error);
  process.exit(1);
}
