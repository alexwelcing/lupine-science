#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROOF_PACK_SCHEMA = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'schemas', 'proof-pack.schema.json'), 'utf8')
);

export const OFFICIAL_DOMAINS = Object.freeze({
  government: ['anl.gov', 'energy.gov', 'epa.gov', 'lbl.gov', 'nist.gov', 'nrel.gov', 'ornl.gov', 'pnnl.gov', 'usgs.gov'],
  intergovernmental: ['iea.org', 'ipcc.ch', 'oecd.org', 'un.org', 'unep.org', 'unesco.org', 'who.int', 'worldbank.org'],
  'research-institution': ['ac.uk', 'cern.ch', 'edu', 'rsc.org'],
});

const SELF_CITATION_HOSTS = [
  'lupine.science',
  'lupi.live',
  'library.lupine.science',
  'github.com',
  'githubusercontent.com',
];
const SELF_CITATION_TEXT = /\b(lupine science|lupine-rhizo|alex welcing)\b/i;
const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/i;

function hostMatches(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function sourceUrl(source) {
  try {
    return new URL(source.url);
  } catch {
    return null;
  }
}

function isSelfCitation(source, url) {
  const text = `${source.title || ''} ${source.publisher || ''} ${source.url || ''}`;
  if (SELF_CITATION_TEXT.test(text)) return true;
  if (!url) return false;
  if (url.hostname === 'github.com') {
    return /^\/(alexwelcing|lupine-science)(?:\/|$)/i.test(url.pathname);
  }
  return SELF_CITATION_HOSTS.some((domain) => domain !== 'github.com' && hostMatches(url.hostname, domain));
}

function pushIssue(issues, severity, source, message) {
  issues.push({ severity, sourceId: source.id || '<missing>', message });
}

function schemaIssue(issues, location, message) {
  issues.push({
    severity: 'error',
    sourceId: '<schema>',
    message: `${location || '<root>'} ${message}`,
  });
}

function resolveSchemaRef(ref) {
  if (!ref.startsWith('#/')) throw new Error(`unsupported proof-pack schema reference: ${ref}`);
  return ref.slice(2).split('/').reduce((value, key) => value?.[key], PROOF_PACK_SCHEMA);
}

function hasSchemaType(value, type) {
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  return typeof value === type;
}

function isValidFormat(value, format) {
  if (format === 'date') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  }
  if (format === 'uri') {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }
  return true;
}

function validateAgainstSchema(value, schema, location, issues) {
  if (schema.$ref) schema = resolveSchemaRef(schema.$ref);

  if (schema.type && !hasSchemaType(value, schema.type)) {
    schemaIssue(issues, location, `must be ${schema.type === 'object' ? 'an object' : `a ${schema.type}`}`);
    return;
  }
  if (Object.hasOwn(schema, 'const') && value !== schema.const) {
    schemaIssue(issues, location, `must equal ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    schemaIssue(issues, location, `must be one of: ${schema.enum.join(', ')}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength && Array.from(value).length < schema.minLength) {
      schemaIssue(issues, location, `must contain at least ${schema.minLength} character`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      schemaIssue(issues, location, `must match ${schema.pattern}`);
    }
    if (schema.format && !isValidFormat(value, schema.format)) {
      schemaIssue(issues, location, `must be a valid ${schema.format}`);
    }
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      schemaIssue(issues, location, `must be at least ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      schemaIssue(issues, location, `must be at most ${schema.maximum}`);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) {
      schemaIssue(issues, location, `must contain at least ${schema.minItems} item`);
    }
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) schemaIssue(issues, location, 'must contain unique items');
    }
    if (schema.items) {
      value.forEach((item, index) => validateAgainstSchema(item, schema.items, `${location}[${index}]`, issues));
    }
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (!Object.hasOwn(value, key)) schemaIssue(issues, location ? `${location}.${key}` : key, 'is required');
    }
    // draft 2020-12 dependentRequired. Needed so the schema itself can state that
    // `jsonChecks` and `sha256` are meaningless without a `path` to check against;
    // without it a manifest typo produced a valid-looking artifact whose advertised
    // checks were silently skipped by the builder.
    for (const [trigger, dependents] of Object.entries(schema.dependentRequired || {})) {
      if (!Object.hasOwn(value, trigger)) continue;
      for (const key of dependents) {
        if (!Object.hasOwn(value, key)) {
          schemaIssue(issues, location ? `${location}.${key}` : key, `is required when ${trigger} is present`);
        }
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(schema.properties || {}, key)) {
          schemaIssue(issues, location ? `${location}.${key}` : key, 'is not allowed');
        }
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (Object.hasOwn(value, key)) {
        validateAgainstSchema(value[key], childSchema, location ? `${location}.${key}` : key, issues);
      }
    }
  }
}

export function validateSource(source) {
  const issues = [];
  const url = sourceUrl(source);

  if (!source.id || !source.title || !source.type || !source.url) {
    pushIssue(issues, 'error', source, 'source requires id, title, type, and url');
    return issues;
  }
  if (!url || !['http:', 'https:'].includes(url.protocol)) {
    pushIssue(issues, 'error', source, 'url must be an absolute HTTP(S) URL');
    return issues;
  }
  if (isSelfCitation(source, url)) {
    pushIssue(issues, 'error', source, 'Lupine Science and author self-citations are forbidden as scientific evidence');
    return issues;
  }

  if (source.type === 'peer-reviewed') {
    if (!DOI_PATTERN.test(source.doi || '')) {
      pushIssue(issues, 'error', source, 'peer-reviewed sources require a syntactically valid DOI');
    } else if (!hostMatches(url.hostname, 'doi.org')) {
      pushIssue(issues, 'warning', source, 'peer-reviewed source URL should use the canonical doi.org resolver');
    }
    return issues;
  }

  if (Object.hasOwn(OFFICIAL_DOMAINS, source.type)) {
    const allowed = OFFICIAL_DOMAINS[source.type];
    if (!allowed.some((domain) => hostMatches(url.hostname, domain))) {
      pushIssue(issues, 'error', source, `${source.type} source is not on an approved official domain`);
    }
    return issues;
  }

  if (source.type === 'exception') {
    if (!source.exceptionJustification || Array.from(source.exceptionJustification.trim()).length < 40) {
      pushIssue(issues, 'error', source, 'exceptions require a specific justification of at least 40 characters');
    } else {
      pushIssue(issues, 'warning', source, `policy exception requires human review: ${source.exceptionJustification.trim()}`);
    }
    return issues;
  }

  pushIssue(issues, 'error', source, `unsupported source type: ${source.type}`);
  return issues;
}

export function validateProofPack(manifest) {
  const issues = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return [{ severity: 'error', sourceId: '<manifest>', message: 'proof pack must be a JSON object' }];
  }
  validateAgainstSchema(manifest, PROOF_PACK_SCHEMA, '', issues);

  if (Array.isArray(manifest.bibliography)) {
    const ids = new Set();
    for (const source of manifest.bibliography) {
      for (const issue of validateSource(source || {})) issues.push(issue);
      if (source?.id && ids.has(source.id)) pushIssue(issues, 'error', source, 'duplicate bibliography id');
      if (source?.id) ids.add(source.id);
    }
    for (const collection of [manifest.figures, manifest.dataTables]) {
      if (!Array.isArray(collection)) continue;
      for (const artifact of collection) {
        for (const sourceId of artifact?.sourceIds || []) {
          if (!ids.has(sourceId)) {
            issues.push({ severity: 'error', sourceId, message: `artifact ${artifact.id || '<missing>'} references an unknown bibliography id` });
          }
        }
      }
    }
  }
  return issues;
}

/** Validate that every local figure declared by an input manifest exists and matches any declared digest. */
export function validateProofPackFiles(manifest, manifestPath) {
  const issues = [];
  const articleDir = path.dirname(path.resolve(manifestPath));
  if (!Array.isArray(manifest?.figures)) return issues;

  for (const [index, figure] of manifest.figures.entries()) {
    const location = `figures[${index}]`;
    if (typeof figure?.path !== 'string' || !figure.path) continue;
    const figurePath = path.resolve(articleDir, figure.path);
    const relative = path.relative(articleDir, figurePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      schemaIssue(issues, `${location}.path`, `escapes the article directory: ${figure.path}`);
      continue;
    }
    if (!fs.existsSync(figurePath)) {
      schemaIssue(issues, `${location}.path`, `is missing: ${figurePath}`);
      continue;
    }
    if (!fs.statSync(figurePath).isFile()) {
      schemaIssue(issues, `${location}.path`, `is not a file: ${figurePath}`);
      continue;
    }
    const realArticleDir = fs.realpathSync(articleDir);
    const realFigurePath = fs.realpathSync(figurePath);
    const realRelative = path.relative(realArticleDir, realFigurePath);
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
      schemaIssue(issues, `${location}.path`, `resolves outside the article directory: ${figure.path}`);
      continue;
    }
    if (figure.sha256) {
      const actual = crypto.createHash('sha256').update(fs.readFileSync(figurePath)).digest('hex');
      if (actual !== figure.sha256) {
        schemaIssue(issues, `${location}.sha256`, `digest mismatch: expected ${figure.sha256}, got ${actual}`);
      }
    }
  }
  return issues;
}

export function formatIssues(issues) {
  return issues.map((issue) => `${issue.severity.toUpperCase()} [${issue.sourceId}] ${issue.message}`).join('\n');
}

function main(argv) {
  if (argv.length === 0) {
    console.error('usage: node scripts/validate-proofpack.mjs <manifest.json> [...]');
    return 2;
  }
  let hasErrors = false;
  for (const filename of argv) {
    const absolute = path.resolve(ROOT, filename);
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    } catch (error) {
      console.error(`ERROR [${filename}] ${error.message}`);
      hasErrors = true;
      continue;
    }
    const issues = [
      ...validateProofPack(manifest),
      ...validateProofPackFiles(manifest, absolute),
    ];
    console.log(`${filename}: ${issues.length ? `found ${issues.length} issue(s)` : 'valid'}`);
    if (issues.length) console.log(formatIssues(issues));
    if (issues.some((issue) => issue.severity === 'error')) hasErrors = true;
  }
  return hasErrors ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
