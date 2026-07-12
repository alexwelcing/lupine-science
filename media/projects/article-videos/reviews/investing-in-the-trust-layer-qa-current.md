# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T06:08:01Z

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T060801Z`
Result: FAIL

A cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `9373734191ab0497881904b9faae491e87a06f3671dce50caf7302f722ca5dce`
- `ffprobe`: rejected the response as invalid media

The endpoint returns the site's HTML fallback, not an MP4. HTTP 200 alone does not satisfy the required video-link contract.

## Evidence

- `media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-current-headers.txt`
