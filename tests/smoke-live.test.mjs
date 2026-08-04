import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import http from 'node:http';

import { resolveBaseUrls, runSmokeSuite } from '../scripts/smoke-live.mjs';
import { normalizeExtractedText } from '../scripts/lib/live-smoke-suite.mjs';

let baseUrl;
let externalBaseUrl;
let server;

const page = ({ path = '/', body = '', links = '' } = {}) => `<!doctype html>
<html><head>
<title>Test page</title>
<meta name="description" content="Smoke fixture">
<meta property="og:title" content="Test page">
<meta property="og:description" content="Smoke fixture">
<meta property="og:type" content="website">
<meta property="og:url" content="${baseUrl}${path}">
<meta property="og:image" content="${baseUrl}/share.jpg">
<link rel="canonical" href="${baseUrl}${path}">
</head><body>${body}${links}</body></html>`;

before(async () => {
  server = http.createServer((request, response) => {
    const send = (status, contentType, body = '') => {
      response.writeHead(status, { 'content-type': contentType });
      response.end(request.method === 'HEAD' ? '' : body);
    };

    if (request.url?.startsWith('/share.jpg')) return send(200, 'image/jpeg', 'image');
    if (request.url === '/sitemap.xml') return send(200, 'application/xml', '<urlset></urlset>');
    if (request.url === '/film.mp4') return send(200, 'video/mp4', 'video');
    if (request.url === '/paper.pdf') return send(200, 'application/pdf', 'pdf');
    if (request.url === '/missing.mp4') return send(404, 'text/plain', 'missing');
    if (request.url === '/missing-share.jpg') return send(404, 'text/plain', 'missing');
    if (request.url === '/infrastructure/') return send(503, 'text/plain', 'temporarily unavailable');
    if (request.url === '/healthy/') {
      return send(200, 'text/html', page({
        path: '/healthy/',
        body: '<h1>Healthy</h1><video><source src="/film.mp4" type="video/mp4"></video>',
        links: '<a href="/paper.pdf" download>Paper</a>'
      }));
    }
    if (request.url === '/broken-video/') {
      return send(200, 'text/html', page({
        path: '/broken-video/',
        links: '<a href="/missing.mp4">Film</a>'
      }));
    }
    if (request.url === '/missing-metadata/') {
      return send(200, 'text/html', '<!doctype html><html><head><title>Incomplete</title></head><body></body></html>');
    }
    if (request.url === '/broken-share-urls/') {
      return send(200, 'text/html', `<!doctype html><html><head>
        <title>Broken share URLs</title>
        <meta property="og:title" content="Broken share URLs">
        <meta property="og:description" content="Smoke fixture">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${baseUrl}/missing-og-page/">
        <meta property="og:image" content="${baseUrl}/missing-share.jpg">
        <link rel="canonical" href="${baseUrl}/missing-canonical-page/">
      </head><body></body></html>`);
    }
    if (request.url === '/canonical-share/') {
      return send(200, 'text/html', `<!doctype html><html><head>
        <title>Canonical share</title>
        <meta name="description" content="Smoke fixture">
        <meta property="og:title" content="Canonical share">
        <meta property="og:description" content="Smoke fixture">
        <meta property="og:type" content="article">
        <meta property="og:url" content="https://example.test/canonical-share/">
        <meta property="og:image" content="https://example.test/share.jpg?v=3">
        <link rel="canonical" href="https://example.test/canonical-share/">
      </head><body><h1>Canonical share</h1></body></html>`);
    }
    if (request.url === '/relative-og-image/') {
      return send(200, 'text/html', `<!doctype html><html><head>
        <title>Relative image</title>
        <meta name="description" content="Smoke fixture">
        <meta property="og:title" content="Relative image">
        <meta property="og:description" content="Smoke fixture">
        <meta property="og:type" content="article">
        <meta property="og:url" content="${baseUrl}/relative-og-image/">
        <meta property="og:image" content="/share.jpg">
        <link rel="canonical" href="${baseUrl}/relative-og-image/">
      </head><body><h1>Relative image</h1></body></html>`);
    }
    if (request.url === '/malformed-og-image/') {
      return send(200, 'text/html', `<!doctype html><html><head>
        <title>Malformed image</title>
        <meta name="description" content="Smoke fixture">
        <meta property="og:title" content="Malformed image">
        <meta property="og:description" content="Smoke fixture">
        <meta property="og:type" content="article">
        <meta property="og:url" content="${baseUrl}/malformed-og-image/">
        <meta property="og:image" content="https://[">
        <link rel="canonical" href="${baseUrl}/malformed-og-image/">
      </head><body><h1>Malformed image</h1></body></html>`);
    }
    if (request.url === '/external-share/') {
      return send(200, 'text/html', `<!doctype html><html><head>
        <title>External share</title>
        <meta name="description" content="Smoke fixture">
        <meta property="og:title" content="External share">
        <meta property="og:description" content="Smoke fixture">
        <meta property="og:type" content="article">
        <meta property="og:url" content="https://example.test/external-share/">
        <meta property="og:image" content="${externalBaseUrl}/share.jpg?v=4">
        <link rel="canonical" href="https://example.test/external-share/">
      </head><body><h1>External share</h1></body></html>`);
    }
    return send(404, 'text/plain', 'missing');
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  externalBaseUrl = `http://localhost:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test('resolveBaseUrls accepts preview and production targets', () => {
  assert.deepEqual(resolveBaseUrls({
    SMOKE_PREVIEW_BASE_URL: 'https://preview.example.test/',
    SMOKE_PRODUCTION_BASE_URL: 'https://example.test'
  }), [
    'https://preview.example.test',
    'https://example.test'
  ]);
});

test('resolveBaseUrls keeps the legacy single-target variable as a fallback', () => {
  assert.deepEqual(resolveBaseUrls({ SMOKE_BASE_URL: 'https://legacy.example.test/' }), [
    'https://legacy.example.test'
  ]);
});

test('PDF text normalization preserves sections between mathematical angle operators', () => {
  const extracted = 'energy < threshold\nFive Materials That Could Unlock\nconfidence > baseline';
  assert.equal(
    normalizeExtractedText(extracted),
    'energy < threshold Five Materials That Could Unlock confidence > baseline'
  );
});

test('runSmokeSuite validates pages, OG metadata, canonical/share URLs, videos, and downloads', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/healthy/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.equal(result.failures.length, 0, result.failures.map(failure => failure.message).join('\n'));
  assert.equal(result.outcome, 'pass');
  assert.equal(result.summary.total, result.checks.length);
  assert.ok(result.checks.every(check => check.status === 'pass'));
  assert.equal(result.pagesChecked, 1);
  assert.deepEqual(result.assetsChecked.sort(), [
    `${baseUrl}/film.mp4`,
    `${baseUrl}/paper.pdf`,
    `${baseUrl}/share.jpg`
  ].sort());
});

test('runSmokeSuite returns actionable diagnostics for an unresolved video', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/broken-video/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0].message, /video asset/);
  assert.equal(result.failures[0].url, `${baseUrl}/missing.mp4`);
  assert.equal(result.failures[0].classification, 'content');
  const failedCheck = result.checks.find(check => check.id === result.failures[0].checkId);
  assert.equal(failedCheck.actual, 404);
  assert.equal(result.outcome, 'content_failure');
});

test('runSmokeSuite reports every required Open Graph and canonical tag', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/missing-metadata/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.deepEqual(result.failures.map(failure => failure.checkId).sort(), [
    'meta:/missing-metadata/:canonical',
    'meta:/missing-metadata/:description',
    'meta:/missing-metadata/:ogDescription',
    'meta:/missing-metadata/:ogImage',
    'meta:/missing-metadata/:ogTitle',
    'meta:/missing-metadata/:ogType',
    'meta:/missing-metadata/:ogUrl',
    'meta:/missing-metadata/:title-consistency'
  ]);
});

test('runSmokeSuite distinguishes infrastructure failures from content failures', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/infrastructure/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.equal(result.failures.length, 1);
  assert.equal(result.failures[0].classification, 'infrastructure');
  assert.equal(result.outcome, 'infrastructure_failure');
  assert.equal(result.summary.infrastructureFailures, 1);
  assert.equal(result.summary.contentFailures, 0);
});

test('runSmokeSuite resolves canonical and Open Graph share URLs', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/broken-share-urls/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  const checkIds = result.failures.map(failure => failure.checkId);
  assert.ok(checkIds.includes('meta:/broken-share-urls/:canonical'));
  assert.ok(checkIds.includes('meta:/broken-share-urls/:ogUrl'));
  assert.ok(checkIds.includes('asset:http://127.0.0.1:' + new URL(baseUrl).port + '/missing-share.jpg:http'));
});

test('runSmokeSuite checks canonical-origin OG images on the preview target', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    expectations: {
      canonicalOrigin: 'https://example.test',
      routes: [{ path: '/canonical-share/', marker: 'Canonical share', sitemap: false }]
    },
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.equal(result.failures.length, 0, result.failures.map(failure => failure.message).join('\n'));
  assert.ok(result.assetsChecked.includes(`${baseUrl}/share.jpg?v=3`));
  assert.equal(result.assetsChecked.includes('https://example.test/share.jpg?v=3'), false);
});

test('runSmokeSuite reports a relative OG image without aborting the smoke report', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/relative-og-image/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.deepEqual(result.failures.map(failure => failure.checkId), [
    'meta:/relative-og-image/:ogImage'
  ]);
  assert.equal(result.outcome, 'content_failure');
});

test('runSmokeSuite reports a malformed absolute OG image without skipping it', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/malformed-og-image/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.deepEqual(result.failures.map(failure => failure.checkId), [
    'meta:/malformed-og-image/:ogImage'
  ]);
  assert.equal(result.outcome, 'content_failure');
});

test('runSmokeSuite leaves external OG images on their declared origin', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    expectations: {
      canonicalOrigin: 'https://example.test',
      routes: [{ path: '/external-share/', marker: 'External share', sitemap: false }]
    },
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.equal(result.failures.length, 0, result.failures.map(failure => failure.message).join('\n'));
  assert.ok(result.assetsChecked.includes(`${externalBaseUrl}/share.jpg?v=4`));
  assert.equal(result.assetsChecked.includes(`${baseUrl}/share.jpg?v=4`), false);
});
