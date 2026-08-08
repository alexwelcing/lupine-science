// Guards the ONE economics figure that is settled: $14.65 per 129 anchors.
//
// `$4.65` was a dropped digit in owner card `t_1c23b226`. The authoritative ledger
// reproduces $14.65 as 244 vCPU-h x $0.06 (script-backed, hash-pinned), and
// lupine-hq's `partnerships/validate_partnerships.py:64` already enforces $14.65
// across all 93 prospect mappings. The command-center records that reconciled on
// 2026-08-08, retiring the "preserve both pending reconciliation" wording that had
// been blocking cost-cap activation.
//
// Every public surface is currently clean of $4.65, so this is a ratchet: it passes
// today and fails only if the retired figure comes back. It deliberately does NOT
// police other derived economics.
//
// WHY SO NARROW — this file is the surviving, verified part of a broader guard on
// `task/t_da0354ce` that forbade 70%, 3.33x, 3.62x, ~10%, $0.60, 558/154 and
// 430/129, and required exact adjacency after every "72.4%". Run against `main` on
// 2026-08-08 that version failed 13 of 20 checks, and each failure was a FALSE
// POSITIVE on legitimate content:
//
//   - `articles/z1-union-debrief.md` reports "430 anchors. Union executed: 129.
//     That is 70% fewer DFT evaluations (3.33x) - the prediction said 72.4%".
//     That is the debrief honestly contrasting its MEASURED result against the
//     prediction. Forbidding it would force an article to hide its own measurement.
//   - `articles/the-savings-stack.md` says "72.4% fewer evaluations, a 3.62x
//     reduction". 3.62x is the arithmetic restatement of 72.4% (1/(1-0.724)), not
//     a substitute for it.
//   - the venture-deck surfaces failed exact-adjacency after "72.4%" only because
//     HTML markup sits between the number and the words.
//
// So the broad guard would have blocked accurate publication rather than protecting
// it. That is a fence, not a ratchet. The narrow claim is the one worth enforcing,
// and the card carried no recorded verification, which is how it stayed unlanded.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const APPROVED_COST = '$14.65 per 129 anchors';

// The retired figure, in the forms it actually appeared in.
const RETIRED = [
  { label: '$4.65 dropped-digit cost', sample: 'measured execution guardrail: $4.65 per 129 anchors', pattern: /\$\s?4\.65/ },
  { label: 'bare 4.65 per anchors', sample: '4.65 per 129 anchors', pattern: /\b4\.65\s+per\s+\d+\s+anchors/i },
];

const TEXT_SURFACES = [
  'articles/z1-union-debrief.md',
  'articles/the-savings-stack.md',
  'media/booklets/savings-stack/index.html',
  'media/projects/venture-deck/index.html',
  'media/projects/venture-deck/deck.html',
  'media/projects/venture-deck/narrative-script.md',
  'media/projects/venture-deck/evidence-manifest.json',
  'public/articles/z1-union-debrief/index.html',
  'public/articles/the-savings-stack/index.html',
  'public/venture/deck.html',
  'public/venture/evidence-manifest.json',
  'public/videos/index.html',
];

const PDF_SURFACES = [
  'public/booklets/the-savings-stack.pdf',
  'public/venture/lupine-science-venture-deck.pdf',
];

function normalized(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// HTML surfaces hide text in metadata, alt text and JSON-LD, so a naive body read
// would let a retired figure through in a meta description.
function publicText(relative, raw) {
  if (!relative.endsWith('.html')) return raw;
  const document = new JSDOM(raw).window.document;
  const metadata = [...document.querySelectorAll('meta[content]')].map((node) => node.content);
  const imageText = [...document.querySelectorAll('img')].flatMap((node) => [node.alt, node.title].filter(Boolean));
  const structured = [...document.querySelectorAll('script[type="application/ld+json"], script[type="application/json"]')]
    .map((node) => node.textContent);
  document.querySelectorAll('style, script').forEach((node) => node.remove());
  const body = [];
  if (document.body) {
    const walker = document.createTreeWalker(document.body, document.defaultView.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) body.push(node.nodeValue);
  }
  return [body.join('\n'), ...metadata, ...imageText, ...structured].join('\n');
}

function assertNoRetiredCost(relative, raw) {
  const text = normalized(raw);
  for (const { label, pattern } of RETIRED) {
    assert.doesNotMatch(text, pattern, `${relative}: ${label} was retired as a transcription error; use ${APPROVED_COST}`);
  }
}

describe('retired economics figures stay off public surfaces', () => {
  for (const relative of TEXT_SURFACES) {
    it(`keeps $4.65 out of ${relative}`, () => {
      const absolute = path.join(ROOT, relative);
      // A missing surface must fail loudly rather than pass vacuously: a guard that
      // silently skips its own inputs is the failure mode that let a speech-rate
      // check report 0 words for 22 files while showing green.
      assert.ok(fs.existsSync(absolute), `${relative} is missing — update TEXT_SURFACES if it was removed on purpose`);
      assertNoRetiredCost(relative, publicText(relative, fs.readFileSync(absolute, 'utf8')));
    });
  }

  for (const relative of PDF_SURFACES) {
    it(`keeps $4.65 out of ${relative}`, () => {
      const absolute = path.join(ROOT, relative);
      assert.ok(fs.existsSync(absolute), `${relative} is missing — update PDF_SURFACES if it was removed on purpose`);
      assertNoRetiredCost(relative, execFileSync('pdftotext', ['-layout', absolute, '-'], { encoding: 'utf8' }));
    });
  }

  // Both directions. Asserting only that the corpus is clean would pass just as
  // happily with a regex that never matches anything.
  it('rejects each retired form', () => {
    for (const { label, sample } of RETIRED) {
      assert.throws(
        () => assertNoRetiredCost(`fixture:${label}`, `Public economics: ${sample}`),
        /was retired as a transcription error/,
        `expected rejection for ${label}`
      );
    }
  });

  it('permits the approved figure', () => {
    assert.doesNotThrow(() => assertNoRetiredCost('fixture:approved', `Measured execution guardrail: ${APPROVED_COST}.`));
  });

  // 4.65 is not banned as a number — only as this cost claim. Without this, the
  // guard would eventually block an unrelated legitimate 4.65 and get deleted.
  it('permits an unrelated 4.65 that is not the cost claim', () => {
    assert.doesNotThrow(() => assertNoRetiredCost('fixture:unrelated', 'The lattice constant is 4.65 angstroms.'));
  });
});
