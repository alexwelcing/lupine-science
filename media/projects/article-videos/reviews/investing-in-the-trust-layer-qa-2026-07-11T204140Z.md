# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:41:40Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across one target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T204140Z`
- Result: FAIL
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME: `text/html`
- First bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- SHA-256: `abd60a3c72d8e1e21d54804ac476fb5d943a9491d731785595367552d1ab21e1`
- ffprobe: exit 1; response is not valid media

The route returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T204110Z-smoke.log`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T204140Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T204140Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T204140Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T204140Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T204140Z-ffprobe.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T204140Z-sha256.txt`
