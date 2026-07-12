# Investing in the Trust Layer — QA smoke test and video-link verification

Checked: 2026-07-11T19:05:27Z
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
- Download size: 84,245 bytes
- File-signature detection: HTML document
- `ffprobe` exit: `1`
- Response SHA-256: `76ce5e5ddc9f2b9ff3881440bd3ac587716168cc18ee3822ede154de6d9e4f4d`

The live route returns the site's HTML fallback rather than an MP4. The requested video-link contract is not satisfied. Deploy `public/videos/investing-in-the-trust-layer.mp4`, then rerun this check and require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing.

## Evidence files

- `investing-in-the-trust-layer-qa-2026-07-11T190456Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T190527Z-url.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190527Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190527Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190527Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T190527Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190527Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190527Z-sha256.txt`
