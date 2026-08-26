import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { verifyAcceptedRecord } from '../scripts/lib/brand-library-publication.mjs';

function fixture() {
  const publicRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-brand-public-'));
  fs.mkdirSync(path.join(publicRoot, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(publicRoot, 'assets', 'master.webp'), 'master bytes');
  fs.writeFileSync(path.join(publicRoot, 'assets', 'thumb.webp'), 'thumb bytes');
  return {
    publicRoot,
    record: {
      id: 'm76-001',
      publicMasterPath: '/assets/master.webp',
      publicThumbPath: '/assets/thumb.webp',
      outputSha256: '33818390754e7425958f424be2c6cdaf53a38b3bb2912350076b5199ca33dea5',
      thumbSha256: 'b6b6e1e7c603cdfcdc14d852188b86eeccb24fa948b2c2ea3eee9b9f62d62ec7',
    },
  };
}

test('accepted brand assets must match their declared SHA-256 digests', () => {
  const { publicRoot, record } = fixture();
  assert.doesNotThrow(() => verifyAcceptedRecord(record, publicRoot));
  fs.writeFileSync(path.join(publicRoot, 'assets', 'master.webp'), 'substituted bytes');
  assert.throws(
    () => verifyAcceptedRecord(record, publicRoot),
    /digest mismatch for m76-001 publicMasterPath/,
  );
});

test('accepted brand asset paths cannot escape the public root', () => {
  const { publicRoot, record } = fixture();
  record.publicMasterPath = '/../outside.webp';
  assert.throws(
    () => verifyAcceptedRecord(record, publicRoot),
    /public path escapes public root/,
  );
});
