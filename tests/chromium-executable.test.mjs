import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { chromiumExecutablePath, chromiumInstalls } from '../scripts/lib/chromium-executable.mjs';

const temporary = [];
afterEach(() => {
  for (const dir of temporary.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function browsersRoot(layout) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-browsers-'));
  temporary.push(root);
  for (const relative of layout) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '#!/bin/sh\n');
  }
  return root;
}

test('finds the newest chromium-<revision> whatever revision the image carries', () => {
  const root = browsersRoot([
    'chromium-1194/chrome-linux/chrome',
    'chromium-1243/chrome-linux64/chrome',
    'chromium_headless_shell-1300/chrome-headless-shell-linux64/chrome-headless-shell',
    'ffmpeg-1011/ffmpeg-linux',
  ]);
  assert.deepEqual(chromiumInstalls(root), [path.join(root, 'chromium-1243'), path.join(root, 'chromium-1194')]);
  assert.equal(
    chromiumExecutablePath({ env: {}, defaultRoots: [root] }),
    path.join(root, 'chromium-1243', 'chrome-linux64', 'chrome'),
  );
});

test('falls back to an older install when the newest has no browser binary', () => {
  const root = browsersRoot(['chromium-1194/chrome-linux/chrome']);
  fs.mkdirSync(path.join(root, 'chromium-1300', 'chrome-linux64'), { recursive: true });
  assert.equal(
    chromiumExecutablePath({ env: {}, defaultRoots: [root] }),
    path.join(root, 'chromium-1194', 'chrome-linux', 'chrome'),
  );
});

test('searches PLAYWRIGHT_BROWSERS_PATH before the shared default', () => {
  const custom = browsersRoot(['chromium-1100/chrome-linux64/chrome']);
  const shared = browsersRoot(['chromium-1243/chrome-linux64/chrome']);
  assert.equal(
    chromiumExecutablePath({ env: { PLAYWRIGHT_BROWSERS_PATH: custom }, defaultRoots: [shared] }),
    path.join(custom, 'chromium-1100', 'chrome-linux64', 'chrome'),
  );
  // an empty custom root falls through to the shared install
  const empty = browsersRoot([]);
  assert.equal(
    chromiumExecutablePath({ env: { PLAYWRIGHT_BROWSERS_PATH: empty }, defaultRoots: [shared] }),
    path.join(shared, 'chromium-1243', 'chrome-linux64', 'chrome'),
  );
  // PLAYWRIGHT_BROWSERS_PATH=0 means node_modules; it is not a directory to scan
  assert.equal(
    chromiumExecutablePath({ env: { PLAYWRIGHT_BROWSERS_PATH: '0' }, defaultRoots: [shared] }),
    path.join(shared, 'chromium-1243', 'chrome-linux64', 'chrome'),
  );
});

test('CHROME_PATH overrides discovery when it names an existing file', () => {
  const shared = browsersRoot(['chromium-1243/chrome-linux64/chrome']);
  const override = browsersRoot(['bin/google-chrome']);
  const chrome = path.join(override, 'bin', 'google-chrome');
  assert.equal(chromiumExecutablePath({ env: { CHROME_PATH: chrome }, defaultRoots: [shared] }), chrome);
  // a stale override is ignored rather than handed to playwright
  assert.equal(
    chromiumExecutablePath({ env: { CHROME_PATH: path.join(override, 'missing') }, defaultRoots: [shared] }),
    path.join(shared, 'chromium-1243', 'chrome-linux64', 'chrome'),
  );
});

test('returns undefined when no browser is installed, so playwright-core resolves its own', () => {
  const missing = path.join(os.tmpdir(), 'pw-browsers-does-not-exist');
  assert.equal(chromiumExecutablePath({ env: {}, defaultRoots: [missing, browsersRoot([])] }), undefined);
});
