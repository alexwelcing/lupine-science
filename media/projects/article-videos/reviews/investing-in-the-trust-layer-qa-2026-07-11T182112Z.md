# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T18:21:12Z

## Result: FAIL

Repository smoke command (`npm run smoke`) passed with exit code 0:

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

The required direct video contract failed for:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T182112Z`

The cache-busting request used `Cache-Control: no-cache` and `Accept: video/mp4`.

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `8797772f32a3692195ef3943f4c40ad9d2e6377dfa4d5e95ce4e7d4a837b0f17`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

The live route is returning the site's HTML fallback rather than an MP4. Deploy `public/videos/investing-in-the-trust-layer.mp4`, then rerun this check and require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T182112Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T182112Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T182112Z-verification.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T182112Z-response.bin`
