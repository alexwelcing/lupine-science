#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDeckArtifacts } from '../../../scripts/venture-deck-tools.mjs';

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
      console.log('Usage: node media/projects/venture-deck/validate-deck.mjs [--html <path>] [--pdf <path>] [--web-root <path>]');
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
  if (argv.length > 0 && (!supplied.has('--html') || !supplied.has('--pdf'))) throw new Error('--html and --pdf must be provided together for fixture validation');
  return options;
}

try {
  const report = await validateDeckArtifacts(parseArgs(process.argv.slice(2)));
  console.log(`validated ${report.slideCount} slides, ${report.pageCount} PDF pages, ${report.externalRequests.length} external requests, ${report.overflowIssues.length} overflow issues`);
} catch (error) {
  console.error(error.stack || error.message || error);
  process.exit(1);
}
