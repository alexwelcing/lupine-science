// Password wall for the venture deck. _routes.json sends only /venture and
// /venture/* here; every other path is served as plain static files, so the
// public site never runs this code.
//
// The password is the VENTURE_DECK_PASSWORD environment variable set on the
// Cloudflare Pages project. There is no fallback: if the variable is unset or
// empty, the deck fails closed with 503 instead of opening to a default.
const REALM = 'Lupine Science venture deck';

const PRIVATE_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

export default {
  async fetch(request, env) {
    const expected = typeof env?.VENTURE_DECK_PASSWORD === 'string' ? env.VENTURE_DECK_PASSWORD : '';
    if (!expected) {
      return new Response('Deck temporarily unavailable.\n', {
        status: 503,
        headers: { ...PRIVATE_HEADERS, 'Retry-After': '3600' },
      });
    }
    if (!authorized(request.headers.get('Authorization'), expected)) {
      return new Response('This page is password protected.\n', {
        status: 401,
        headers: {
          ...PRIVATE_HEADERS,
          'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
        },
      });
    }
    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    // never let a shared cache hand an unlocked deck to the next visitor
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  },
};

// Basic auth: any username, the password must match.
function authorized(header, expected) {
  if (!header || !header.startsWith('Basic ')) return false;
  let decoded;
  try { decoded = atob(header.slice(6)); } catch { return false; }
  return constantTimeEqual(decoded.slice(decoded.indexOf(':') + 1), expected);
}

function constantTimeEqual(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}
