# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T18:26:32Z

## Result: FAIL

The repository smoke command (`npm run smoke`) passed with exit code 0:

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

The required direct-video contract failed for:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T182632Z`

The cache-busting request sent `Cache-Control: no-cache` and `Accept: video/mp4`.

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: `84,245` bytes
- Detected MIME type: `text/html`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

The live route still returns the site's HTML fallback rather than an MP4. Deploy `public/videos/investing-in-the-trust-layer.mp4`, then rerun this check and require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T182632Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T182632Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T182632Z-verification.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T182632Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T182632Z-ffprobe.txt`
