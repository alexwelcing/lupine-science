import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findSuspectWords, trainBigramModel } from '../scripts/lib/text-quality.mjs';
import { hasHighConfidenceOcrGibberish, isBlankFrameStats, sampleFrameErrors } from '../scripts/video-quality-reviewer.mjs';

const dictionary = new Set(['recover', 'destroy', 'containment', 'material', 'measurement']);
const corpus = new Set(dictionary);
const bigram = trainBigramModel(dictionary);

describe('OCR suspect-word confidence handling', () => {
  it('ignores zero-confidence geometry guesses', () => {
    const result = findSuspectWords(
      [
        { text: 'soparace', confidence: 0 },
        { text: 'FroeTITREY', confidence: 0 },
        { text: 'cartmioeE', confidence: 0 },
      ],
      dictionary,
      corpus,
      bigram,
    );
    assert.deepEqual(result, []);
  });

  it('retains high-confidence gibberish as a blocker candidate', () => {
    const result = findSuspectWords(
      [{ text: 'qxzvqqzx', confidence: 96 }],
      dictionary,
      corpus,
      bigram,
    );
    assert.equal(result.length, 1);
    assert.equal(result[0].word, 'qxzvqqzx');
    assert.equal(result[0].confidence, 96);
  });
});

describe('video sample quality classification', () => {
  it('flags uniform black and white frames but not low-contrast midtones', () => {
    assert.equal(isBlankFrameStats(1, 0), true);
    assert.equal(isBlankFrameStats(1, 255), true);
    assert.equal(isBlankFrameStats(1, 128), false);
    assert.equal(isBlankFrameStats(30, 0), false);
  });

  it('fails on one >90% sampled gibberish token but rejects weaker OCR noise', () => {
    const hit = (time) => ({ time, words: [{ word: 'qxzvqqzx', confidence: 96 }] });
    assert.equal(hasHighConfidenceOcrGibberish([hit(1)]), true);
    assert.equal(hasHighConfidenceOcrGibberish([
      { time: 1, words: [{ word: 'transition-artifact', confidence: 89.8 }] },
    ]), false);
    assert.equal(hasHighConfidenceOcrGibberish([
      { time: 1, words: [{ word: 'noise', confidence: 40 }] },
      { time: 2, words: [{ word: 'noise', confidence: 40 }] },
    ]), false);
  });

  it('retains frame extraction and statistics failures as blockers', () => {
    assert.deepEqual(sampleFrameErrors([
      { time: 1, avgStd: 20, avgMean: 128 },
      { time: 2, error: 'Input file is missing' },
      { time: 3, error: 'Sharp statistics failed' },
    ]), [
      { time: 2, error: 'Input file is missing' },
      { time: 3, error: 'Sharp statistics failed' },
    ]);
  });
});
