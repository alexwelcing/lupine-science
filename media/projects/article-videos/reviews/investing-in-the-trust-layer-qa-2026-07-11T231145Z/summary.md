# Investing in the Trust Layer — QA verification

Checked: 2026-07-11T23:11Z

## Repository smoke test

- Command: `npm run smoke`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources
- Evidence: `../investing-in-the-trust-layer-qa-2026-07-11T231120Z/smoke.log`

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `e365c98f73595a18f6737e81e9440d168f3b119ff015b7869e3730f861f6bfbd`
- ffprobe: FAIL (exit 1)

Result: FAIL. The live URL returns the site's HTML fallback rather than an MP4, so it does not meet the required video-link contract despite returning HTTP 200.
