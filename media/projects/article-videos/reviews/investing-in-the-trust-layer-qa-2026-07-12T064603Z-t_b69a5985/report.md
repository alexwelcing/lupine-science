# Investing in the Trust Layer — QA smoke and video-link verification

Checked: 2026-07-12T06:46:03Z
Task: `t_b69a5985`

## Result: FAIL

### Repository smoke test: PASS

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: 14 pages and 352 linked resources passed across one live target.

### Direct video URL contract: FAIL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T064603Z`
- HTTP status: `200`
- Actual Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: `84,245` bytes
- Detected file type: HTML document, UTF-8 text
- SHA-256: `52ea9a75d02d600833434508066b20938a17fef1f4b73817730b17dd9c3c77f8`
- `ffprobe`: `Invalid data found when processing input`

The URL resolves to the site's HTML fallback rather than an MP4 asset. HTTP 200 alone does not satisfy the acceptance criterion.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-response.bin`
- `curl-result.txt`
- `file-type.txt`
- `sha256.txt`
- `ffprobe.txt`
