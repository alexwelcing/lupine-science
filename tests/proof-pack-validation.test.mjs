import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProofPack, validateSource } from '../scripts/validate-proofpack.mjs';

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
