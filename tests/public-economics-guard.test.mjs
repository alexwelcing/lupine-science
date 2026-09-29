// Guards the frozen public economics while preserving the unresolved source conflict.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APPROVED_PUBLIC_ECONOMICS,
  assertPublicEconomics,
  validatePublicEconomics,
  validatePublicSurfaceInventory,
} from '../scripts/lib/public-economics-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPROVED_COST = '$14.65 per 129 anchors';

function sha256(absolute) {
  return createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
}

function failureText(text, relative = 'public/new-campaign/index.html') {
  return validatePublicEconomics(text, { relative })
    .map(({ label, match }) => `${label}: ${match}`)
    .join('; ');
}

describe('unapproved economics stay off public surfaces', () => {
  it('keeps the approved public contract exact', () => {
    assert.deepEqual(APPROVED_PUBLIC_ECONOMICS, [
      '72.4% fewer DFT evaluations',
      '$14.65 per 129 anchors',
    ]);
  });

  it('blocks the unresolved $4.65 conflict without resolving it', () => {
    assert.match(failureText('Measured execution guardrail: $4.65 per 129 anchors.'), /blocked \$4\.65 cost/);
  });

  it('rejects arbitrary anchor costs and savings percentages', () => {
    assert.match(failureText('Measured execution guardrail: $99.99 per 129 anchors.'), /unapproved cost claim/);
    assert.match(failureText('Sharing required 81.25% fewer DFT evaluations.'), /unapproved savings claim/);
  });

  it('rejects arbitrary derived economics and concise count comparisons', () => {
    const mutations = [
      'The run cost $88.88 cloud-equivalent.',
      'Sharing anchors delivered a 4.2× reduction in DFT evaluations.',
      'The comparison used 777 naive evaluations versus 111 shared anchors.',
      '558 naive vs 154 union',
    ];
    for (const mutation of mutations) {
      assert.notEqual(failureText(mutation), '', mutation);
      assert.throws(() => assertPublicEconomics('public/new-campaign/index.html', mutation), /not approved public economics/, mutation);
    }
  });

  it('executes production matchAll paths without throwing TypeError', () => {
    assert.doesNotThrow(() => validatePublicEconomics('430 - 129 naive evaluations versus 100 union anchors'));
    assert.doesNotThrow(() => validatePublicEconomics('4.2× reduction in DFT evaluations'));
  });

  it('discovers and rejects economics in a newly added public text surface', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-economics-mutation-'));
    try {
      const publicRoot = path.join(root, 'public', 'new-campaign');
      fs.mkdirSync(publicRoot, { recursive: true });
      fs.writeFileSync(path.join(publicRoot, 'index.html'), '<main>Only $88.88 per 129 anchors.</main>');
      assert.throws(
        () => validatePublicSurfaceInventory(root),
        /public\/new-campaign\/index\.html.*not approved public economics/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('scans the complete current public text and PDF inventory', () => {
    const surfaces = validatePublicSurfaceInventory(ROOT);
    assert.ok(surfaces.includes('public/index.html'));
    assert.ok(surfaces.includes('public/venture/lupine-science-venture-deck.pdf'));
  });

  it('supports selected immutable video rerenders without overwriting prior evidence', () => {
    const help = fs.readFileSync(path.join(ROOT, 'media/brand-campaign-2026-07-27/render_campaign_videos.py'), 'utf8');
    assert.match(help, /--qa-attempt/);
    assert.match(help, /--film-id/);
  });

  it('binds frozen-copy sources to the promoted public films without stale campaign binaries', () => {
    const receiptPath = path.join(ROOT, 'tests/fixtures/public-economics-video-receipts.json');
    const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    for (const [relative, expected] of Object.entries(receipt.sources)) {
      assert.equal(sha256(path.join(ROOT, relative)), expected, `${relative} changed without updating the receipt`);
    }
    for (const promotion of receipt.promotions) {
      assert.equal(sha256(path.join(ROOT, promotion.public)), promotion.sha256, `${promotion.public} is stale`);
      assert.equal('render' in promotion, false, 'quarantined campaign rerenders must not be publication dependencies');
    }
    assert.equal(fs.existsSync(path.join(ROOT, 'public/videos/campaign-2026-07-27')), false);
  });

  it('permits the approved figures and unrelated measurements', () => {
    assert.deepEqual(validatePublicEconomics(`Measured execution guardrail: ${APPROVED_COST}.`), []);
    assert.deepEqual(validatePublicEconomics('72.4% fewer DFT evaluations'), []);
    assert.deepEqual(validatePublicEconomics('The lattice constant is 4.65 angstroms.'), []);
  });
});
