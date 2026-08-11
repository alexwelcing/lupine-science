// scripts/lib/brand-header.mjs
//
// One source of truth for the Lupine Science brand SVG mark used in the
// site header on every public page. Closes the duplication that grew
// across build-atlas-page.mjs, build-atlas-detail-pages.mjs, and
// build-claim-facets.mjs (each inlined the same 90 lines of SVG).
//
// API:
//   renderSiteHeader({ ariaCurrentPath, links, brandLabel, brandTagline })
//     -> string of HTML for the <header class="site-header"> block.
//
// ariaCurrentPath: optional site-root-relative path (e.g. "/articles/")
//                   to mark as aria-current="page". Matches by
//                   link.href prefix, so "/articles/foo/" matches a link
//                   with href "/articles/".
// links: array of { href, label }. The brand mark and brand label are
//        emitted separately from the nav, so the same component works
//        for the homepage (no aria-current) and for sub-pages.
//
// The SVG itself is byte-identical to the inlined version that shipped
// in PR #63. Any change to the brand mark goes here; the three builders
// consume the helper.

const BRAND_SVG = `<svg viewBox="100 44 312 440" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="bb" x1="190" y1="74" x2="324" y2="356" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#88a7d8"/><stop offset=".35" stop-color="#475b9c"/><stop offset=".78" stop-color="#102f47"/><stop offset="1" stop-color="#071a2a"/>
          </linearGradient>
          <linearGradient id="bl" x1="150" y1="330" x2="360" y2="470" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#7f907c"/><stop offset="1" stop-color="#4c653d"/>
          </linearGradient>
          <radialGradient id="bc" cx="48%" cy="30%" r="68%">
            <stop offset="0" stop-color="#fffdf3"/><stop offset=".7" stop-color="#f1e8c9"/><stop offset="1" stop-color="#d4c58f"/>
          </radialGradient>
        </defs>
        <g fill="none" stroke="#4c653d" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
          <path d="M256 148 C252 224 258 312 254 448"/><path d="M252 402 C222 372 178 354 124 348"/><path d="M260 402 C290 372 334 354 388 348"/>
        </g>
        <g fill="url(#bl)" opacity=".96">
          <ellipse cx="139" cy="348" rx="18" ry="62" transform="rotate(-78 139 348)"/><ellipse cx="167" cy="384" rx="18" ry="62" transform="rotate(-48 167 384)"/><ellipse cx="214" cy="410" rx="17" ry="58" transform="rotate(-20 214 410)"/><ellipse cx="373" cy="348" rx="18" ry="62" transform="rotate(78 373 348)"/><ellipse cx="345" cy="384" rx="18" ry="62" transform="rotate(48 345 384)"/><ellipse cx="298" cy="410" rx="17" ry="58" transform="rotate(20 298 410)"/>
        </g>
        <g fill="none" stroke="#fef8f5" stroke-width="5" stroke-linecap="round" opacity=".66">
          <path d="M132 348 C170 356 205 373 236 405"/><path d="M380 348 C342 356 307 373 276 405"/>
        </g>
        <g fill="url(#bb)" stroke="#fef8f5" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="256" cy="86" rx="22" ry="34"/><ellipse cx="232" cy="122" rx="23" ry="35" transform="rotate(-24 232 122)"/><ellipse cx="280" cy="122" rx="23" ry="35" transform="rotate(24 280 122)"/><ellipse cx="256" cy="150" rx="30" ry="40"/><ellipse cx="211" cy="182" rx="26" ry="38" transform="rotate(-34 211 182)"/><ellipse cx="301" cy="182" rx="26" ry="38" transform="rotate(34 301 182)"/><ellipse cx="256" cy="216" rx="37" ry="48"/><ellipse cx="204" cy="256" rx="30" ry="43" transform="rotate(-42 204 256)"/><ellipse cx="308" cy="256" rx="30" ry="43" transform="rotate(42 308 256)"/><ellipse cx="256" cy="306" rx="40" ry="52"/>
        </g>
        <g fill="url(#bc)">
          <path d="M244 142 C251 124 261 124 268 142 C262 136 250 136 244 142Z"/><path d="M244 207 C252 186 263 186 271 207 C263 199 252 199 244 207Z"/><path d="M242 296 C252 272 265 272 274 296 C264 286 252 286 242 296Z"/>
        </g>
      </svg>`;

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderSiteHeader({
  ariaCurrentPath = null,
  links = [
    { href: '/', label: 'Home' },
    { href: '/articles/', label: 'Articles' },
    { href: '/videos/', label: 'Videos' },
    { href: '/atlas/', label: 'Atlas' },
    { href: 'https://library.lupine.science', label: 'Library' },
    { href: 'https://lupi.live', label: 'LUPI' },
  ],
  brandLabel = 'Lupine Science',
  brandTagline = 'accelerating materials discovery',
} = {}) {
  const navItems = links.map((link) => {
    const isCurrent = ariaCurrentPath
      && (link.href === ariaCurrentPath
        || (link.href !== '/' && ariaCurrentPath.startsWith(link.href)));
    return `      <a href="${escapeAttr(link.href)}"${isCurrent ? ' aria-current="page"' : ''}>${escapeAttr(link.label)}</a>`;
  }).join('\n');

  return `<header class="site-header">
    <a class="mark" href="/" aria-label="${escapeAttr(brandLabel)}">
      ${BRAND_SVG}
      <span><b>${escapeAttr(brandLabel)}</b> <span class="tld">${escapeAttr(brandTagline)}</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
${navItems}
    </nav>
  </header>`;
}
