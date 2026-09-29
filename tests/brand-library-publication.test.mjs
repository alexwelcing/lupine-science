import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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

test('accepted brand assets cannot be symlinks to files outside the public root', () => {
  const { publicRoot, record } = fixture();
  const outside = path.join(os.tmpdir(), `lupine-brand-outside-${process.pid}.webp`);
  fs.writeFileSync(outside, 'master bytes');
  fs.unlinkSync(path.join(publicRoot, 'assets', 'master.webp'));
  fs.symlinkSync(outside, path.join(publicRoot, 'assets', 'master.webp'));
  assert.throws(
    () => verifyAcceptedRecord(record, publicRoot),
    /public asset must be a regular file, not a symlink/,
  );
  fs.rmSync(outside, { force: true });
});

test('fully accepted brand manifest publishes through the inert page markers', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-brand-builder-'));
  const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  fs.mkdirSync(path.join(root, 'media', 'projects', 'midwest-2076-library'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public', 'brand-assets', 'assets'), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRoot, 'scripts', 'build-midwest-2076-brand-library.mjs'),
    path.join(root, 'scripts', 'build-midwest-2076-brand-library.mjs'),
  );
  fs.copyFileSync(
    path.join(sourceRoot, 'scripts', 'lib', 'brand-library-publication.mjs'),
    path.join(root, 'scripts', 'lib', 'brand-library-publication.mjs'),
  );

  const assetClasses = Array.from({ length: 10 }, (_, index) => ({
    id: `class-${index + 1}`,
    name: `Class ${index + 1}`,
  }));
  const requests = Array.from({ length: 100 }, (_, index) => {
    const id = `m76-${String(index + 1).padStart(3, '0')}`;
    const master = `${id}-master`;
    const thumb = `${id}-thumb`;
    fs.writeFileSync(path.join(root, 'public', 'brand-assets', 'assets', `${id}.webp`), master);
    fs.writeFileSync(path.join(root, 'public', 'brand-assets', 'assets', `${id}-thumb.webp`), thumb);
    return {
      id,
      status: 'completed',
      qa: { status: 'accepted' },
      assetClass: assetClasses[Math.floor(index / 10)].id,
      assetClassName: assetClasses[Math.floor(index / 10)].name,
      variation: (index % 10) + 1,
      aspect: '1:1',
      publicMasterPath: `/brand-assets/assets/${id}.webp`,
      publicThumbPath: `/brand-assets/assets/${id}-thumb.webp`,
      outputSha256: createHash('sha256').update(master).digest('hex'),
      thumbSha256: createHash('sha256').update(thumb).digest('hex'),
    };
  });
  fs.writeFileSync(
    path.join(root, 'media', 'projects', 'midwest-2076-library', 'requests.json'),
    JSON.stringify({ requestedCount: 100, assetClasses, requests }),
  );
  fs.writeFileSync(
    path.join(root, 'public', 'brand-assets', 'index.html'),
    '<p class="lede">Existing library.</p><!-- MIDWEST_2076_LIBRARY_START --><!-- MIDWEST_2076_LIBRARY_END --><p class="stats">Existing stats.</p>',
  );

  execFileSync(process.execPath, [path.join(root, 'scripts', 'build-midwest-2076-brand-library.mjs')]);
  const page = fs.readFileSync(path.join(root, 'public', 'brand-assets', 'index.html'), 'utf8');
  assert.match(page, /MIDWEST_2076_LIBRARY_START[\s\S]*MIDWEST_2076_LIBRARY_END/);
  assert.equal((page.match(/class="card world-card"/g) || []).length, 100);
  assert.match(page, /300 generated stills/);
  assert.match(page, /100 Midwest 2076 studies/);
});
