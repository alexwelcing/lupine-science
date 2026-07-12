# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T18:17:05Z

## Result: FAIL

Repository smoke command (`npm run smoke`) passed with exit code 0:

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

The required direct video contract failed for:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T181705Z`

The cache-busting request used `Cache-Control: no-cache` and `Accept: video/mp4`.

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `c9af02abf923e066699e117a16abbb270201e9ceb46b2587af11238f9899e50f`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

The route is returning the site HTML fallback rather than an MP4. Deploy `public/videos/investing-in-the-trust-layer.mp4`, then rerun this check and require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T181705Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T181705Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T181705Z-verification.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T181705Z-verification.txt.ffprobe`
- `investing-in-the-trust-layer-qa-2026-07-11T181705Z-response.bin`
