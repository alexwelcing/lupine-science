# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T18:47:44Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T184744Z`

Request headers:

- `Cache-Control: no-cache`
- `Accept: video/mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- `CF-Cache-Status`: `MISS`
- Downloaded bytes: `84,245`
- File-signature detection: HTML document / UTF-8 text
- `ffprobe`: `Invalid data found when processing input`

The cache-busted live URL returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video contract.
