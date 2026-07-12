# Investing in the Trust Layer — live QA

Checked: 2026-07-12T04:24:39Z

## Result: BLOCKED

The repository-wide live smoke suite passes, but the required MP4 endpoint does not satisfy the video response contract.

## Smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources checked across one live target.

## Direct video endpoint

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `2975ea696e48f734bb397b392a1334058f474a4abf632baa3f6ef0362156951d`
- `ffprobe`: failed with `Invalid data found when processing input`

The URL is resolving to the site's HTML fallback rather than an MP4 asset. HTTP 200 alone is insufficient, so the task cannot pass until the video is deployed at the exact path with `Content-Type: video/mp4`.

## Evidence

- `smoke.txt`
- `smoke-exit-code.txt`
- `checked-at.txt`
- `url.txt`
- `curl-summary.txt`
- `video-headers.txt`
- `video-response.bin`
- `file-mime.txt`
- `ffprobe.txt`
- `sha256.txt`
- `command-status.txt`
