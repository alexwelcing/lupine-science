// Guards the public front-door copy that is generated from data/company.json
// (scripts/lib/discovery.mjs) or hand-written in public/index.html and
// public/corrections/index.html. The rules are in docs/messaging-canon.md:
// no funding statements, no bare theorem counts, retired claims stay retired,
// failures sit beside passes, and every surface links the corrections log.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  loadCompany, normalizeArticles, asOfDate, organizationGraph, renderNowStrip,
  renderAboutMain, renderLlmsTxt, faqEntries, aboutJsonLd, RESULT_STATUSES, testedRows,
} from '../scripts/lib/discovery.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const company = loadCompany(ROOT);
const articles = normalizeArticles([
  { slug: 'example-note', title: 'Example note', meta: { date: '2026-10-01', status: 'Published', summary: 'An example.' } },
]);
const asOf = asOfDate(company, articles);

const generated = {
  'company.json': JSON.stringify(company),
  'JSON-LD': JSON.stringify(organizationGraph(company, { asOf })),
  'about JSON-LD': JSON.stringify(aboutJsonLd(company, asOf)),
  'homepage record strip': renderNowStrip(company, articles, { asOf }),
  '/about/': renderAboutMain(company, articles, { asOf }),
  'llms.txt': renderLlmsTxt(company, articles, { asOf, leanCount: { count: 123, counted_at: '2026-01-01' } }),
};
const handWritten = {
  'public/index.html': fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8'),
  'public/corrections/index.html': fs.readFileSync(path.join(ROOT, 'public', 'corrections', 'index.html'), 'utf8'),
};

// Phrases that must not appear anywhere we publish from these sources.
const BLOCKLIST = [
  /taild6f8cb/i, /\.ts\.net\b/i, /aledev/i, /\/\.hermes\b|~\/\.hermes/i, /\bHermitage\b/, /\bCovenant\b/,
  /Chrome Remote Desktop/i, /@gmail\.com/i, /createFuture/, /\bConfidential\b/i, /DO NOT DISTRIBUTE/i,
  /Raising ~/i, /not raising/i, /Closed to further investors/i, /immediate partners/i, /X-Amz-|Signature=|[?&]token=/,
  /claude\.ai\/chat|chatgpt\.com\/c\/|gemini\.google\.com\/app\//i,
];
// Funding statements are not published anywhere; only the neutral contact
// line may name investors. The corrections page records that a funding line
// was retired without repeating it.
const FUNDING = [/\bnot raising\b/i, /closed to further investors/i, /\bfunded\b/i, /\braising\b/i, /\bthe ask\b/i];
// Retired headline claims (docs/messaging-canon.md, "Retired").
const RETIRED = [
  /Verified AI predictions/i, /makes AI predictions[^.]*trustworthy/i, /~\s?70\s?%/, /cos\s*(θ\s*)?≈\s*0\.69/,
  /participation ratio[^.]*1\.1[–-]2\.0/i, /build-locked theorems/i, /zero sorry/i, /17\.84\s*→\s*9\.92/,
  /5[–-]12\s*GtCO/i, /\bproof[- ]pack\b/i, /certificates? of synthes/i, /accelerating materials discovery/i,
  /Unlocking the materials/i, /corrects that error at runtime/i, /\bthe trust layer\b/,
];

for (const [name, text] of Object.entries({ ...generated, ...handWritten })) {
  test(`${name}: no leak-blocklist strings`, () => {
    for (const pattern of BLOCKLIST) assert.doesNotMatch(text, pattern, `${name} matches ${pattern}`);
  });
}

for (const [name, text] of Object.entries({ ...generated, 'public/index.html': handWritten['public/index.html'] })) {
  test(`${name}: no funding statements or retired headline claims`, () => {
    for (const pattern of [...FUNDING, ...RETIRED]) assert.doesNotMatch(text, pattern, `${name} matches ${pattern}`);
  });
}

test('company.json has no funding field', () => {
  assert.equal('funding' in company, false);
});

test('investors appear only in the neutral contact line', () => {
  assert.equal(company.contactLine, 'Research partners, model builders, press and investors');
  for (const [name, text] of Object.entries(generated)) {
    const withoutContact = text.split(company.contactLine).join('');
    assert.doesNotMatch(withoutContact, /investor/i, `${name} mentions investors outside the contact line`);
  }
  assert.ok(company.audiences.every((a) => !/investor/i.test(a.who)), 'investors are not an audience row');
});

test('the 72.4% projection stays off the homepage and the company record', () => {
  for (const [name, text] of Object.entries({ ...generated, 'public/index.html': handWritten['public/index.html'] })) {
    assert.doesNotMatch(text, /72\.4\s?%/, `${name} shows 72.4%`);
  }
});

test('no theorem count is printed on generated surfaces or the homepage', () => {
  assert.doesNotMatch(generated['llms.txt'], /\b123\b/, 'llms.txt printed the Lean count');
  for (const [name, text] of Object.entries({ ...generated, 'public/index.html': handWritten['public/index.html'] })) {
    assert.doesNotMatch(text, /\b\d{2,}\+?\s+(?:build-locked\s+)?(?:Lean\s+4\s+)?theorems?\b/i, `${name} prints a theorem count`);
  }
  assert.match(generated['llms.txt'], /it does not check the physics, the reference data or the pipeline/);
});

test('tested rows use the closed result vocabulary and keep failures beside passes', () => {
  const rows = testedRows(company);
  assert.ok(rows.length > 0);
  for (const row of rows) assert.ok(RESULT_STATUSES.includes(row.status), row.what);
  const statuses = new Set(rows.map((r) => r.status));
  for (const required of ['Supported', 'Open', 'Failed', 'Abstained']) assert.ok(statuses.has(required), `no ${required} row`);
  assert.throws(() => testedRows({ tested: [{ what: 'x', status: 'Proven' }] }), /outside/);
});

test('r = 0.906 always travels with its null and per-model qualifiers', () => {
  for (const [name, text] of Object.entries({ ...generated, ...handWritten })) {
    for (const match of text.matchAll(/r = 0\.906[^)]*\)/g)) {
      assert.match(match[0], /0\.44/, `${name}: r = 0.906 without the permutation null`);
      assert.match(match[0], /three of the four models/, `${name}: r = 0.906 without the per-model qualifier`);
    }
  }
});

test('every front-door surface links the corrections log', () => {
  assert.match(generated['/about/'], /href="\/corrections\/"/);
  assert.match(generated['llms.txt'], /https:\/\/lupine\.science\/corrections\//);
  assert.match(generated['homepage record strip'], /href="\/corrections\/"/);
  assert.match(handWritten['public/index.html'], /<footer class="foot">[\s\S]*href="\/corrections\/"/);
});

test('the FAQ answers peer review plainly and asks nothing about raising', () => {
  const faq = faqEntries(company, asOf);
  const peer = faq.find((e) => /peer-reviewed/i.test(e.q));
  assert.ok(peer, 'peer-review question present');
  assert.match(peer.a, /^No Lupine paper has been peer-reviewed or accepted yet\./);
  assert.ok(faq.every((e) => !/raising|funding|invest/i.test(e.q)));
  assert.ok(faq.every((e) => !/\bthe team\b/i.test(e.q + e.a)));
});

test('the corrections page lists each retired headline with a date and a reason', () => {
  const page = handWritten['public/corrections/index.html'];
  for (const heading of [
    'Verified AI predictions', '~70% of dominant error directions are shared', 'Theorem counts as evidence',
    '17.84 → 9.92 GPa', '5–12 GtCO₂/yr', 'Organisations described as partners', 'Proof pack',
    'hyper-ribbon', '72.4% shown without its baseline', 'investor one-pager', 'The funding status line',
  ]) {
    assert.ok(page.includes(heading), `corrections page is missing "${heading}"`);
  }
  const entries = page.split('<h2 ').slice(1);
  for (const entry of entries) {
    assert.match(entry, /<dt>Was<\/dt>/);
    assert.match(entry, /<dt>Now<\/dt>/);
    assert.match(entry, /<dt>Why<\/dt>/);
    assert.match(entry, /<time datetime="\d{4}-\d{2}-\d{2}">/);
  }
});
