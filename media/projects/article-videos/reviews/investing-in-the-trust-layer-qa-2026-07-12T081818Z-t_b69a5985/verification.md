# Investing in the Trust Layer — QA verification

Checked: 2026-07-12T08:18:47Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T081847Z`
Result: FAIL

A cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `4f3e4079eb88559180cd969365d7b5f6086a1c31b7d3ca6b1e8d4529718d5264`
- `ffprobe`: invalid media

The endpoint still returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract.

## Evidence

- `smoke.log`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
