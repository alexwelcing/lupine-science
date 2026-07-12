# Investing in the Trust Layer — QA smoke test and video-link verification

Checked: 2026-07-11T19:02:18Z
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
- File-signature detection: `text/html`
- `ffprobe`: rejected the response as invalid media
- Response SHA-256: `fe0f9a73e47d6c87d51f254a550a30a7ca9d107b418f28869475ed5422e52e6f`

The live route still returns the site's HTML fallback rather than the MP4. The requested video-link contract is not satisfied, so QA remains blocked until the MP4 is deployed at the stable URL with `Content-Type: video/mp4`.

## Evidence files

- `investing-in-the-trust-layer-qa-2026-07-11T190218Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190218Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190218Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T190218Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190218Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T190218Z-sha256.txt`
