import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { verifyArticleImages } from '../scripts/verify-article-images.mjs';

describe('article image verification', () => {
  it('every article ships a hero and every markdown image resolves to an existing asset', () => {
    const { ok, errors } = verifyArticleImages();
    assert.ok(ok, `article image verification failed:\n${errors.join('\n')}`);
  });

  it('reports at least the known article set', () => {
    const { count } = verifyArticleImages();
    assert.ok(count >= 1, 'expected at least one article to verify');
  });
});
