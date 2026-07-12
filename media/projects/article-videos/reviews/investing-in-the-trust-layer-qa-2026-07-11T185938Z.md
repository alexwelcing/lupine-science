# Investing in the Trust Layer — QA smoke test and video-link verification

Checked: 2026-07-11T18:59:38Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4` with a unique cache-busting query, `Cache-Control: no-cache`, and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- CDN cache status: `MISS`
- Download size: 84,245 bytes
- File-signature detection: `text/html`
- `ffprobe` exit: `1` (`Invalid data found when processing input`)
- Response SHA-256: `fd953bb182f1b9cf64fdeb4e37fe3c130cd524f243b8694b948a0f179a2043b5`

The uncached live route returns the site's HTML fallback rather than an MP4. The requested video-link contract is not satisfied, so release QA cannot pass until the MP4 is deployed at the stable URL.

## Evidence files

- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-url.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185938Z-sha256.txt`
