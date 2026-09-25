#!/usr/bin/env node
// The CSP in public/_headers allow-lists inline scripts by hash. If a page's
// inline script changes and the hashes don't, that script silently stops
// running in production — so the shipped headers must cover what ships.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('CSP hashes in _headers match the inline scripts actually shipped', async () => {
  const { collectScriptHashes } = await import('../scripts/build-headers.mjs');
  const headers = fs.readFileSync(path.join(ROOT, 'public/_headers'), 'utf8');
  for (const hash of collectScriptHashes()) {
    assert.ok(headers.includes(hash),
      `stale CSP: ${hash} missing from public/_headers — run node scripts/build-headers.mjs`);
  }
});
