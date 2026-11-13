import tesseract from '/tmp/node_modules/tesseract.js/src/index.js';
const { createWorker } = tesseract;
import sharp from 'sharp';

const ROOT = '/home/alex/Dev/lupine/lupine-science/public';
const PATHS = [
  'articles/beyond-carbon-the-error-geometry-of-environmental-materials/hero.jpg',
  'articles/beyond-carbon-the-error-geometry-of-environmental-materials/images/beyond-carbon-the-error-geometry-of-environmental-materials-01-seven-domains-one-error.jpg',
  'articles/the-order-is-right-the-size-is-wrong/hero.jpg',
  'articles/the-order-is-right-the-size-is-wrong/hero.webp',
  'articles/the-order-is-right-the-size-is-wrong/thumb.jpg',
  'articles/the-order-is-right-the-size-is-wrong/thumb.webp',
  'articles/from-fantasy-frameworks-to-makeable-materials/hero.jpg',
  'articles/lupi-hfc-refrigerant-research-payloads/hero.jpg',
  'articles/lupi-hfc-refrigerant-research-payloads/hfc-r125.jpg',
  'articles/the-trust-layer/hero.jpg',
  'articles/the-trust-layer/hero.webp',
  'articles/the-trust-layer/thumb.jpg',
  'articles/the-trust-layer/thumb.webp',
  'articles/rhizo-non-co2-climate-forcers-lean/hero.jpg',
  'articles/a-field-not-a-neural-net/images/a-field-not-a-neural-net-08-climate-targets-map.jpg',
  'articles/why-lupine-science/hero.jpg',
  'articles/why-lupine-science/hero.webp',
  'articles/why-lupine-science/thumb.jpg',
  'articles/why-lupine-science/thumb.webp',
  'articles/why-lupi/hero.jpg',
];

function cleanText(t) {
  return t.replace(/\s+/g, ' ').trim();
}

const worker = await createWorker('eng');
const results = [];
for (const rel of PATHS) {
  const filePath = `${ROOT}/${rel}`;
  try {
    const pngBuf = await sharp(filePath).png().toBuffer();
    const ret = await worker.recognize(pngBuf);
    const text = cleanText(ret.data.text);
    const alnum = text.replace(/[^a-zA-Z0-9]/g, '');
    results.push({ path: rel, textLen: text.length, alnumLen: alnum.length, confidence: ret.data.confidence, text: text.slice(0, 200) });
  } catch (err) {
    results.push({ path: rel, error: err.message });
  }
}
await worker.terminate();

const flagged = results.filter(r => !r.error && r.alnumLen > 4 && r.confidence > 50);
console.log('\n=== RESULTS ===\n');
for (const r of results) console.log(JSON.stringify(r));
console.log(`\n=== SUMMARY: ${results.length} scanned, ${flagged.length} flagged (alnum>4) ===`);
if (flagged.length) {
  console.log('Flagged files:');
  for (const r of flagged) console.log(' -', r.path, `alnum=${r.alnumLen}`, `text="${r.text.slice(0,120)}"`);
}
