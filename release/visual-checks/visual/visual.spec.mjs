import path from 'node:path';
import { expect, test } from '@playwright/test';
import { loadManifest } from './lib/config.mjs';
import { deterministicInitScript } from './lib/determinism.mjs';
import { validateR3FSnapshot } from './lib/r3f.mjs';

const manifestPath = path.resolve(process.env.VISUAL_MANIFEST || 'visual/manifest.json');
const manifest = await loadManifest(manifestPath);

test.use({ viewport: manifest.viewport });

for (const check of manifest.checks) {
  test(check.id, async ({ page }, testInfo) => {
    await page.addInitScript({ content: deterministicInitScript(manifest) });
    await page.goto(check.url, { waitUntil: check.waitUntil || 'networkidle' });
    if (check.readySelector) await page.locator(check.readySelector).waitFor({ state: 'visible' });

    if (check.kind === 'video-frame') {
      await page.locator(check.selector).evaluate(async (media, timeSeconds) => {
        if (!(media instanceof HTMLMediaElement)) throw new Error('video-frame selector must target an HTMLMediaElement');
        media.pause();
        if (media.readyState < HTMLMediaElement.HAVE_METADATA) {
          await new Promise((resolve, reject) => {
            media.addEventListener('loadedmetadata', resolve, { once: true });
            media.addEventListener('error', () => reject(new Error('media metadata failed to load')), { once: true });
          });
        }
        if (timeSeconds < 0 || timeSeconds > media.duration) throw new Error(`video frame time ${timeSeconds} is outside media duration ${media.duration}`);
        if (Math.abs(media.currentTime - timeSeconds) > 0.0001) {
          await new Promise((resolve, reject) => {
            media.addEventListener('seeked', resolve, { once: true });
            media.addEventListener('error', () => reject(new Error('media seek failed')), { once: true });
            media.currentTime = timeSeconds;
          });
        }
      }, check.timeSeconds);
    }

    if (check.kind === 'r3f') {
      const snapshot = await page.evaluate(async () => {
        const probe = globalThis.__LUPINE_VISUAL_SCENE__;
        return typeof probe === 'function' ? await probe() : null;
      });
      validateR3FSnapshot(snapshot, check.scene || {});
      await testInfo.attach('r3f-scene.json', { body: Buffer.from(`${JSON.stringify(snapshot, null, 2)}\n`), contentType: 'application/json' });
    }

    const target = check.selector ? page.locator(check.selector) : page;
    await expect(target).toHaveScreenshot(`${check.id}.png`, {
      maxDiffPixelRatio: check.threshold,
      ...(check.maxDiffPixels === undefined ? {} : { maxDiffPixels: check.maxDiffPixels })
    });
  });
}
