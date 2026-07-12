# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T18:44:53Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T184453Z`

Request headers:

- `Cache-Control: no-cache`
- `Accept: video/mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- `CF-Cache-Status`: `MISS`
- Downloaded bytes: `84,245`
- File-signature detection: HTML document / UTF-8 text
- Response SHA-256: `2fcd424e4e8e25bef702010ed81ebb37e398890fb6f6892269f3ce154ed58d0c`
- `ffprobe`: exit 1, `Invalid data found when processing input`

The cache-busted live URL still returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video contract.

## Evidence files

- `investing-in-the-trust-layer-qa-2026-07-11T184453Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T184453Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184453Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184453Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T184453Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184453Z-sha256.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184453Z-ffprobe.txt`
