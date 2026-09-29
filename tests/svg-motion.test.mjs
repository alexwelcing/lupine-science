import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const script = fs.readFileSync(new URL('../public/assets/svg-motion.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../public/articles/tms-2027-measuring-what-we-can-trust/index.html', import.meta.url), 'utf8');

function fixture(reduced = false) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  const media = new window.EventTarget();
  media.matches = reduced;
  window.matchMedia = () => media;
  const image = window.document.querySelector('[data-svg-hero] img');
  const button = window.document.querySelector('[data-svg-hero] button');
  return { dom, window, media, image, button };
}

test('SVG motion progressively enhances a usable still and pause/play works', () => {
  const { dom, window, image, button } = fixture();
  assert.match(image.src, /hero-still\.svg/);
  assert.equal(button.hidden, true);
  window.eval(script);
  assert.match(image.src, /\/hero\.svg/);
  assert.equal(button.hidden, false);
  button.click();
  assert.match(image.src, /hero-still\.svg/);
  assert.equal(button.textContent, 'Play animation');
  button.click();
  assert.match(image.src, /\/hero\.svg/);
  dom.window.close();
});

test('reduced motion stays still at startup and on preference changes', () => {
  const { dom, window, media, image, button } = fixture(true);
  window.eval(script);
  assert.match(image.src, /hero-still\.svg/);
  assert.equal(button.hidden, true);
  media.matches = false;
  media.dispatchEvent(new window.Event('change'));
  assert.match(image.src, /\/hero\.svg/);
  button.click();
  media.matches = true;
  media.dispatchEvent(new window.Event('change'));
  media.matches = false;
  media.dispatchEvent(new window.Event('change'));
  assert.match(image.src, /hero-still\.svg/);
  assert.equal(button.textContent, 'Play animation');
  dom.window.close();
});

test('printing uses the still and restores the prior playback choice', () => {
  const { dom, window, image, button } = fixture();
  window.eval(script);
  window.dispatchEvent(new window.Event('beforeprint'));
  assert.match(image.src, /hero-still\.svg/);
  window.dispatchEvent(new window.Event('afterprint'));
  assert.match(image.src, /\/hero\.svg/);
  button.click();
  window.dispatchEvent(new window.Event('beforeprint'));
  window.dispatchEvent(new window.Event('afterprint'));
  assert.match(image.src, /hero-still\.svg/);
  dom.window.close();
});
