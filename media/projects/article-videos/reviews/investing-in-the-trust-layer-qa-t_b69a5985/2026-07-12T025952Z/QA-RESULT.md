# Investing in the Trust Layer — live QA result

Verified: 2026-07-12T02:59:52Z

## Smoke suite

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit status: 0 (PASS)
- Result: 14 pages and 352 linked resources passed across one live target.

## Direct video contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T025952Z`
- HTTP status: 200
- Reported Content-Type: `text/html; charset=utf-8`
- Detected file MIME: `text/html`
- Response size: 84,245 bytes
- Redirects: 0
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` serves the site's HTML fallback rather than an MP4. The required `video/mp4` content type and valid video payload are absent.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit`
- `video-headers.txt`
- `video-response.bin`
- `curl-summary.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe-error.txt`
