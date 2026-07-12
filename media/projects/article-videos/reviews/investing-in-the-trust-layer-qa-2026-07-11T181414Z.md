# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T18:14:14Z

## Result: FAIL

Repository smoke command (`npm run smoke`) passed with exit code 0:

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

The required direct video contract failed for:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T181414Z`

The cache-busting request used `Cache-Control: no-cache` and `Accept: video/mp4`.

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `6d6eab56f2ccb6836b29c62d290a90140f71e72b7595ec14ed97b2b262b0c926`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

The route is returning the site HTML fallback rather than an MP4. A successful deployment of `public/videos/investing-in-the-trust-layer.mp4` is still required before this QA card can pass.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T181414Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T181414Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T181414Z-verification.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T181414Z-response.bin`
