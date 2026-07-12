# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T04:32:16Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a cache-busting query parameter)
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `662c5f59bd5ff27bf95139c680d95712fdfa1b9b34489a89e9e6d3da8b457ccd`
- ffprobe: FAIL (exit 1)

Result: FAIL. The URL returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the video endpoint contract.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `video-headers.txt`
- `video-response.bin`
- `curl-summary.txt`
- `curl-exit-code.txt`
- `file-mime.txt`
- `ffprobe.txt`
- `ffprobe-exit-code.txt`
- `sha256.txt`
