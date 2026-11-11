import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKER_PATH = path.join(ROOT, 'public', '_worker.js');
const { default: worker } = await import(pathToFileURL(WORKER_PATH).href);

const DECK_URL = 'https://lupine.science/venture/deck.html';

function env(password) {
  return {
    ...(password === undefined ? {} : { VENTURE_DECK_PASSWORD: password }),
    ASSETS: {
      async fetch() {
        return new Response('<!doctype html><title>deck</title>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=600' },
        });
      },
    },
  };
}

function request(password) {
  const headers = new Headers();
  if (password !== undefined) headers.set('Authorization', `Basic ${btoa(`viewer:${password}`)}`);
  return new Request(DECK_URL, { headers });
}

test('the worker source carries no fallback or placeholder password', () => {
  const source = fs.readFileSync(WORKER_PATH, 'utf8');
  assert.doesNotMatch(source, /PLACEHOLDER_PASSWORD|FALLBACK_PASSWORD/);
  // the configured password is the only secret: no `||` / `??` default after it
  assert.doesNotMatch(source, /VENTURE_DECK_PASSWORD\s*(?:\|\||\?\?)/);
});

for (const [label, configured] of [['unset', undefined], ['empty', '']]) {
  test(`fails closed with 503 when VENTURE_DECK_PASSWORD is ${label}`, async () => {
    for (const attempt of [undefined, '', 'anything']) {
      const response = await worker.fetch(request(attempt), env(configured));
      assert.equal(response.status, 503);
      assert.match(await response.text(), /Deck temporarily unavailable/);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
      assert.equal(response.headers.get('WWW-Authenticate'), null);
    }
  });
}

test('asks for credentials when none or the wrong ones are sent', async () => {
  for (const attempt of [undefined, 'wrong-password', '']) {
    const response = await worker.fetch(request(attempt), env('correct horse'));
    assert.equal(response.status, 401);
    assert.match(response.headers.get('WWW-Authenticate') || '', /^Basic realm=/);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

test('serves the deck privately with the configured password', async () => {
  const response = await worker.fetch(request('correct horse'), env('correct horse'));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.match(await response.text(), /<title>deck<\/title>/);
});

test('rejects malformed authorization headers', async () => {
  const headers = new Headers({ Authorization: 'Basic %%%not-base64%%%' });
  const response = await worker.fetch(new Request(DECK_URL, { headers }), env('correct horse'));
  assert.equal(response.status, 401);
});

test('the nginx container image fails closed on /venture', () => {
  // nginx.conf serves the same public/ tree without the Pages worker, so it
  // must refuse the deck rather than serve it without a password.
  const conf = fs.readFileSync(path.join(ROOT, 'nginx.conf'), 'utf8');
  const block = conf.match(/location \^~ \/venture \{([^}]*)\}/);
  assert.ok(block, 'nginx.conf has a location ^~ /venture block');
  assert.match(block[1], /return 503 "Deck temporarily unavailable\.\\n";/);
  assert.match(block[1], /add_header X-Robots-Tag "noindex, nofollow" always;/);
  assert.ok(conf.indexOf('location ^~ /venture') < conf.indexOf('location / {'), '/venture block precedes the catch-all');
});
