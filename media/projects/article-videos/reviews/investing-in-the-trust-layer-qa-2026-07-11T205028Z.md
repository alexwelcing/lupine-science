# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:50:28Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T205028Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `5e991fc1b33471ea7b954a6db8454751df24144f780018c78094ab12e3d8e52c`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The production smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not satisfied until the endpoint returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T205028Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T205028Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T205028Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T205028Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T205028Z-verification.txt`
