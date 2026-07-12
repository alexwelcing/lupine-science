# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:11:04Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across one live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Result: FAIL
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `1a73e0ffd7bd6739f50fb66a0865c9324ef56823a37420b3667d83d33ae0424c`
- ffprobe: exit 1, invalid media data

The cache-busting request used `Accept: video/mp4` and `Cache-Control: no-cache`. The endpoint still serves the site's HTML fallback rather than an MP4, so the release contract is not satisfied despite HTTP 200.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T201104Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T201104Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T201104Z-response.bin`
