// discovery.mjs — renders every surface a search engine, an answer engine
// (ChatGPT, Perplexity, Claude, Gemini) or an analyst's feed reader uses to
// find and describe Lupine Science, from ONE source: data/company.json plus
// the article frontmatter build-articles.mjs already parses.
//
//   homepage  <!-- discovery:jsonld -->  Organization / founder / Event graph
//   homepage  <!-- discovery:now -->     the dated "Now" strip
//   /about/                              company fact sheet + FAQ
//   /llms.txt                            plain-text brief for LLM crawlers
//   /feed.xml                            Atom feed of every article
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

// Normalize build-articles' article objects (or plain test fixtures) into the
// flat shape the renderers use. Status keeps only its leading clause — the
// same rule the article index cards use.
// Frontmatter prose may carry inline markdown (`code`, **bold**, *em*);
// feeds and plain-text briefs want the words only.
function plain(s) {
  return String(s || '').replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1$2');
}

export function normalizeArticles(articles) {
  return articles
    .map((a) => {
      const meta = a.meta || {};
      const status = String(meta.status || '').replace(/[*_`]/g, '').split(/[—;]/)[0].trim();
      return {
        slug: a.slug,
        title: a.title,
        url: `${SITE}/articles/${a.slug}/`,
        date: meta.date || '',
        updated: meta.updated || meta.date || '',
        status,
        settled: /^(published|live|final)/i.test(status),
        summary: plain(meta.summary || meta.deck || a.description),
        deck: plain(meta.deck || meta.summary || a.description),
      };
    })
    .filter((a) => a.slug && a.title)
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
      contactType: 'Investor relations and research partnerships',
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

// ── homepage "Now" strip ────────────────────────────────────────────────────

// The strip carries three honest signals: what is scheduled next, a dated run
// of what already shipped, and a way in. Dates do the persuading; there are no
// counters and no adjectives the record cannot back.
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
        <p>${escapeHtml(next.role)} in <em>${escapeHtml(next.session)}</em>: ${escapeHtml(next.title.charAt(0).toLowerCase() + next.title.slice(1))}.</p>
        <a class="now-cta mail" href="/about/#contact" data-u="${escapeHtml(company.email.user)}" data-d="${escapeHtml(company.email.domain)}" data-subject="${escapeHtml(`${next.cta} — ${company.name}`)}" data-keep-text>${escapeHtml(next.cta)} <span class="ar">→</span></a>
      </div>` : '';
  const items = shipped.map((m) => `
          <li><time datetime="${escapeHtml(m.date)}">${escapeHtml(formatShortDate(m.date))}</time><a href="${escapeHtml(m.href)}">${escapeHtml(m.text)}</a></li>`).join('');
  return `
  <section class="beneath now" id="now" aria-labelledby="now-title">
    <p class="b-label" id="now-title"><span class="now-pulse" aria-hidden="true"></span>Now · updated <time datetime="${escapeHtml(asOf)}">${escapeHtml(formatMonth(asOf))}</time></p>
    <div class="now-grid">${nextHtml}
      <div class="now-log">
        <p class="now-k">Recently shipped</p>
        <ol class="now-list">${items}
        </ol>
        <p class="b-all"><a href="/about/#milestones">Full record <span class="ar">→</span></a></p>
      </div>
      <div class="now-door">
        <p class="now-k">For investors &amp; research partners</p>
        <p>${escapeHtml(company.seeking)} ${escapeHtml(company.funding)}</p>
        <a class="now-cta mail" href="/about/#contact" data-u="${escapeHtml(company.email.user)}" data-d="${escapeHtml(company.email.domain)}" data-subject="${escapeHtml(`Briefing request — ${company.name}`)}" data-keep-text>Request a briefing <span class="ar">→</span></a>
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
      q: 'What problem does it solve?',
      a: 'Generative models and machine-learned potentials now propose and screen far more candidate materials than any lab can synthesize. The bottleneck has moved from generating candidates to knowing which predictions to trust. A prediction checked before the bench saves the year a lab would otherwise spend finding out.',
    },
    {
      q: 'How is this different from building another interatomic potential?',
      a: `${company.name} does not compete with model builders. It sits between model generation and laboratory validation: model builders get external verification, and laboratories get shortlists with characterized failure modes. The correction runs beside an existing model, with no fine-tuning or retraining.`,
    },
    {
      q: 'Is the work peer-reviewed?',
      a: 'Not yet. Every article carries its own status label (draft, final, live evidence), and every quantitative claim links to the committed data and the machine-checked Lean theorem it rests on, including the corrections that failed.',
    },
    {
      q: 'What stage is the company at, and is it raising?',
      a: `${company.stage}. ${company.funding} ${company.seeking}`,
    },
    ...(next ? [{
      q: 'Where can I meet the team?',
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

export function renderAboutMain(company, articles, { asOf = asOfDate(company, articles) } = {}) {
  const next = upcomingEvents(company, asOf)[0];
  const facts = [
    ['Company', company.name],
    ['What it does', company.oneLiner],
    ['Stage', company.stage],
    ['Funding', company.funding],
    ['Founder', `${company.founder.name}, ${company.founder.role.toLowerCase()}`],
    ...(next ? [['Next public appearance', `${next.name}, ${next.locality} · ${formatRange(next.startDate, next.endDate)} · ${next.role.toLowerCase()}`]] : []),
    ['Open surfaces', '<a href="/articles/">Articles</a> · <a href="https://library.lupine.science">Library</a> · <a href="https://lupi.live">LUPI viewer</a> · <a href="https://github.com/alexwelcing/lupine">Source</a> · <a href="/feed.xml">Feed</a>'],
  ];
  const factRows = facts.map(([k, v], i) =>
    `        <div><dt>${escapeHtml(k)}</dt><dd>${i === facts.length - 1 ? v : escapeHtml(v)}</dd></div>`).join('\n');
  const approach = company.approach.map((s) =>
    `        <div><dt>${escapeHtml(s.term)}</dt><dd>${escapeHtml(s.text)}</dd></div>`).join('\n');
  const audiences = company.audiences.map((a) =>
    `        <li><strong>${escapeHtml(a.who)}.</strong> ${escapeHtml(a.text)} <a href="${escapeHtml(a.href)}">Start here →</a></li>`).join('\n');
  const milestones = [...company.milestones].sort((a, b) => b.date.localeCompare(a.date)).map((m) =>
    `        <li><time datetime="${escapeHtml(m.date)}">${escapeHtml(formatLongDate(m.date))}</time> — <a href="${escapeHtml(m.href)}">${escapeHtml(m.text)}</a></li>`).join('\n');
  const latest = articles.slice(0, 6).map((a) =>
    `        <li><time datetime="${escapeHtml(a.date)}">${escapeHtml(formatLongDate(a.date))}</time> — <a href="/articles/${escapeHtml(a.slug)}/">${escapeHtml(a.title)}</a>${a.status ? ` <span class="about-status">${escapeHtml(a.status)}</span>` : ''}</li>`).join('\n');
  const faq = faqEntries(company, asOf).map(({ q, a }) =>
    `      <h3>${escapeHtml(q)}</h3>\n      <p>${escapeHtml(a)}</p>`).join('\n');
  const email = company.email;
  return `  <main id="content" class="article-shell about">
    <article class="article">
      <p class="article-kicker">Company facts · updated <time datetime="${escapeHtml(asOf)}">${escapeHtml(formatLongDate(asOf))}</time></p>
      <h1>${escapeHtml(company.name)} at a glance</h1>
      <p class="lead">${escapeHtml(company.description)}</p>
      <dl class="about-facts">
${factRows}
      </dl>

      <h2 id="approach">How it works</h2>
      <dl class="about-facts">
${approach}
      </dl>

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
      <p><a href="/articles/">All articles →</a> · <a href="/feed.xml">Subscribe to the feed →</a></p>

      <h2 id="faq">Questions investors and scientists ask</h2>
${faq}

      <h2 id="contact">Contact</h2>
      <p>${escapeHtml(company.seeking)} Write to <a class="mail" href="/about/#contact" data-u="${escapeHtml(email.user)}" data-d="${escapeHtml(email.domain)}" data-subject="${escapeHtml(`Briefing request — ${company.name}`)}">${escapeHtml(email.user)} [at] ${escapeHtml(email.domain)}</a>.</p>
    </article>
  </main>`;
}

// ── /llms.txt ───────────────────────────────────────────────────────────────

// Follows the llms.txt convention: H1 name, blockquote summary, then sections
// of annotated links. Written for answer engines that are asked things like
// "which early-stage AI-for-materials companies should I look at?", so the
// facts an analyst filters on (stage, funding, focus, founder, contact) come
// first and every link is absolute.
export function renderLlmsTxt(company, articles, { asOf = asOfDate(company, articles), leanCount } = {}) {
  const email = `${company.email.user}@${company.email.domain}`;
  const next = upcomingEvents(company, asOf)[0];
  const lines = [];
  lines.push(`# ${company.name}`, '');
  lines.push(`> ${company.oneLiner} ${company.description.replace(/^Lupine Science is /, 'It is ')}`, '');
  lines.push(`Updated: ${asOf}`, '');
  lines.push('## Company facts', '');
  lines.push(`- Stage: ${company.stage}`);
  lines.push(`- Funding: ${company.funding}`);
  lines.push(`- Looking for: ${company.seeking}`);
  lines.push(`- Founder: ${company.founder.name}`);
  lines.push(`- Contact: ${email}`);
  lines.push(`- Focus: ${company.knowsAbout.join('; ')}`);
  if (next) lines.push(`- Next public appearance: ${next.name}, ${next.locality}, ${formatRange(next.startDate, next.endDate)}; ${next.role.toLowerCase()} in ${next.session}: ${absolute(next.href)}`);
  lines.push(`- Company fact sheet: ${SITE}/about/`);
  lines.push('');
  lines.push('## Approach', '');
  for (const s of company.approach) lines.push(`- ${s.term}: ${s.text}`);
  if (leanCount) lines.push(`- Lean library: ${leanCount.count} build-locked theorems, zero sorry (counted ${leanCount.counted_at}).`);
  lines.push('');
  lines.push('## Milestones', '');
  for (const m of [...company.milestones].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(`- ${m.date}: ${m.text}: ${absolute(m.href)}`);
  }
  lines.push('');
  lines.push('## Articles', '');
  lines.push('Newest first. Status labels are the article\'s own; drafts are marked as drafts.', '');
  for (const a of articles) {
    lines.push(`- [${a.title}](${a.url}) (${a.date}${a.status ? `, ${a.status}` : ''}): ${a.summary}`);
  }
  lines.push('');
  lines.push('## Canonical surfaces', '');
  lines.push(`- Website: ${SITE}/`);
  lines.push(`- Articles: ${SITE}/articles/`);
  lines.push(`- Films: ${SITE}/videos/`);
  lines.push(`- Atlas of claims: ${SITE}/atlas/`);
  lines.push(`- Atom feed: ${SITE}/feed.xml`);
  lines.push('- Library (research corpus): https://library.lupine.science');
  lines.push('- LUPI (browser evidence viewer): https://lupi.live');
  lines.push('- Repository: https://github.com/alexwelcing/lupine');
  lines.push('');
  lines.push('## Publication status', '');
  lines.push('Public paper status: working draft in preparation; no peer review, no');
  lines.push('acceptance, and no journal or venue assignment. The TMS2027 poster abstract');
  lines.push('is a conference presentation, not a paper. Prefer Library and repository');
  lines.push('pages for current claim labels, Lean status, and evidence details.');
  lines.push('');
  lines.push('## Homepage data', '');
  lines.push('The homepage renders one cavity of MOF-5 (Zn4O(BDC)3) live from the committed');
  lines.push(`crystal structure at ${SITE}/data/mof5_structure.json (COD 1516287; Li, Eddaoudi,`);
  lines.push('O\'Keeffe & Yaghi, Nature 402, 276 (1999)), and computes its benchmark figures');
  lines.push(`in the browser from ${SITE}/data/benchmark_manifold.json.`);
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
