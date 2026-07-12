# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T18:49:43Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T184943Z`

Request headers:

- `Cache-Control: no-cache`
- `Accept: video/mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File-signature detection: `text/html`
- `ffprobe`: exit 1, `Invalid data found when processing input`
- Response SHA-256: `9f808d4dd29629cdb0b14e7c6db9378e634a68b2516640aea32792af414517c9`

The cache-busted live URL returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video contract.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T184943Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T184943Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184943Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184943Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184943Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184943Z-sha256.txt`
