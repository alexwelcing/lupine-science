import { readFile } from 'node:fs/promises';

const DEFAULTS = Object.freeze({
  viewport: Object.freeze({ width: 1280, height: 720 }),
  seed: 20250801,
  epochMs: 1754006400000,
  threshold: 0
});

export async function loadManifest(manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.checks) || manifest.checks.length === 0) {
    throw new Error('visual manifest must contain at least one check');
  }

  const ids = new Set();
  const checks = manifest.checks.map((check) => {
    if (!check.id || !check.kind || !check.url) {
      throw new Error('each visual check requires id, kind, and url');
    }
    if (ids.has(check.id)) throw new Error(`duplicate check id: ${check.id}`);
    ids.add(check.id);
    if (!['page', 'component', 'video-frame', 'r3f'].includes(check.kind)) {
      throw new Error(`unsupported check kind: ${check.kind}`);
    }
    if (check.kind === 'component' && !check.selector) {
      throw new Error(`component check ${check.id} requires selector`);
    }
    if (check.kind === 'video-frame' && (!check.selector || !Number.isFinite(check.timeSeconds))) {
      throw new Error(`video-frame check ${check.id} requires selector and timeSeconds`);
    }
    return { threshold: manifest.threshold ?? DEFAULTS.threshold, ...check };
  });

  return {
    viewport: { ...DEFAULTS.viewport, ...manifest.viewport },
    seed: manifest.seed ?? DEFAULTS.seed,
    epochMs: manifest.epochMs ?? DEFAULTS.epochMs,
    checks
  };
}
