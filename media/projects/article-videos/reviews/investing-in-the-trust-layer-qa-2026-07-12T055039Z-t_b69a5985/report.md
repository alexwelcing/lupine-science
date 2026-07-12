# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T05:50:39Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busted request: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T055039Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: `84,245` bytes
- Detected file MIME: `text/html`
- `ffprobe`: exit 1; response is not valid media

## Verdict

FAIL. The live path returns the site HTML fallback with HTTP 200 rather than an MP4 payload. The smoke suite passes, but the direct video-link acceptance criterion is not met.

## Evidence

- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe-error.txt`
- `verification.txt`
