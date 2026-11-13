// Pins the front door's information architecture: one page, one question.
//
//   /             what is this, and is it real?
//   /results/     what held and what did not?
//   /about/       who, how, contact
//   /corrections/ what did you retract?
//   /articles/    what can I read?   (tests/article-metadata.test.mjs)
//
// It checks the built pages (npm run build) against their sources in
// data/company.json and data/corrections.json, and the word budgets in
// docs/messaging-canon.md. Detail moves; evidence is never dropped: every
// failure and abstention in the data must reach /results/.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  loadCompany, loadCorrections, wordCount, rowWords, correctionWords, testedRows, highlights,
  RESULT_ROW_WORD_BUDGET, CORRECTION_WORD_BUDGET, RESULTS_LEDE, LEAN_SCOPE,
} from '../scripts/lib/discovery.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const read = (...parts) => fs.readFileSync(path.join(PUBLIC, ...parts), 'utf8');
const company = loadCompany(ROOT);
const corrections = loadCorrections(ROOT);

const home = read('index.html');
const results = read('results', 'index.html');
const about = read('about', 'index.html');
const correctionsPage = read('corrections', 'index.html');
const llms = read('llms.txt');
const sitemap = read('sitemap.xml');

// Visible words, excluding the header, nav and footer (docs/messaging-canon.md).
function visibleWords(html) {
  const { document } = new JSDOM(html).window;
  document.querySelectorAll('script, style, noscript, template, header, nav, footer, .skip, .mark').forEach((n) => n.remove());
  return wordCount(document.body.textContent);
}

const HOME_BUDGET = 350;
const ABOUT_BUDGET = 450;

test(`homepage stays within ${HOME_BUDGET} visible words`, () => {
  const words = visibleWords(home);
  assert.ok(words <= HOME_BUDGET, `homepage has ${words} visible words`);
});

test(`/about/ stays within ${ABOUT_BUDGET} visible words`, () => {
  const words = visibleWords(about);
  assert.ok(words <= ABOUT_BUDGET, `/about/ has ${words} visible words`);
});

test(`every /results/ row stays within ${RESULT_ROW_WORD_BUDGET} words`, () => {
  for (const row of testedRows(company)) {
    assert.ok(rowWords(row) <= RESULT_ROW_WORD_BUDGET, `${row.id} has ${rowWords(row)} words`);
  }
});

test(`every corrections entry stays within ${CORRECTION_WORD_BUDGET} words`, () => {
  for (const entry of corrections.entries) {
    assert.ok(correctionWords(entry) <= CORRECTION_WORD_BUDGET, `${entry.id} has ${correctionWords(entry)} words`);
  }
});

test('homepage hero: the H1, the one-liner and the mission verbatim, and two buttons', () => {
  assert.match(home, /<h1>Before a lab spends a year on a material, <em>know whether to trust the prediction\.<\/em><\/h1>/);
  assert.ok(home.includes(`<p>${company.oneLiner}</p>`), 'one-liner verbatim');
  assert.ok(home.includes(`Our mission: ${company.mission}`), 'mission verbatim');
  const routes = home.match(/<div class="routes">([\s\S]*?)<\/div>/)?.[1] || '';
  const buttons = [...routes.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)/g)].map((m) => [m[1], m[2].trim()]);
  assert.deepEqual(buttons, [['/results/', 'See every result'], ['https://lupi.live', 'Open LUPI']]);
});

test('homepage "What we found": exactly three scoped cards, then every result', () => {
  const found = home.slice(home.indexOf('<!-- discovery:found -->'), home.indexOf('<!-- /discovery:found -->'));
  const cards = found.split('<article class="found-card">').slice(1);
  assert.equal(cards.length, 3);
  assert.deepEqual(highlights(company).map((h) => h.status), ['Supported', 'Open', 'Failed']);
  for (const [i, h] of highlights(company).entries()) {
    assert.match(cards[i], new RegExp(`<span class="result result-${h.status.toLowerCase()}">${h.status}</span>`));
    assert.ok(cards[i].includes(`href="${h.href}"`), `card ${i + 1} links its evidence`);
    const sentences = h.text.split(/(?<=\.)\s+/).length;
    assert.ok(sentences <= 2, `card ${i + 1} has ${sentences} sentences`);
  }
  assert.match(cards[1], /a ceiling|still open/);
  assert.match(cards[2], /no gate passed/);
  assert.match(cards[2], /three failed, one abstained/);
  assert.match(found, /<a href="\/results\/">Every result, failures included/);
});

test('homepage keeps only the lanes row, the next appearance and the footer below the cards', () => {
  const lanes = home.match(/<ul class="lane-row">([\s\S]*?)<\/ul>/)?.[1] || '';
  const items = [...lanes.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  assert.equal(items.length, 5, 'five lanes, one line each');
  for (const item of items) assert.match(item, /<a href="\/articles\/[a-z0-9-]+\/">/);
  assert.match(home, /<span class="next-k">Next<\/span> <a href="\/articles\/tms-2027-measuring-what-we-can-trust\/">TMS2027, Orlando, 14–18 March 2027 — poster<\/a>/);
  // moved to /results/: the table, the Lean section, the caption rail, recent notes
  for (const gone of [/class="tested-table"/, /id="lean"/, /rail-ledger/, /Recent notes/, /scope-strip/]) {
    assert.doesNotMatch(home, gone);
  }
  // the background keeps one caption line, with the MOF-5 credit
  assert.match(home, /<p class="art-note">Background illustration, not a result:[^]*Li, Eddaoudi, O’Keeffe &amp; Yaghi, Nature 402, 276 \(1999\)/);
});

test('/results/ carries every tested row, the cannot-claim list, the Lean scope and the ledgers', () => {
  assert.ok(results.includes(`<p class="lead">${RESULTS_LEDE}</p>`));
  for (const row of testedRows(company)) {
    const at = results.indexOf(`<tr id="${row.id}">`);
    assert.ok(at > 0, `${row.id} missing from /results/`);
    const tr = results.slice(at, results.indexOf('</tr>', at));
    assert.match(tr, new RegExp(`<span class="result result-[a-z-]+">${row.status}</span>`), row.id);
  }
  const statuses = new Set(testedRows(company).map((r) => r.status));
  for (const required of ['Supported', 'Open', 'Failed', 'Abstained']) assert.ok(statuses.has(required), `no ${required} row`);
  assert.match(results, /<h2 id="cannot">What we cannot claim<\/h2>/);
  for (const c of company.cannotClaim) assert.ok(results.includes(c.text), `cannot-claim item missing: ${c.text}`);
  assert.ok(results.includes(LEAN_SCOPE));
  assert.match(results, /26 of 36 \(27 of 36 at float64\)/);
  assert.match(results, /href="https:\/\/github\.com\/alexwelcing\/lupine-rhizo\/blob\/main\/docs\/conjectures\/ledger\.md"/);
  assert.match(results, /href="\/corrections\/"/);
  assert.match(results, /little or no advantage over a common-direction baseline/);
});

test('/results/ is offered in the nav, the footer, the sitemap and llms.txt', () => {
  for (const [name, page] of [['/about/', about], ['/results/', results], ['/corrections/', correctionsPage]]) {
    assert.match(page, /<nav class="site-nav" aria-label="Primary">[\s\S]*?<a href="\/results\/"/, `${name} nav`);
    assert.match(page, /<nav class="foot-nav" aria-label="Footer">[\s\S]*?<a href="\/results\/">Results<\/a>/, `${name} footer`);
  }
  assert.match(results, /<a href="\/results\/" aria-current="page">Results<\/a>/);
  assert.match(home, /<nav class="foot-nav" aria-label="Footer">[\s\S]*?<a href="\/results\/">Results<\/a>/);
  assert.match(sitemap, /<loc>https:\/\/lupine\.science\/results\/<\/loc>/);
  assert.match(llms, /^- Results \(what held and what did not, each with its scope\): https:\/\/lupine\.science\/results\/$/m);
});

test('/about/ is one description, the facts table, three bullets and three questions', () => {
  const facts = [...about.matchAll(/<div(?: id="[a-z]+")?><dt>([^<]+)<\/dt>/g)].map((m) => m[1]);
  assert.deepEqual(facts, ['Company', 'Mission', 'Stage', 'Founder', 'Contact', 'Licences', 'Next appearance']);
  assert.match(about, /<div id="contact"><dt>Contact<\/dt><dd>Research partners, model builders, press and investors: /);
  const how = about.match(/<h2 id="how-we-work">How we work<\/h2>\s*<ul>([\s\S]*?)<\/ul>/)?.[1] || '';
  assert.equal([...how.matchAll(/<li>/g)].length, 3);
  assert.match(about, /href="https:\/\/github\.com\/alexwelcing\/lupine-rhizo\/blob\/main\/docs\/ai-and-data\.md"/);
  const questions = [...about.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.equal(questions.length, 3);
  assert.match(questions[0], /peer-reviewed/);
  assert.match(questions[1], /multi-head/);
  assert.match(questions[2], /reuse your data/);
  // the lists now on /results/ are not repeated here
  assert.doesNotMatch(about, /What we cannot claim|Milestones|Latest notes/);
});

test('/corrections/ keeps every retired claim, each as Was / Now / Why with a date', () => {
  const ids = corrections.entries.map((e) => e.id);
  for (const id of [
    'verified-ai-predictions', 'runtime-correction', 'shared-directions', 'theorem-counts', 'elastic-correction',
    'gigatonnes', 'partners', 'environmental-series', 'proof-pack', 'tms-abstract', 'seventy-two-percent',
    'universal-underprediction', 'investor-material', 'funding-line',
  ]) {
    assert.ok(ids.includes(id), `corrections entry ${id} was dropped`);
    assert.match(correctionsPage, new RegExp(`<h2 id="${id}">`));
  }
  const intro = corrections.intro.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  assert.equal(intro.split(/(?<=[.!?])\s+/).length, 1, 'the intro is one sentence');
  assert.match(correctionsPage, /Corrections log · updated <time datetime="\d{4}-\d{2}-\d{2}">/);
});

test('llms.txt: facts, publication status, key links, then titles with status and URL only', () => {
  const sections = [...llms.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(sections, ['Company facts', 'Publication status', 'Key links', 'Articles', 'Direction']);
  for (const link of [
    'https://lupine.science/results/', 'https://lupine.science/about/', 'https://lupine.science/corrections/',
    'https://library.lupine.science', 'https://lupi.live', 'https://github.com/alexwelcing/lupine-rhizo',
    'https://github.com/alexwelcing/lupine',
  ]) {
    assert.ok(llms.includes(`: ${link}\n`), `llms.txt key links miss ${link}`);
  }
  const articleLines = llms.slice(llms.indexOf('## Articles')).split('\n').filter((l) => l.startsWith('- '));
  assert.ok(articleLines.length > 0);
  for (const line of articleLines) {
    assert.match(line, /^- \[[^\]]+\]\(https:\/\/lupine\.science\/articles\/[a-z0-9-]+\/\): (Published|Working draft|Direction)$/, line);
  }
});

test('the README fits on one screen and points to docs/ for the rest', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const lines = readme.trimEnd().split('\n');
  assert.ok(lines.length <= 45, `README.md has ${lines.length} lines`);
  assert.match(readme, /^## More$/m);
  for (const m of readme.matchAll(/\]\((docs\/[^)]+\.md)\)/g)) {
    assert.ok(fs.existsSync(path.join(ROOT, m[1])), `README links missing ${m[1]}`);
  }
});
