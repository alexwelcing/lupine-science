# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T04:21:45Z
Task: `t_b69a5985`

## Result

**BLOCKED / FAIL:** repository smoke checks pass, but the required direct video endpoint does not return an MP4.

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: **PASS** (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
Result: **FAIL**

Observed response:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected file MIME type: `text/html`
- SHA-256: `f748b5123eef934fd6460fd156c7830a8f5c41dc5948dd5788ad4f67f2e58968`
- `ffprobe`: `Invalid data found when processing input`

The endpoint serves the site's HTML fallback rather than playable MP4 media. HTTP 200 alone does not satisfy the required video-link contract.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-curl-summary.txt`
- `video-response.bin`
- `video-file-mime.txt`
- `video-ffprobe.txt`
- `video-sha256.txt`
