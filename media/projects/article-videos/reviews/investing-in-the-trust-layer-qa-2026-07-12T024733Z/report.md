# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T02:47:33Z

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T024733Z`
Result: FAIL

A cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `f5292131277d05cf7e982370a9fd35189815a4e5502b1dce07288866d0890e09`
- ffprobe: exit 1, invalid media

The endpoint returns the site's HTML fallback, not an MP4. HTTP 200 alone does not satisfy the acceptance criteria.

## Evidence

- `smoke.log`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `url.txt`
