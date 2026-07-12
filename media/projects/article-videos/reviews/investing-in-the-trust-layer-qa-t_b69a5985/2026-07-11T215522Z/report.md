# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T21:55:22Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Redirects: 0
- HTTP status: `200`
- Response Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `f6cbd2b542cff0792a160c6c719904f5d03417d6c0084ce422462e440e6011cb`
- ffprobe: FAIL (exit 1; response is not valid media)

## Verdict

FAIL. The repository smoke suite passes, but the required direct video endpoint serves the site HTML fallback rather than an MP4. The acceptance criterion is not satisfied until the URL returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `video-response.bin`
- `curl-metrics.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `result-codes.txt`
