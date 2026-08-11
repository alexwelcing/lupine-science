// scripts/lib/head-meta.mjs
//
// One source of truth for <title>, <meta property="og:title"> and
// <meta name="twitter:title">. Closes the title-consistency defect
// class that fired on PR #66 and PR #67: previously each builder
// emitted the three forms by hand and the smoke gate caught cases
// where og/twitter title was missing a trailing segment.
//
// API:
//   headMetaTitleSegments({ prefix, primary, suffix, separator = ' \u2014 ' })
//     -> { title, ogTitle, twitterTitle, separator }
//        - title       : "<prefix> <separator> <primary> <separator> <suffix>"
//        - ogTitle     : title (post-normalization equality with <title>)
//        - twitterTitle: title
//        - separator   : the string actually used (useful for downstream code)
//
//   renderHeadMetaTags(segments, opts)
//     -> string of HTML: <title>, <meta property="og:title" content>,
//        <meta name="twitter:title" content>, plus canonical/og:url if
//        opts.url is provided.
//
// Entity encoding:
//   - The <title> form goes through escapeHtml (encodes & -> &amp;).
//   - The og:title and twitter:title forms use escapeAttrContent, which
//     escapes < > " ' but NOT & - because the publication smoke gate
//     normalizes the <title> tag (decoding &amp; -> &) but not the meta
//     attribute content. Emitting raw & on the meta side keeps both
//     sides byte-identical post-normalization.
//
// Always use this helper instead of writing <title> / <meta> tags by hand.

export const DEFAULT_SEPARATOR = ' \u2014 '; // em-dash + spaces, the project standard

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// escapeAttrContent escapes for use inside an HTML attribute value but does
// NOT encode & -> &amp;. See comment at top of file for why.
export function escapeAttrContent(s) {
  return String(s)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function headMetaTitleSegments({ prefix, primary, suffix, separator = DEFAULT_SEPARATOR }) {
  if (!primary) throw new Error('headMeta: primary is required');
  if (!suffix) throw new Error('headMeta: suffix is required');
  const titleText = prefix
    ? `${prefix}${separator}${primary}${separator}${suffix}`
    : `${primary}${separator}${suffix}`;
  return {
    separator,
    title: titleText,
    ogTitle: titleText,
    twitterTitle: titleText,
  };
}

export function renderHeadMetaTags(segments, opts = {}) {
  if (!segments || typeof segments !== 'object') {
    throw new Error('headMeta.renderHeadMetaTags: segments is required');
  }
  const { title, ogTitle, twitterTitle } = segments;
  const lines = [
    `  <title>${escapeHtml(title)}</title>`,
    `  <meta property="og:title" content="${escapeAttrContent(ogTitle)}">`,
    `  <meta name="twitter:title" content="${escapeAttrContent(twitterTitle)}">`,
  ];
  if (opts.url) {
    lines.push(`  <link rel="canonical" href="${escapeAttrContent(opts.url)}">`);
    lines.push(`  <meta property="og:url" content="${escapeAttrContent(opts.url)}">`);
  }
  return lines.join('\n');
}
