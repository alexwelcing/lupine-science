#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, PDFName } from 'pdf-lib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_PDF = path.join(ROOT, 'public', 'proof-pack-climate-series.pdf');
const DEFAULT_EXPECTATIONS = path.join(ROOT, 'tests', 'fixtures', 'pdf-qa-expectations.json');

function command(name, args) {
  const result = spawnSync(name, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error?.code === 'ENOENT') {
    throw new Error(`missing required PDF QA tool: ${name}`);
  }
  if (result.status !== 0) {
    throw new Error(`${name} failed (${result.status}): ${result.stderr.trim()}`);
  }
  return result.stdout;
}

export function parsePdfInfo(output) {
  return Object.fromEntries(output.split('\n').flatMap((line) => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    return match ? [[match[1].trim(), match[2].trim()]] : [];
  }));
}

export function parseFontRows(output) {
  return output.split('\n').flatMap((line) => {
    const match = line.match(/^(.+?)\s+(yes|no)\s+(yes|no)\s+(yes|no)\s+\d+\s+\d+\s*$/);
    if (!match || match[1].startsWith('name ') || match[1].startsWith('-')) return [];
    const prefix = match[1].trim();
    const name = prefix.split(/\s+/)[0];
    return [{ name, description: prefix.slice(name.length).trim(), embedded: match[2], subset: match[3], unicode: match[4] }];
  });
}

export function sparseTextPages(text) {
  const pages = text.split('\f');
  if (!pages.at(-1)?.trim()) pages.pop();
  return pages.flatMap((page, index) => {
    const normalized = page.replace(/\s+/g, ' ').trim();
    return /^(?:\d+)?$/.test(normalized) ? [index + 1] : [];
  });
}

function decodePdfString(value) {
  if (!value) return '';
  if (typeof value.decodeText === 'function') return value.decodeText();
  return value.toString().replace(/^\(|\)$/g, '');
}

export async function inspectAnnotations(bytes) {
  const document = await PDFDocument.load(bytes);
  const uris = [];
  let namedLinks = 0;

  for (const [pageIndex, page] of document.getPages().entries()) {
    const annotations = page.node.Annots();
    if (!annotations) continue;
    for (let index = 0; index < annotations.size(); index++) {
      const annotation = document.context.lookup(annotations.get(index));
      const action = annotation?.lookup?.(PDFName.of('A'));
      const actionType = action?.get?.(PDFName.of('S'))?.toString();
      if (actionType === '/URI') {
        uris.push({ page: pageIndex + 1, uri: decodePdfString(action.get(PDFName.of('URI'))) });
      }
      if (annotation?.get?.(PDFName.of('Dest'))) namedLinks++;
    }
  }

  const hasDestinationCatalog = Boolean(
    document.catalog.get(PDFName.of('Dests')) || document.catalog.get(PDFName.of('Names'))
  );
  return {
    annotationUris: uris,
    namedLinks,
    unresolvedNamedLinks: hasDestinationCatalog ? null : namedLinks,
  };
}

export async function inspectPdf(pdfPath, expectationsPath = DEFAULT_EXPECTATIONS) {
  if (!fs.existsSync(pdfPath)) throw new Error(`PDF not found: ${pdfPath}`);
  const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));
  const bytes = fs.readFileSync(pdfPath);
  const info = parsePdfInfo(command('pdfinfo', [pdfPath]));
  const fonts = parseFontRows(command('pdffonts', [pdfPath]));
  const text = command('pdftotext', ['-layout', pdfPath, '-']);
  const normalizedText = text.replace(/\s+/g, ' ');
  const annotations = await inspectAnnotations(bytes);
  const failures = [];
  const warnings = [];

  if (Number(info.Pages) < expectations.minimumPages) {
    failures.push(`expected at least ${expectations.minimumPages} pages, found ${info.Pages}`);
  }
  if (info['Page size'] !== expectations.pageSize) {
    failures.push(`expected ${expectations.pageSize}, found ${info['Page size']}`);
  }
  if (!fonts.length) failures.push('no fonts reported by pdffonts');
  for (const font of fonts) {
    if (font.embedded !== 'yes') failures.push(`font is not embedded: ${font.name}`);
    if (font.unicode !== 'yes') failures.push(`font lacks a Unicode map: ${font.name}`);
  }
  for (const marker of expectations.requiredText) {
    const normalizedMarker = marker.replace(/\s+/g, ' ');
    if (!normalizedText.includes(normalizedMarker)) {
      failures.push(`extracted text is missing required marker: ${JSON.stringify(marker)}`);
    }
  }
  for (const forbidden of expectations.forbiddenText) {
    if (text.includes(forbidden)) failures.push(`extracted text contains forbidden marker: ${JSON.stringify(forbidden)}`);
  }

  const sparsePages = sparseTextPages(text);
  if (sparsePages.length) warnings.push(`blank/page-number-only pages: ${sparsePages.join(', ')}`);
  if (info.Tagged !== 'yes') warnings.push('PDF is not tagged for accessibility');
  if (info.Optimized !== 'yes') warnings.push('PDF is not linearized/optimized for web delivery');
  const type3 = [...new Set(fonts.filter((font) => font.description.includes('Type 3')).map((font) => font.name))];
  if (type3.length) warnings.push(`Type 3 fonts require print-engine spot checks: ${type3.join(', ')}`);
  const localUris = annotations.annotationUris.filter(({ uri }) => /^(?:https?:\/\/)?(?:127\.0\.0\.1|localhost)(?::|\/|$)/i.test(uri));
  if (localUris.length) warnings.push(`${localUris.length} link annotations target localhost/127.0.0.1`);
  if (annotations.unresolvedNamedLinks) {
    warnings.push(`${annotations.unresolvedNamedLinks} named link annotations have no destination catalog`);
  }

  return {
    file: path.relative(ROOT, pdfPath),
    bytes: bytes.length,
    info,
    fonts: {
      rows: fonts.length,
      uniqueNames: [...new Set(fonts.map((font) => font.name))],
      allEmbedded: fonts.every((font) => font.embedded === 'yes'),
      allUnicodeMapped: fonts.every((font) => font.unicode === 'yes'),
      type3,
    },
    text: {
      characters: text.length,
      requiredMarkers: expectations.requiredText,
      sparsePages,
    },
    annotations: { ...annotations, localUris },
    failures,
    warnings,
  };
}

function parseArgs(argv) {
  const options = { pdfPath: DEFAULT_PDF, expectationsPath: DEFAULT_EXPECTATIONS, reportPath: '', strict: false };
  const args = [...argv];
  while (args.length) {
    const arg = args.shift();
    if (arg === '--strict') options.strict = true;
    else if (arg === '--report') options.reportPath = path.resolve(ROOT, args.shift());
    else if (arg === '--expectations') options.expectationsPath = path.resolve(ROOT, args.shift());
    else if (arg.startsWith('-')) throw new Error(`unknown option: ${arg}`);
    else options.pdfPath = path.resolve(ROOT, arg);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = await inspectPdf(options.pdfPath, options.expectationsPath);
  if (options.reportPath) {
    fs.mkdirSync(path.dirname(options.reportPath), { recursive: true });
    fs.writeFileSync(options.reportPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(`PDF: ${report.file}`);
  console.log(`Pages: ${report.info.Pages}; size: ${report.info['Page size']}; bytes: ${report.bytes}`);
  console.log(`Fonts: ${report.fonts.rows} rows; embedded=${report.fonts.allEmbedded}; Unicode maps=${report.fonts.allUnicodeMapped}`);
  console.log(`Links: ${report.annotations.annotationUris.length} URI, ${report.annotations.namedLinks} named`);
  for (const warning of report.warnings) console.warn(`[warning] ${warning}`);
  for (const failure of report.failures) console.error(`[error] ${failure}`);

  if (report.failures.length || (options.strict && report.warnings.length)) process.exit(1);
  console.log('PDF baseline QA passed.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
