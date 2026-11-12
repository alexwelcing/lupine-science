// discovery.mjs — renders every surface a search engine, an answer engine
// (ChatGPT, Perplexity, Claude, Gemini) or an analyst's feed reader uses to
// find and describe Lupine Science, from ONE source: data/company.json plus
// the article frontmatter build-articles.mjs already parses.
//
//   homepage  <!-- discovery:jsonld -->  Organization / founder / Event graph
//   homepage  <!-- discovery:now -->     "Where it has been tested" table and
//                                        the dated record strip
//   /about/                              company fact sheet + FAQ
//   /llms.txt                            plain-text brief for LLM crawlers
//   /feed.xml                            Atom feed of every article
//
// Messaging rules for every string here: docs/messaging-canon.md. No funding
// statements, no bare counters, every number with the qualifier its evidence
// file attaches to it.
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

export function asOfDate(company, articles) {
  const dates = [
    ...articles.map((a) => a.updated || a.date),
    ...(company.milestones || []).map((m) => m.date),
  ].filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
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

// ── homepage "Where it has been tested" + record strip ──────────────────────

// Result statuses come from a closed list (docs/messaging-canon.md). A row with
// any other label is a data error, not a styling choice.
export const RESULT_STATUSES = ['Supported', 'Open', 'Failed', 'Abstained', 'Refuted by us', 'Self-corrected', 'Withdrawn'];

function statusSlug(status) {
  return String(status).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

export function testedRows(company) {
  const rows = company.tested || [];
  for (const row of rows) {
    if (!RESULT_STATUSES.includes(row.status)) {
      throw new Error(`company.json tested row "${row.what}" has status "${row.status}", outside ${RESULT_STATUSES.join(' / ')}`);
    }
  }
  return rows;
}

export function renderTestedTable(company) {
  const rows = testedRows(company).map((r) => `
          <tr>
            <th scope="row"><a href="${escapeHtml(r.href)}">${escapeHtml(r.what)}</a></th>
            <td>${escapeHtml(r.scope)}</td>
            <td><span class="result result-${statusSlug(r.status)}">${escapeHtml(r.status)}</span></td>
          </tr>`).join('');
  return `
  <section class="beneath tested" id="tested" aria-labelledby="tested-title">
    <p class="b-label" id="tested-title">Where it has been tested</p>
    <p class="tested-lede">Results we have published, failures beside passes, each with the scope it holds in. They are not yet peer-reviewed. Other rounds, including Round 3, and our self-corrections are in the <a href="https://github.com/alexwelcing/lupine-rhizo/blob/main/docs/conjectures/ledger.md">hypothesis ledger</a>.</p>
    <div class="tested-wrap">
      <table class="tested-table">
        <thead>
          <tr><th scope="col">What we tested</th><th scope="col">Scope and numbers</th><th scope="col">Result</th></tr>
        </thead>
        <tbody>${rows}
        </tbody>
      </table>
    </div>
    <p class="b-all"><a href="/corrections/">Claims we have retired, and why <span class="ar">→</span></a></p>
  </section>`;
}

// The record strip carries three honest signals: what is scheduled next, a
// dated run of what already shipped, and a way in. Dates do the persuading;
// there are no counters, no funding lines and no adjectives the record cannot
// back. The homepage's <!-- discovery:now --> region holds the tested table
// followed by this strip, so both regenerate from data/company.json.
export function renderNowStrip(company, articles, { asOf = asOfDate(company, articles), limit = 5 } = {}) {
  const next = upcomingEvents(company, asOf)[0];
  const shipped = [...(company.milestones || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
  const nextHtml = next ? `
      <div class="now-next">
        <p class="now-k">Next</p>
        <p class="now-when"><time datetime="${escapeHtml(next.startDate)}">${escapeHtml(formatRange(next.startDate, next.endDate))}</time> · ${escapeHtml(next.locality)}</p>
        <h2><a href="${escapeHtml(next.href)}">${escapeHtml(next.name)}</a></h2>
        <p>${escapeHtml(next.role)} in <em>${escapeHtml(next.session)}</em>: “${escapeHtml(next.title)}.”</p>${next.note ? `
        <p class="now-note">${escapeHtml(next.note)}</p>` : ''}
        <a class="now-cta mail" href="/about/#contact" data-u="${escapeHtml(company.email.user)}" data-d="${escapeHtml(company.email.domain)}" data-subject="${escapeHtml(`${next.cta} — ${company.name}`)}" data-keep-text>${escapeHtml(next.cta)} <span class="ar">→</span></a>
      </div>` : '';
  const items = shipped.map((m) => `
          <li><time datetime="${escapeHtml(m.date)}">${escapeHtml(formatShortDate(m.date))}</time><a href="${escapeHtml(m.href)}">${escapeHtml(m.text)}</a></li>`).join('');
  return `${renderTestedTable(company)}

  <section class="beneath now" id="now" aria-labelledby="now-title">
    <p class="b-label" id="now-title">Record · updated <time datetime="${escapeHtml(asOf)}">${escapeHtml(formatMonth(asOf))}</time></p>
    <div class="now-grid">${nextHtml}
      <div class="now-log">
        <p class="now-k">Recently published</p>
        <ol class="now-list">${items}
        </ol>
        <p class="b-all"><a href="/about/#milestones">Full record <span class="ar">→</span></a></p>
      </div>
      <div class="now-door">
        <p class="now-k">Questions and replication</p>
        <p>${escapeHtml(company.seeking)}</p>
        <a class="now-cta mail" href="/about/#contact" data-u="${escapeHtml(company.email.user)}" data-d="${escapeHtml(company.email.domain)}" data-subject="${escapeHtml(`Question — ${company.name}`)}" data-keep-text>Write to us <span class="ar">→</span></a>
        <a class="now-sub" href="/about/">Company facts <span class="ar">→</span></a>
      </div>
    </div>
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

// ── /about/ ─────────────────────────────────────────────────────────────────

export function faqEntries(company, asOf) {
  const next = upcomingEvents(company, asOf)[0];
  return [
    {
      q: `What does ${company.name} do?`,
      a: company.description,
    },
    {
      q: 'What problem does it address?',
      a: 'Machine-learned potentials now screen far more candidate materials than any lab can test, and a model can be confident and wrong. Before a lab commits a year to a candidate, it needs to know where the underlying model is likely to miss. We measure that against published references, under gates set in advance, and publish the verdicts.',
    },
    {
      q: 'How is this different from building another interatomic potential?',
      a: `${company.name} does not build a potential and has no correction product. We measure existing models against published references under preregistered gates. Corrections have held only in narrow, stated cases, and both Round-4 correction tests (July 2026) failed.`,
    },
    {
      q: 'Is the work peer-reviewed?',
      a: 'No Lupine paper has been peer-reviewed or accepted yet. The TMS2027 poster abstract was accepted for presentation; it is a conference presentation, not a paper. Each article carries a status label and links the data it uses. Where a Lean check exists, it checks the arithmetic and stated inequalities behind a number, not the physics, the reference data or the pipeline.',
    },
    {
      q: 'Will the newest universal potentials, with their own uncertainty estimates, make this unnecessary?',
      a: 'They may change what needs testing, and we have not tested them yet. Our tests so far cover earlier universal potentials, not the newest multi-head or multi-fidelity models or their confidence heads. What they do not replace is an outside, preregistered measurement against published references: that is what a model\'s own uncertainty can be checked against, and agreement among models trained on similar data cannot certify accuracy. Our own record is a reason for care: in a preregistered test, our 90% conformal intervals reached only 86.7% coverage (Projection Law Round 2). We have not run a head-to-head on these newer models; a fair one would need a training-overlap audit against our locked panels.',
    },
    {
      q: 'Who does the work?',
      a: `${company.name} is founder-led. ${company.founder.name}, the founder, does the work with AI coding and research agents under rules that live in code; a human author is responsible for every public summary. "How Lupine works" on this page lists those rules and where data goes.`,
    },
    ...(next ? [{
      q: `Where can I meet ${company.name} in person?`,
      a: `At ${next.name} in ${next.locality}, ${formatRange(next.startDate, next.endDate)}: ${next.role.toLowerCase()} in ${next.session}. Write ahead to set a time.`,
    }] : []),
  ];
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
        mainEntity: faqEntries(company, asOf).map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
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
  // values are escaped here; the last row is trusted link markup
  const facts = [
    ['Company', escapeHtml(company.name)],
    ['What it does', escapeHtml(company.oneLiner)],
    ['Mission', escapeHtml(company.mission)],
    ['Stage', escapeHtml(company.stage)],
    ['Founder', escapeHtml(`${company.founder.name}, ${company.founder.role.toLowerCase()}`)],
    ...(next ? [['Next public appearance', escapeHtml(`${next.name}, ${next.locality} · ${formatRange(next.startDate, next.endDate)} · ${next.role.toLowerCase()}`)]] : []),
    ['Licences', `${escapeHtml(company.licence.text)} <a href="${escapeHtml(company.licence.href)}">Details →</a>`],
    ['Open surfaces', '<a href="/articles/">Articles</a> · <a href="https://library.lupine.science">Library</a> · <a href="https://lupi.live">LUPI viewer</a> · <a href="https://github.com/alexwelcing/lupine-rhizo">Research code and data</a> · <a href="https://github.com/alexwelcing/lupine">Source</a> · <a href="/corrections/">Corrections</a> · <a href="/feed.xml">Feed</a>'],
  ];
  const factRows = facts.map(([k, v]) =>
    `        <div><dt>${escapeHtml(k)}</dt><dd>${v}</dd></div>`).join('\n');
  const approach = company.approach.map((s) =>
    `        <div><dt>${escapeHtml(s.term)}</dt><dd>${escapeHtml(s.text)}</dd></div>`).join('\n');
  const op = company.operatingModel;
  const rules = op.rules.map((r) => `        <li>${escapeHtml(r)}</li>`).join('\n');
  const claimItems = (list, label) => list.map((c) =>
    `        <li>${escapeHtml(c.text)} <a href="${escapeHtml(c.href)}">${label} →</a></li>`).join('\n');
  const audiences = company.audiences.map((a) =>
    `        <li><strong>${escapeHtml(a.who)}.</strong> ${escapeHtml(a.text)} <a href="${escapeHtml(a.href)}">Start here →</a></li>`).join('\n');
  const milestones = [...company.milestones].sort((a, b) => b.date.localeCompare(a.date)).map((m) =>
    `        <li><time datetime="${escapeHtml(m.date)}">${escapeHtml(formatLongDate(m.date))}</time> — <a href="${escapeHtml(m.href)}">${escapeHtml(m.text)}</a></li>`).join('\n');
  const latest = articles.slice(0, 6).map((a) =>
    `        <li><time datetime="${escapeHtml(a.date)}">${escapeHtml(formatLongDate(a.date))}</time> — <a href="/articles/${escapeHtml(a.slug)}/">${escapeHtml(a.title)}</a>${a.status ? ` <span class="about-status">${escapeHtml(a.status)}</span>` : ''}</li>`).join('\n');
  const faq = faqEntries(company, asOf).map(({ q, a }) =>
    `      <h3>${escapeHtml(q)}</h3>\n      <p>${escapeHtml(a)}</p>`).join('\n');
  return `  <main id="content" class="article-shell about">
    <article class="article">
      <p class="article-kicker">Company facts · updated <time datetime="${escapeHtml(asOf)}">${escapeHtml(formatLongDate(asOf))}</time></p>
      <h1>${escapeHtml(company.name)} at a glance</h1>
      <p class="lead">${escapeHtml(company.description)}</p>
      <dl class="about-facts">
${factRows}
      </dl>

      <h2 id="approach">How the research works</h2>
      <dl class="about-facts">
${approach}
      </dl>

      <h2 id="claims">What we can and cannot claim</h2>
      <p>We can claim, with the scope attached:</p>
      <ul>
${claimItems(company.claims.can, 'Evidence')}
      </ul>
      <p>We cannot claim:</p>
      <ul>
${claimItems(company.claims.cannot, 'See')}
      </ul>
      <p>Public claims we have retired are listed, with dates and reasons, in the <a href="/corrections/">corrections log</a>.</p>

      <h2 id="how-lupine-works">How Lupine works</h2>
      <p>${escapeHtml(op.summary)} The rules, and how far each reaches:</p>
      <ul>
${rules}
      </ul>
      <p><strong>Where data goes.</strong> ${escapeHtml(op.dataFlow)}</p>
      <p>${escapeHtml(op.keyPerson)} <a href="${escapeHtml(op.href)}">AI and data statement →</a></p>

      <h2 id="start">Where to start</h2>
      <ul>
${audiences}
      </ul>

      <h2 id="milestones">Milestones</h2>
      <ul class="about-log">
${milestones}
      </ul>

      <h2 id="latest">Latest notes</h2>
      <ul class="about-log">
${latest}
      </ul>
      <p><a href="/articles/">All articles →</a> · <a href="/feed.xml">Subscribe to the feed →</a> · <a href="/corrections/">Corrections log →</a></p>

      <h2 id="faq">Common questions</h2>
${faq}

      <h2 id="contact">Contact</h2>
      <p>${escapeHtml(company.seeking)}</p>
      <p>${escapeHtml(company.contactLine)}: ${mailLink(company, `Question — ${company.name}`)}.</p>
    </article>
  </main>`;
}

// ── /llms.txt ───────────────────────────────────────────────────────────────

// Follows the llms.txt convention: H1 name, blockquote summary, then sections
// of annotated links. Company facts and publication status come first, so an
// answer engine quoting any one section still carries the scope: what we do,
// what is not peer-reviewed, and what a Lean check does and does not cover.
// Every link is absolute. The generated theorem count is deliberately not
// printed here (a count is not evidence); `leanCount` is accepted for
// compatibility with the build and ignored.
function llmsHref(href) {
  if (String(href).startsWith('#')) return `${SITE}/about/${href}`;
  return absolute(href);
}

export function renderLlmsTxt(company, articles, { asOf = asOfDate(company, articles), filmsListed = true } = {}) {
  const email = `${company.email.user}@${company.email.domain}`;
  const next = upcomingEvents(company, asOf)[0];
  const op = company.operatingModel;
  const lines = [];
  lines.push(`# ${company.name}`, '');
  lines.push(`> ${company.oneLiner} ${company.description.replace(/^Lupine Science is /, 'It is ')}`, '');
  lines.push(`Updated: ${asOf}`, '');
  lines.push('## Company facts', '');
  lines.push(`- Mission: ${company.mission}`);
  lines.push(`- Stage: ${company.stage}`);
  lines.push(`- Founder: ${company.founder.name}`);
  lines.push(`- Contact: ${company.contactLine}: ${email}`);
  lines.push(`- Focus: ${company.knowsAbout.join('; ')}`);
  if (next) lines.push(`- Next public appearance: ${next.name}, ${next.locality}, ${formatRange(next.startDate, next.endDate)}; ${next.role.toLowerCase()} in ${next.session}, "${next.title}": ${absolute(next.href)}`);
  lines.push(`- Licences: ${company.licence.text}`);
  lines.push(`- Company fact sheet: ${SITE}/about/`);
  lines.push(`- Corrections log (retired public claims, with dates and reasons): ${SITE}/corrections/`);
  lines.push('');
  lines.push('## Publication status', '');
  lines.push('No Lupine paper has been peer-reviewed or accepted yet. Articles on');
  lines.push('lupine.science are published on this site only, and each carries its own');
  lines.push('status label.');
  if (next?.note) lines.push('', next.note);
  lines.push('');
  lines.push('Lean 4 checks the arithmetic and stated inequalities behind published');
  lines.push('numbers; it does not check the physics, the reference data or the pipeline.');
  lines.push('');
  lines.push('## Approach', '');
  for (const s of company.approach) lines.push(`- ${s.term}: ${s.text}`);
  lines.push('');
  lines.push('## Where it has been tested', '');
  lines.push('Results we have published, failures beside passes, each with its scope. Status is one of Supported, Open, Failed, Abstained. They are not yet peer-reviewed. Other rounds, including Round 3, and self-corrections: https://github.com/alexwelcing/lupine-rhizo/blob/main/docs/conjectures/ledger.md', '');
  for (const r of testedRows(company)) lines.push(`- ${r.status}: ${r.what}. ${r.scope} ${llmsHref(r.href)}`);
  lines.push('');
  lines.push('## What we can and cannot claim', '');
  for (const c of company.claims.can) lines.push(`- We can claim: ${c.text} ${llmsHref(c.href)}`);
  for (const c of company.claims.cannot) lines.push(`- We cannot claim: ${c.text} ${llmsHref(c.href)}`);
  lines.push('');
  lines.push('## How Lupine works', '');
  lines.push(op.summary, '');
  for (const r of op.rules) lines.push(`- ${r}`);
  lines.push('', `Where data goes: ${op.dataFlow}`, '', op.keyPerson, '', `AI and data statement: ${op.href}`);
  lines.push('');
  lines.push('## Milestones', '');
  for (const m of [...company.milestones].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(`- ${m.date}: ${m.text}: ${absolute(m.href)}`);
  }
  lines.push('');
  lines.push('## Results and methods', '');
  lines.push('Newest first. Status is Published (current statement on this site, not peer-reviewed) or Working draft (may change, not for citation).', '');
  for (const a of articles.filter((x) => !x.direction)) {
    lines.push(`- [${a.title}](${a.url}) (${a.date}, ${a.status}): ${a.summary}`);
  }
  lines.push('');
  lines.push('## Direction (where the work is aimed; not results)', '');
  lines.push('These pieces describe where the work is aimed. They are not results, and any capability they describe is a hypothesis to test.', '');
  for (const a of articles.filter((x) => x.direction)) {
    lines.push(`- [${a.title}](${a.url}) (${a.date}, Direction): ${a.summary}`);
  }
  lines.push('');
  lines.push('## Canonical surfaces', '');
  lines.push(`- Website: ${SITE}/`);
  lines.push(`- Company facts: ${SITE}/about/`);
  lines.push(`- Corrections log: ${SITE}/corrections/`);
  lines.push(`- Articles: ${SITE}/articles/`);
  // /videos/ is offered only while at least one film is listed
  if (filmsListed) lines.push(`- Films: ${SITE}/videos/`);
  lines.push(`- Atom feed: ${SITE}/feed.xml`);
  lines.push('- Library (research corpus): https://library.lupine.science');
  lines.push('- LUPI (browser structure viewer): https://lupi.live');
  lines.push('- Research code and data: https://github.com/alexwelcing/lupine-rhizo');
  lines.push('- Repository: https://github.com/alexwelcing/lupine');
  lines.push('');
  lines.push('## Homepage data', '');
  lines.push('The homepage background is an illustration, not a result: it is drawn from');
  lines.push(`error statistics of four classical (EAM) potentials at ${SITE}/data/benchmark_manifold.json`);
  lines.push('and from one cavity of MOF-5 (Zn4O(BDC)3), rendered from the committed');
  lines.push(`crystal structure at ${SITE}/data/mof5_structure.json (COD 1516287; Li, Eddaoudi,`);
  lines.push('O\'Keeffe & Yaghi, Nature 402, 276 (1999)).');
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
