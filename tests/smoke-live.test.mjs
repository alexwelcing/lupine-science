import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import http from 'node:http';

import { resolveBaseUrls, runSmokeSuite } from '../scripts/smoke-live.mjs';

let baseUrl;
let server;

const page = ({ path = '/', body = '', links = '' } = {}) => `<!doctype html>
<html><head>
<title>Test page</title>
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

    if (request.url === '/share.jpg') return send(200, 'image/jpeg', 'image');
    if (request.url === '/film.mp4') return send(200, 'video/mp4', 'video');
    if (request.url === '/paper.pdf') return send(200, 'application/pdf', 'pdf');
    if (request.url === '/missing.mp4') return send(404, 'text/plain', 'missing');
    if (request.url === '/missing-share.jpg') return send(404, 'text/plain', 'missing');
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
    return send(404, 'text/plain', 'missing');
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
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

test('runSmokeSuite validates pages, OG metadata, canonical/share URLs, videos, and downloads', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/healthy/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.equal(result.failures.length, 0, result.failures.map(failure => failure.message).join('\n'));
  assert.equal(result.pagesChecked, 1);
  assert.deepEqual(result.assetsChecked.sort(), [
    `${baseUrl}/film.mp4`,
    `${baseUrl}/healthy/`,
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
  assert.match(result.failures[0].message, /video link/);
  assert.match(result.failures[0].message, /missing\.mp4/);
  assert.match(result.failures[0].message, /HTTP 404/);
});

test('runSmokeSuite reports every required Open Graph and canonical tag', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/missing-metadata/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  assert.deepEqual(result.failures.map(failure => failure.message).sort(), [
    'missing canonical link',
    'missing og:description',
    'missing og:image',
    'missing og:title',
    'missing og:type',
    'missing og:url'
  ]);
});

test('runSmokeSuite resolves canonical and Open Graph share URLs', async () => {
  const result = await runSmokeSuite({
    baseUrl,
    paths: ['/broken-share-urls/'],
    attempts: 1,
    delayMs: 0,
    timeoutMs: 1_000
  });

  const diagnostics = result.failures.map(failure => failure.message).join('\n');
  assert.match(diagnostics, /canonical URL broken.*HTTP 404/);
  assert.match(diagnostics, /og:url broken.*HTTP 404/);
  assert.match(diagnostics, /og:image broken.*HTTP 404/);
});
