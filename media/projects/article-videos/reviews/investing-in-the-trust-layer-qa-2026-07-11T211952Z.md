# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T21:19:52Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `a9941b73751285c0dd7c0d7fda6811e6a8b83e87cfa15cc41e831de790820806`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The production smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not satisfied until the endpoint returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-sha256.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T211952Z-verification.txt`
