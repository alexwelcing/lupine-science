import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProofPack, validateProofPackFiles, validateSource } from '../scripts/validate-proofpack.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(ROOT, 'tests', 'fixtures', 'proof-pack');
const SCRIPT = path.join(ROOT, 'scripts', 'validate-proofpack.mjs');

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
}

describe('proof-pack scientific source policy', () => {
  it('accepts DOI literature and approved official institutions', () => {
    assert.deepEqual(validateProofPack(fixture('valid.json')), []);
  });

  it('enforces the complete schema with actionable JSON paths', () => {
    const manifest = fixture('valid.json');
    delete manifest.metadata.title;
    manifest.metadata.unreviewedField = true;
    manifest.methodology.steps = [];

    const issues = validateProofPack(manifest);
    const messages = issues.map(({ message }) => message).join('\n');
    assert.match(messages, /metadata\.title is required/);
    assert.match(messages, /metadata\.unreviewedField is not allowed/);
    assert.match(messages, /methodology\.steps must contain at least 1 item/);
  });

  it('rejects non-HTTP URI schemes and counts Unicode by code point', () => {
    const manifest = fixture('valid.json');
    manifest.auditLinks = [{ label: 'unsafe', url: 'javascript:alert(1)' }];
    manifest.bibliography.push({
      id: 'emoji-exception',
      title: 'Exception with too-short Unicode justification',
      type: 'exception',
      url: 'https://example.org/evidence',
      exceptionJustification: '😀'.repeat(20),
    });

    const messages = validateProofPack(manifest).map(({ message }) => message).join('\n');
    assert.match(messages, /auditLinks\[0\]\.url must be a valid uri/);
    assert.match(messages, /specific justification of at least 40 characters/);
  });

  it('rejects self-citations, unapproved domains, missing DOIs, weak exceptions, and dangling references', () => {
    const issues = validateProofPack(fixture('invalid.json'));
    const messages = issues.map(({ message }) => message).join('\n');
    assert.match(messages, /self-citations are forbidden/);
    assert.match(messages, /not on an approved official domain/);
    assert.match(messages, /require a syntactically valid DOI/);
    assert.match(messages, /specific justification/);
    assert.match(messages, /unknown bibliography id/);
    assert.ok(issues.every(({ severity }) => severity === 'error'));
  });

  it('flags every justified exception for human review without treating it as an error', () => {
    const issues = validateProofPack(fixture('justified-exception.json'));
    assert.equal(issues.length, 1);
    assert.equal(issues[0].severity, 'warning');
    assert.match(issues[0].message, /requires human review/);
  });

  it('does not let exception status override the Lupine self-citation ban', () => {
    const issues = validateSource({
      id: 'internal',
      title: 'Internal result',
      type: 'exception',
      url: 'https://github.com/alexwelcing/lupine-rhizo',
      exceptionJustification: 'This deliberately long justification must still fail because it is internal.',
    });
    assert.equal(issues[0].severity, 'error');
    assert.match(issues[0].message, /self-citations are forbidden/);
  });
});

describe('proof-pack validator CLI', () => {
  it('returns zero for a valid manifest', () => {
    const output = execFileSync(process.execPath, [SCRIPT, path.join(FIXTURES, 'valid.json')], { encoding: 'utf8' });
    assert.match(output, /valid/);
  });

  it('returns nonzero and prints diagnostics for invalid evidence', () => {
    const result = spawnSync(process.execPath, [SCRIPT, path.join(FIXTURES, 'invalid.json')], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stdout, /ERROR \[self-citation\]/);
  });
});

describe('proof-pack local input completeness', () => {
  it('reports missing, escaping, and digest-mismatched figures with JSON paths', () => {
    const root = fs.mkdtempSync(path.join(ROOT, '.proof-pack-input-test-'));
    try {
      const manifestPath = path.join(root, 'article.proofpack.json');
      const existingPath = path.join(root, 'figure.svg');
      fs.writeFileSync(existingPath, '<svg>Unicode — CO₂</svg>');
      const manifest = {
        figures: [
          { path: 'missing.svg' },
          { path: '../escape.svg' },
          { path: 'figure.svg', sha256: '0'.repeat(64) },
        ],
      };

      const issues = validateProofPackFiles(manifest, manifestPath);
      const messages = issues.map(({ message }) => message).join('\n');
      assert.match(messages, /figures\[0\]\.path is missing/);
      assert.match(messages, /figures\[1\]\.path escapes the article directory/);
      assert.match(messages, /figures\[2\]\.sha256 digest mismatch/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects a figure symlink that resolves outside the article directory', () => {
    const parent = fs.mkdtempSync(path.join(ROOT, '.proof-pack-symlink-test-'));
    const articleDir = path.join(parent, 'article');
    try {
      fs.mkdirSync(articleDir);
      const outsidePath = path.join(parent, 'outside.svg');
      fs.writeFileSync(outsidePath, '<svg/>');
      fs.symlinkSync(outsidePath, path.join(articleDir, 'figure.svg'));
      const issues = validateProofPackFiles(
        { figures: [{ path: 'figure.svg' }] },
        path.join(articleDir, 'article.proofpack.json')
      );
      assert.match(issues.map(({ message }) => message).join('\n'), /resolves outside the article directory/);
    } finally {
      fs.rmSync(parent, { recursive: true, force: true });
    }
  });
});
