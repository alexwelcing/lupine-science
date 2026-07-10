#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
    if (!source.exceptionJustification || source.exceptionJustification.trim().length < 40) {
      pushIssue(issues, 'error', source, 'exceptions require a specific justification of at least 40 characters');
    } else {
      pushIssue(issues, 'warning', source, `policy exception requires human review: ${source.exceptionJustification.trim()}`);
    }
    return issues;
  }

  pushIssue(issues, 'error', source, `unsupported source type: ${source.type}`);
  return issues;
}

function requireValue(manifest, key, expected, issues) {
  const value = manifest[key];
  if (expected === 'array' ? !Array.isArray(value) : !value || typeof value !== expected || Array.isArray(value)) {
    issues.push({ severity: 'error', sourceId: '<manifest>', message: `${key} must be ${expected === 'array' ? 'an array' : `a ${expected}`}` });
  }
}

export function validateProofPack(manifest) {
  const issues = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return [{ severity: 'error', sourceId: '<manifest>', message: 'proof pack must be a JSON object' }];
  }
  if (manifest.schemaVersion !== '1.0.0') {
    issues.push({ severity: 'error', sourceId: '<manifest>', message: 'schemaVersion must be 1.0.0' });
  }
  for (const key of ['metadata', 'summary', 'methodology', 'credits']) requireValue(manifest, key, 'object', issues);
  for (const key of ['figures', 'dataTables', 'bibliography']) requireValue(manifest, key, 'array', issues);

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
    const issues = validateProofPack(manifest);
    console.log(`${filename}: ${issues.length ? `found ${issues.length} issue(s)` : 'valid'}`);
    if (issues.length) console.log(formatIssues(issues));
    if (issues.some((issue) => issue.severity === 'error')) hasErrors = true;
  }
  return hasErrors ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
