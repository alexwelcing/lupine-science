import fs from 'node:fs';
import path from 'node:path';

// The shared browser install on sandboxed and CI runners.
export const DEFAULT_BROWSER_ROOTS = ['/opt/pw-browsers'];

// Binary locations inside a chromium-<revision> directory, newest layout first.
const BINARY_PATHS = [
  ['chrome-linux64', 'chrome'],
  ['chrome-linux', 'chrome'],
  ['chrome-mac-arm64', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
  ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
  ['chrome-win64', 'chrome.exe'],
  ['chrome-win', 'chrome.exe'],
];

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

/** chromium-<revision> directories under `root`, newest revision first. */
export function chromiumInstalls(root) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isDirectory() && /^chromium-\d+$/.test(entry.name))
    .map((entry) => ({ dir: path.join(root, entry.name), revision: Number(entry.name.slice('chromium-'.length)) }))
    .sort((a, b) => b.revision - a.revision)
    .map(({ dir }) => dir);
}

/**
 * Resolve a Chromium binary for playwright-core across environments.
 *
 * playwright-core ships no browser; locally it finds one via its registry,
 * but sandboxed/CI runners provide a build instead. In order:
 *
 *   1. CHROME_PATH, when it names an existing file (explicit override).
 *   2. The newest chromium-<revision> install under PLAYWRIGHT_BROWSERS_PATH
 *      or, when that is unset, under /opt/pw-browsers (the shared install),
 *      whatever revision the image happens to carry. Like Playwright itself,
 *      a set PLAYWRIGHT_BROWSERS_PATH replaces the default location.
 *
 * Returns undefined when nothing is found, so playwright-core falls back to
 * its own resolution. `env` and `defaultRoots` exist for tests.
 */
export function chromiumExecutablePath({ env = process.env, defaultRoots = DEFAULT_BROWSER_ROOTS } = {}) {
  if (env.CHROME_PATH && isFile(env.CHROME_PATH)) return env.CHROME_PATH;

  // PLAYWRIGHT_BROWSERS_PATH=0 means "inside node_modules": playwright-core
  // resolves that itself, so it does not name a directory to scan.
  const roots = env.PLAYWRIGHT_BROWSERS_PATH && env.PLAYWRIGHT_BROWSERS_PATH !== '0'
    ? [env.PLAYWRIGHT_BROWSERS_PATH]
    : defaultRoots;
  for (const root of roots) {
    for (const install of chromiumInstalls(root)) {
      for (const parts of BINARY_PATHS) {
        const candidate = path.join(install, ...parts);
        if (isFile(candidate)) return candidate;
      }
    }
  }
  return undefined;
}
