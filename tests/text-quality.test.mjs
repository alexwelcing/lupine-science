import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { findSuspectWords, loadDictionary, trainBigramModel } from '../scripts/lib/text-quality.mjs';
import { cueOcrTimes, hasHighConfidenceOcrGibberish, isBlankFrameStats, sampleFrameErrors } from '../scripts/video-quality-reviewer.mjs';

const dictionary = new Set(['recover', 'destroy', 'containment', 'material', 'measurement']);
const corpus = new Set(dictionary);
const bigram = trainBigramModel(dictionary);

describe('OCR dictionary integrity', () => {
  it('loads a dictionary that meets the required cardinality', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ocr-dictionary-'));
    try {
      const file = path.join(dir, 'words');
      const words = Array.from({ length: 10000 }, (_, index) => `word${String(index).padStart(5, '0')}`);
      await writeFile(file, `${words.join('\n')}\n`);
      const loaded = await loadDictionary(file);
      assert.equal(loaded.size, 10000);
      assert.equal(loaded.has('word00000'), true);
      assert.equal(loaded.has('word09999'), true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails closed when the dictionary is missing', async () => {
    await assert.rejects(
      loadDictionary('/definitely/missing/ocr-dictionary'),
      /Required OCR dictionary unavailable/,
    );
  });

  it('fails closed when the dictionary is undersized', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ocr-dictionary-'));
    try {
      const file = path.join(dir, 'words');
      const words = Array.from({ length: 9999 }, (_, index) => `word${String(index).padStart(5, '0')}`);
      await writeFile(file, `${words.join('\n')}\n`);
      await assert.rejects(loadDictionary(file), /has 9999 words; expected at least 10000/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

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

  it('assigns one OCR sample to every caption cue', () => {
    const cues = [
      { start: 1, end: 3, text: 'first' },
      { start: 4, end: 8, text: 'second' },
      { start: 9, end: 11, text: 'third' },
    ];
    assert.deepEqual(cueOcrTimes(12, cues), [
      { cueIndex: 0, time: 2, valid: true },
      { cueIndex: 1, time: 6, valid: true },
      { cueIndex: 2, time: 10, valid: true },
    ]);
    assert.equal(cueOcrTimes(12, cues).length, cues.length);
  });

  it('retains cue identity when sampled recognition fails', () => {
    assert.deepEqual(sampleFrameErrors([
      { time: 2, ocrCueIndexes: [0], error: 'OCR recognition failed' },
    ]), [
      { time: 2, ocrCueIndexes: [0], error: 'OCR recognition failed' },
    ]);
  });

  it('preserves duplicate cue midpoints as distinct OCR work', () => {
    const attempts = cueOcrTimes(5, [
      { start: 1, end: 3, text: 'first' },
      { start: 1.5, end: 2.5, text: 'second' },
    ]);
    assert.deepEqual(attempts.map(({ cueIndex, time }) => ({ cueIndex, time })), [
      { cueIndex: 0, time: 2 },
      { cueIndex: 1, time: 2 },
    ]);
  });

  it('marks out-of-duration cues invalid without dropping their identity', () => {
    assert.deepEqual(cueOcrTimes(5, [
      { start: 5, end: 6, text: 'outside' },
    ]), [
      { cueIndex: 0, time: 5.5, valid: false },
    ]);
  });

  it('keeps sub-second container-tail drift reviewable when its OCR midpoint is in range', () => {
    assert.deepEqual(cueOcrTimes(5, [
      { start: 4, end: 5.5, text: 'tail rounding' },
    ]), [
      { cueIndex: 0, time: 4.75, valid: true },
    ]);
  });
});
