// discovery.mjs — renders every surface a search engine, an answer engine
// (ChatGPT, Perplexity, Claude, Gemini) or an analyst's feed reader uses to
// find and describe Lupine Science, from ONE source: data/company.json (and
// data/corrections.json for the log) plus the article frontmatter
// build-articles.mjs already parses. One page, one question:
//
//   homepage  <!-- discovery:jsonld -->  Organization / founder / Event graph
//   homepage  <!-- discovery:found -->   "What we found": three scoped results
//   homepage  <!-- discovery:next -->    the next public appearance, one line
//   /results/                            what held and what did not
//   /about/                              who, how, contact
//   /corrections/                        what we retracted
//   /llms.txt                            plain-text brief for LLM crawlers
//   /feed.xml                            Atom feed of every article
//
// Messaging rules for every string here, including the word budgets:
// docs/messaging-canon.md. No funding statements, no bare counters, every
// number with the qualifier its evidence file attaches to it.
//
// Everything here is pure and deterministic: "as of" is the newest dated fact
// in the inputs, never the wall clock, so CI rebuilds are byte-identical.
import fs from 'node:fs';
import path from 'node:path';

export const SITE = 'https://lupine.science';

export function loadCompany(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'data', 'company.json'), 'utf8'));
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
export const escapeXml = escapeHtml;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = MONTHS.map((m) => m.slice(0, 3));

export function formatLongDate(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return iso || '';
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function formatShortDate(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return iso || '';
  return `${MON[m - 1]} ${d}, ${y}`;
}
export function formatMonth(iso) {
  const [y, m] = String(iso || '').split('-').map(Number);
  if (!y || !m) return iso || '';
  return `${MONTHS[m - 1]} ${y}`;
}
// "14–18 March 2027" (same month) or "30 March – 2 April 2027"
export function formatRange(start, end) {
  const [y1, m1, d1] = start.split('-').map(Number);
  const [y2, m2, d2] = (end || start).split('-').map(Number);
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MONTHS[m1 - 1]} ${y1}`;
  return `${d1} ${MONTHS[m1 - 1]} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
}

// Document status: one plain label per article (docs/messaging-canon.md).
// Scope, caveats and review state belong in the "Evidence Status" line, never
// in Status. Every surface (article byline, index cards, /about/, llms.txt and
// the feed) reads the label through documentStatus(), so they cannot disagree.
//   Published      current statement on this site; not peer-reviewed;
//                  corrections are dated in the body
//   Working draft  public for discussion; may change; not for citation
//   Direction      where the work is aimed; not a result
//   Archived       superseded; keeps its URL behind a dated banner and noindex,
//                  and is left out of every index, the feed, llms.txt and the
//                  sitemap
export const DOCUMENT_STATUSES = ['Published', 'Working draft', 'Direction', 'Archived'];
export const DOCUMENT_STATUS_MEANING = {
  Published: 'Current statement on this site. Not peer-reviewed; corrections are dated in the body.',
  'Working draft': 'Public for discussion. It may change and is not for citation.',
  Direction: 'Describes where this work is aimed. Not a result.',
  Archived: 'Superseded. Kept at this address for the record.',
};

export function documentStatus(raw) {
  const label = String(raw ?? '').replace(/[*_`]/g, '').trim();
  const match = DOCUMENT_STATUSES.find((status) => status.toLowerCase() === label.toLowerCase());
  if (!match) {
    throw new Error(`article Status "${raw}" is not one of ${DOCUMENT_STATUSES.join(' / ')}; put scope and caveats in Evidence Status`);
  }
  return match;
}

export function isArchived(meta) {
  return documentStatus(meta?.status) === 'Archived';
}

// Frontmatter prose may carry inline markdown (`code`, **bold**, *em*);
// feeds and plain-text briefs want the words only.
function plain(s) {
  return String(s || '').replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1$2');
}

// Normalize build-articles' article objects (or plain test fixtures) into the
// flat shape the renderers use. Archived articles are dropped here, so no
// listing surface can carry one.
export function normalizeArticles(articles) {
  return articles
    .map((a) => {
      const meta = a.meta || {};
      const status = documentStatus(meta.status);
      return {
        slug: a.slug,
        title: a.title,
        url: `${SITE}/articles/${a.slug}/`,
        date: meta.date || '',
        updated: meta.updated || meta.date || '',
        status,
        direction: status === 'Direction',
        summary: plain(meta.summary || meta.deck || a.description),
        deck: plain(meta.deck || meta.summary || a.description),
      };
    })
    .filter((a) => a.slug && a.title && a.status !== 'Archived')
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

// The newest article date or update. `company` stays in the signature so a
// dated company fact can join the set without touching every caller.
export function asOfDate(company, articles) {
  const dates = articles.map((a) => a.updated || a.date)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  return dates.sort().at(-1) || '';
}

function absolute(href) {
  return /^https?:/.test(href) ? href : `${SITE}${href}`;
}

export function upcomingEvents(company, asOf) {
  return (company.upcoming || []).filter((e) => !asOf || (e.endDate || e.startDate) >= asOf);
}

// ── JSON-LD ────────────────────────────────────────────────────────────────

export function organizationGraph(company, { asOf } = {}) {
  const email = `${company.email.user}@${company.email.domain}`;
  const org = {
    '@type': 'Organization',
    '@id': `${SITE}/#org`,
    name: company.name,
    url: company.url,
    logo: { '@type': 'ImageObject', url: `${SITE}/lupine-science-icon.png` },
    image: `${SITE}/og-lupine-science.jpg`,
    slogan: company.tagline,
    description: company.description,
    email,
    founder: { '@id': `${SITE}/about/#founder` },
    knowsAbout: company.knowsAbout,
    sameAs: company.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: company.contactLine,
      email,
      url: `${SITE}/about/#contact`,
    },
  };
  const founder = {
    '@type': 'Person',
    '@id': `${SITE}/about/#founder`,
    name: company.founder.name,
    jobTitle: company.founder.role,
    worksFor: { '@id': `${SITE}/#org` },
    url: `${SITE}/about/`,
    sameAs: company.founder.sameAs,
  };
  const site = {
    '@type': 'WebSite',
    '@id': `${SITE}/#site`,
    url: `${SITE}/`,
    name: company.name,
    description: company.oneLiner,
    publisher: { '@id': `${SITE}/#org` },
  };
  const events = upcomingEvents(company, asOf).map((e) => ({
    '@type': 'Event',
    name: `${company.name} at ${e.name}: ${e.role.toLowerCase()}`,
    description: `${e.role} by ${company.founder.name} in ${e.session}: ${e.title}.`,
    startDate: e.startDate,
    endDate: e.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: e.venue,
      address: { '@type': 'PostalAddress', addressLocality: e.locality, addressRegion: e.region, addressCountry: e.country },
    },
    organizer: { '@type': 'Organization', name: e.organizer.name, url: e.organizer.url },
    performer: { '@id': `${SITE}/about/#founder` },
    url: absolute(e.href),
    sameAs: e.eventUrl,
  }));
  return { '@context': 'https://schema.org', '@graph': [org, founder, site, ...events] };
}

// JSON inside <script> must not be able to close the element.
export function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

// ── shared copy helpers ─────────────────────────────────────────────────────

// Visible words in a string of text or HTML, the way the word budgets in
// docs/messaging-canon.md count them: tags stripped, entities decoded, and a
// word is any whitespace-separated run that starts with a letter or digit.
export function wordCount(text) {
  const plainText = String(text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, 'x');
  return (plainText.match(/[\p{L}\p{N}]\S*/gu) || []).length;
}

// Data strings may carry [text](href) links and nothing else. Everything is
// escaped first, so a data file cannot inject markup.
export function inlineMarkup(text) {
  return escapeHtml(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`);
}
// The same strings as plain text (JSON-LD, llms.txt): link labels only.
export function inlinePlain(text) {
  return String(text ?? '').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1');
}

// Result statuses come from a closed list (docs/messaging-canon.md). A row with
// any other label is a data error, not a styling choice.
export const RESULT_STATUSES = ['Supported', 'Open', 'Failed', 'Abstained', 'Refuted by us', 'Self-corrected', 'Withdrawn'];

function statusSlug(status) {
  return String(status).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

function checkResultStatus(status, where) {
  if (!RESULT_STATUSES.includes(status)) {
    throw new Error(`company.json ${where} has status "${status}", outside ${RESULT_STATUSES.join(' / ')}`);
  }
}

function resultLabel(status) {
  return `<span class="result result-${statusSlug(status)}">${escapeHtml(status)}</span>`;
}

// Word budget for one /results/ row: what was tested, its scope and its
// result label together.
export const RESULT_ROW_WORD_BUDGET = 45;

export function testedRows(company) {
  const rows = company.tested || [];
  for (const row of rows) checkResultStatus(row.status, `tested row "${row.what}"`);
  return rows;
}

export function rowWords(row) {
  return wordCount(`${row.what} ${row.scope} ${row.status}`);
}

// ── homepage regions ────────────────────────────────────────────────────────
// The homepage answers one question: what is this, and is it real? Its
// generated regions are three scoped highlights (<!-- discovery:found -->) and
// the next public appearance (<!-- discovery:next -->). Every other result,
// failure and qualifier lives on /results/, one click away.

export function highlights(company) {
  const items = company.highlights || [];
  for (const item of items) checkResultStatus(item.status, `highlight "${item.title}"`);
  return items;
}

export function renderFoundRegion(company) {
  const cards = highlights(company).map((h) => `
      <article class="found-card">
        <p class="found-status">${resultLabel(h.status)}<span class="found-note"> · ${escapeHtml(h.note)}</span></p>
        <h3>${escapeHtml(h.title)}</h3>
        <p>${escapeHtml(h.text)}</p>
        <p class="found-link"><a href="${escapeHtml(h.href)}">${escapeHtml(h.link)} <span class="ar">→</span></a></p>
      </article>`).join('');
  return `
  <section class="beneath found" id="found" aria-labelledby="found-title">
    <h2 class="b-label" id="found-title">What we found</h2>
    <p class="found-lede">Three results, each with its scope. Not yet peer-reviewed.</p>
    <div class="found-grid">${cards}
    </div>
    <p class="b-all"><a href="/results/">Every result, failures included <span class="ar">→</span></a></p>
  </section>
  `;
}

export function renderNextRegion(company, { asOf } = {}) {
  const next = upcomingEvents(company, asOf)[0];
  if (!next) return '\n  ';
  const label = `${next.shortName || next.name}, ${next.locality}, ${formatRange(next.startDate, next.endDate)} — ${next.role.replace(/ presentation$/i, '').toLowerCase()}`;
  return `
  <section class="beneath next" aria-label="Next public appearance">
    <p class="next-line"><span class="next-k">Next</span> <a href="${escapeHtml(next.href)}">${escapeHtml(label)}</a> <span class="next-note">(a conference presentation, not a paper)</span></p>
  </section>
  `;
}

// Replace the content between <!-- discovery:NAME --> and <!-- /discovery:NAME -->.
export function injectBetween(html, name, content) {
  const open = `<!-- discovery:${name} -->`;
  const close = `<!-- /discovery:${name} -->`;
  const start = html.indexOf(open);
  const end = html.indexOf(close);
  if (start === -1 || end === -1 || end < start) throw new Error(`missing <!-- discovery:${name} --> markers`);
  return html.slice(0, start + open.length) + content + html.slice(end);
}

// ── /results/ ───────────────────────────────────────────────────────────────
// One question: what held and what did not? Every tested row, the claims we
// cannot make, and what a Lean check covers. Rows stay within
// RESULT_ROW_WORD_BUDGET words and keep their scope qualifiers.

export const LEAN_SCOPE = 'Lean 4 checks the arithmetic and stated inequalities behind published numbers; it does not check the physics, the reference data or the pipeline.';
export const RESULTS_LEDE = 'What held and what did not, each with its scope. Not peer-reviewed.';
const LEDGER_URL = 'https://github.com/alexwelcing/lupine-rhizo/blob/main/docs/conjectures/ledger.md';

export function renderTestedTable(company) {
  const rows = testedRows(company).map((r) => `
          <tr id="${escapeHtml(r.id)}">
            <th scope="row"><a href="${escapeHtml(r.href)}">${escapeHtml(r.what)}</a></th>
            <td>${escapeHtml(r.scope)}</td>
            <td>${resultLabel(r.status)}</td>
          </tr>`).join('');
  return `<div class="tested-wrap">
        <table class="tested-table">
          <thead>
            <tr><th scope="col">What we tested</th><th scope="col">Scope and numbers</th><th scope="col">Result</th></tr>
          </thead>
          <tbody>${rows}
          </tbody>
        </table>
      </div>`;
}

export function resultsJsonLd(company, asOf) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE}/results/#page`,
    url: `${SITE}/results/`,
    name: `Results — ${company.name}`,
    description: RESULTS_LEDE,
    dateModified: asOf,
    isPartOf: { '@id': `${SITE}/#site` },
    publisher: { '@id': `${SITE}/#org` },
  };
}

export function renderResultsMain(company, { asOf } = {}) {
  const cannot = company.cannotClaim.map((c) =>
    `        <li>${escapeHtml(c.text)} <a href="${escapeHtml(c.href)}">See →</a></li>`).join('\n');
  const lean = company.lean;
  const notes = (company.resultNotes || []).map((n) =>
    `      <p class="results-note">${inlineMarkup(n)}</p>`).join('\n');
  return `  <main id="content" class="article-shell about results">
    <article class="article">
      <p class="article-kicker">Results · updated <time datetime="${escapeHtml(asOf)}">${escapeHtml(formatLongDate(asOf))}</time></p>
      <h1>Results</h1>
      <p class="lead">${escapeHtml(RESULTS_LEDE)}</p>

      <h2 id="tested">Every result, failures included</h2>
      ${renderTestedTable(company)}
${notes}
      <p class="results-note">Other rounds, including Round 3, and our self-corrections are in the <a href="${LEDGER_URL}">hypothesis ledger</a>. Claims we have retired are in the <a href="/corrections/">corrections log</a>.</p>

      <h2 id="cannot">What we cannot claim</h2>
      <ul>
${cannot}
      </ul>

      <h2 id="lean">Lean-checked arithmetic</h2>
      <p>${escapeHtml(LEAN_SCOPE)}</p>
      <p>${escapeHtml(lean.example)} <a href="${escapeHtml(lean.href)}">The manuscript →</a></p>

      <p class="results-more"><a href="${LEDGER_URL}">Hypothesis ledger →</a> · <a href="/corrections/">Corrections log →</a></p>
    </article>
  </main>`;
}

// ── /about/ ─────────────────────────────────────────────────────────────────
// One question: who, how, and how to get in touch. A description, a facts
// table, three bullets on how we work, three questions, all within the
// /about/ word budget.

export function faqEntries(company) {
  return company.faq.map(({ q, a }) => ({ q, a }));
}

export function aboutJsonLd(company, asOf) {
  const graph = organizationGraph(company, { asOf })['@graph'];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE}/about/#page`,
        url: `${SITE}/about/`,
        name: `About ${company.name}`,
        about: { '@id': `${SITE}/#org` },
        isPartOf: { '@id': `${SITE}/#site` },
        dateModified: asOf,
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}/about/#faq`,
        mainEntity: faqEntries(company).map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: inlinePlain(a) },
        })),
      },
      ...graph,
    ],
  };
}

function mailLink(company, subject, text) {
  const { user, domain } = company.email;
  return `<a class="mail" href="/about/#contact" data-u="${escapeHtml(user)}" data-d="${escapeHtml(domain)}" data-subject="${escapeHtml(subject)}">${text ?? `${escapeHtml(user)} [at] ${escapeHtml(domain)}`}</a>`;
}

export function renderAboutMain(company, articles, { asOf = asOfDate(company, articles) } = {}) {
  const next = upcomingEvents(company, asOf)[0];
  // values are escaped here; link markup is trusted
  const facts = [
    ['Company', escapeHtml(company.name)],
    ['Mission', escapeHtml(company.mission)],
    ['Stage', escapeHtml(company.stage)],
    ['Founder', escapeHtml(`${company.founder.name}, ${company.founder.role.toLowerCase()}`)],
    ['Contact', `${escapeHtml(company.contactLine)}: ${mailLink(company, `Question — ${company.name}`)}`, 'contact'],
    ['Licences', `${escapeHtml(company.licence.text)} <a href="${escapeHtml(company.licence.href)}">Details →</a>`],
    ...(next ? [['Next appearance', `<a href="${escapeHtml(next.href)}">${escapeHtml(`${next.name}, ${next.locality}`)}</a> · ${escapeHtml(`${formatRange(next.startDate, next.endDate)} · ${next.role.toLowerCase()}`)}`]] : []),
  ];
  const factRows = facts.map(([k, v, id]) =>
    `        <div${id ? ` id="${id}"` : ''}><dt>${escapeHtml(k)}</dt><dd>${v}</dd></div>`).join('\n');
  const how = company.howWeWork;
  const howItems = how.items.map((s) => `        <li>${escapeHtml(s)}</li>`).join('\n');
  const faq = faqEntries(company).map(({ q, a }) =>
    `      <h3>${escapeHtml(q)}</h3>\n      <p>${inlineMarkup(a)}</p>`).join('\n');
  return `  <main id="content" class="article-shell about">
    <article class="article">
      <p class="article-kicker">Company facts · updated <time datetime="${escapeHtml(asOf)}">${escapeHtml(formatLongDate(asOf))}</time></p>
      <h1>About ${escapeHtml(company.name)}</h1>
      <p class="lead">${escapeHtml(company.description)}</p>
      <dl class="about-facts">
${factRows}
      </dl>

      <h2 id="how-we-work">How we work</h2>
      <ul>
${howItems}
      </ul>
      <p><a href="${escapeHtml(how.href)}">${escapeHtml(how.linkText)} →</a></p>

      <h2 id="faq">Common questions</h2>
${faq}
    </article>
  </main>`;
}

// ── /corrections/ ───────────────────────────────────────────────────────────
// One question: what did you retract? Every retired public claim stays listed,
// each as Was / Now / Why on one line apiece with the date retired, within
// CORRECTION_WORD_BUDGET words. Source: data/corrections.json.

export const CORRECTION_WORD_BUDGET = 60;

export function loadCorrections(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'data', 'corrections.json'), 'utf8'));
}

export function correctionWords(entry) {
  return wordCount(`${inlinePlain(entry.title)} ${inlinePlain(entry.was)} ${inlinePlain(entry.now)} ${inlinePlain(entry.why)} ${formatLongDate(entry.retired)}`);
}

export function correctionsJsonLd(corrections) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE}/corrections/#page`,
    url: `${SITE}/corrections/`,
    name: 'Corrections',
    description: corrections.description,
    dateModified: corrections.updated,
    isPartOf: { '@id': `${SITE}/#site` },
    publisher: { '@id': `${SITE}/#org` },
  };
}

export function renderCorrectionsMain(corrections) {
  const entries = corrections.entries.map((e) => `
      <h2 id="${escapeHtml(e.id)}">${inlineMarkup(e.title)}</h2>
      <dl class="about-facts">
        <div><dt>Was</dt><dd>${inlineMarkup(e.was)}</dd></div>
        <div><dt>Now</dt><dd>${inlineMarkup(e.now)}</dd></div>
        <div><dt>Why</dt><dd>${inlineMarkup(e.why)}</dd></div>
        <div><dt>Retired</dt><dd><time datetime="${escapeHtml(e.retired)}">${escapeHtml(formatLongDate(e.retired))}</time></dd></div>
      </dl>`).join('\n');
  return `  <main id="content" class="article-shell about corrections">
    <article class="article">
      <p class="article-kicker">Corrections log · updated <time datetime="${escapeHtml(corrections.updated)}">${escapeHtml(formatLongDate(corrections.updated))}</time></p>
      <h1>Corrections</h1>
      <p class="lead">${inlineMarkup(corrections.intro)}</p>
${entries}
    </article>
  </main>`;
}

// ── /llms.txt ───────────────────────────────────────────────────────────────

// Follows the llms.txt convention: H1 name, blockquote summary, then sections
// of annotated links. Company facts and publication status come first, so an
// answer engine quoting any one section still carries the scope: what we do,
// what is not peer-reviewed, and what a Lean check does and does not cover.
// Results live on /results/; articles are listed by title, status and URL
// only. Every link is absolute. The generated theorem count is deliberately
// not printed here (a count is not evidence); `leanCount` is accepted for
// compatibility with the build and ignored.
export function renderLlmsTxt(company, articles, { asOf = asOfDate(company, articles), filmsListed = true } = {}) {
  const email = `${company.email.user}@${company.email.domain}`;
  const next = upcomingEvents(company, asOf)[0];
  const lines = [];
  lines.push(`# ${company.name}`, '');
  lines.push(`> ${company.oneLiner} ${company.description.replace(/^Lupine Science is /, 'It is ')}`, '');
  lines.push(`Updated: ${asOf}`, '');
  lines.push('## Company facts', '');
  lines.push(`- Mission: ${company.mission}`);
  lines.push(`- Stage: ${company.stage}`);
  lines.push(`- Founder: ${company.founder.name}`);
  lines.push(`- Contact: ${company.contactLine}: ${email}`);
  if (next) lines.push(`- Next public appearance: ${next.name}, ${next.locality}, ${formatRange(next.startDate, next.endDate)}; ${next.role.toLowerCase()}: ${absolute(next.href)}`);
  lines.push(`- Licences: ${company.licence.text}`);
  lines.push('');
  lines.push('## Publication status', '');
  lines.push('No Lupine paper has been peer-reviewed or accepted yet. Articles on');
  lines.push('lupine.science are published on this site only, and each carries its own');
  lines.push('status label.');
  if (next?.note) lines.push('', next.note);
  lines.push('', LEAN_SCOPE);
  lines.push('');
  lines.push('## Key links', '');
  lines.push(`- Results (what held and what did not, each with its scope): ${SITE}/results/`);
  lines.push(`- Company facts: ${SITE}/about/`);
  lines.push(`- Corrections log (retired public claims, with dates and reasons): ${SITE}/corrections/`);
  lines.push(`- Articles: ${SITE}/articles/`);
  // /videos/ is offered only while at least one film is listed
  if (filmsListed) lines.push(`- Films: ${SITE}/videos/`);
  lines.push(`- Atom feed: ${SITE}/feed.xml`);
  lines.push('- Library (research corpus): https://library.lupine.science');
  lines.push('- LUPI (browser structure viewer): https://lupi.live');
  lines.push('- Research code, data and the hypothesis ledger: https://github.com/alexwelcing/lupine-rhizo');
  lines.push('- Repository: https://github.com/alexwelcing/lupine');
  lines.push('');
  lines.push('## Articles', '');
  lines.push('Newest first. Published: current statement on this site, not peer-reviewed. Working draft: may change, not for citation.', '');
  for (const a of articles.filter((x) => !x.direction)) lines.push(`- [${a.title}](${a.url}): ${a.status}`);
  lines.push('');
  lines.push('## Direction', '');
  lines.push(`${DOCUMENT_STATUS_MEANING.Direction} Any capability these pieces describe is a hypothesis to test.`, '');
  for (const a of articles.filter((x) => x.direction)) lines.push(`- [${a.title}](${a.url}): Direction`);
  lines.push('');
  return lines.join('\n');
}

// ── /feed.xml ───────────────────────────────────────────────────────────────

export function renderAtomFeed(company, articles, { asOf = asOfDate(company, articles) } = {}) {
  const stamp = (d) => `${d}T00:00:00Z`;
  const entries = articles.map((a) => `  <entry>
    <title>${escapeXml(a.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(a.url)}"/>
    <id>${escapeXml(a.url)}</id>
    <published>${stamp(a.date)}</published>
    <updated>${stamp(a.updated || a.date)}</updated>
    <summary>${escapeXml(a.summary)}</summary>${a.status ? `\n    <category term="${escapeXml(a.status)}"/>` : ''}
  </entry>`).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(company.name)}</title>
  <subtitle>${escapeXml(company.oneLiner)}</subtitle>
  <link rel="self" type="application/atom+xml" href="${SITE}/feed.xml"/>
  <link rel="alternate" type="text/html" href="${SITE}/"/>
  <id>${SITE}/</id>
  <updated>${stamp(asOf)}</updated>
  <author><name>${escapeXml(company.founder.name)}</name><uri>${SITE}/about/</uri></author>
  <icon>${SITE}/lupine-science-icon.png</icon>
${entries}
</feed>
`;
}
