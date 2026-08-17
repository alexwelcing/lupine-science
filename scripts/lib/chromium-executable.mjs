import fs from 'node:fs';

/**
 * Resolve a Chromium binary for playwright-core across environments.
 *
 * playwright-core ships no browser; locally it finds one via its registry,
 * but sandboxed/CI runners provide a system build instead (CHROME_PATH, or
 * the shared /opt/pw-browsers install). Returns undefined when no override
 * exists so playwright-core falls back to its own resolution.
 */
export function chromiumExecutablePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}
