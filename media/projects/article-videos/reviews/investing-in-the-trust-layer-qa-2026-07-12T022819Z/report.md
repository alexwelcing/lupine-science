# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T02:28:19Z

## Result: FAIL

The repository smoke suite passed, but the direct video URL does not serve an MP4.

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: 14 pages and 352 linked resources passed

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting verification URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T022819Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `e767eec8bbbbef9a874c1fbd1044eb1ae27deca90a211774eb1f9f2a02755e37`
- ffprobe: failed with `Invalid data found when processing input`

The 200 response is the site's HTML fallback, not valid MP4 media. The video-link acceptance criterion is therefore not met.

## Evidence

- `smoke.log`
- `curl.txt`
- `curl-stderr.txt`
- `headers.txt`
- `response.bin`
- `file-mime.txt`
- `ffprobe.txt`
- `ffprobe-stderr.txt`
- `sha256.txt`
- `results.txt`
