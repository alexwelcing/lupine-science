# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T05:11:28Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage reported: 14 pages and 352 linked resources across one live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T051128Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- ffprobe: FAIL (`Invalid data found when processing input`)

Result: FAIL. The endpoint returns the site's HTML fallback rather than an MP4, so it does not meet the required video-link contract despite returning HTTP 200.

## Evidence

- `curl.txt` — curl transfer metadata
- `headers.txt` — response headers
- `response.bin` — downloaded response body
- `file.txt` — detected MIME type
- `ffprobe.txt` — media validation output
- `sha256.txt` — response checksum
- `exit-codes.txt` — curl and ffprobe exit codes
- `stamp.txt` and `url.txt` — test timestamp and exact cache-busted URL
