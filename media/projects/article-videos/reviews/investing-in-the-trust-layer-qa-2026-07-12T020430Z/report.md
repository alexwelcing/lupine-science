# Investing in the Trust Layer — QA verification

Checked: 2026-07-12T02:04:30Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting request: `?qa=2026-07-12T020430Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: 200
- Response Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- Cloudflare cache status: `MISS`
- SHA-256: `8333478529110916c58d955fd46edc8175ed8a33b204eeb9954b09d9e6b7006c`
- ffprobe: FAIL — invalid media data
- Result: FAIL

The live route returns the site's HTML fallback instead of an MP4. HTTP 200 alone does not satisfy the release contract. The video must be deployed to the expected path and then rechecked for both HTTP 200 and `Content-Type: video/mp4`.

## Evidence

All raw evidence is in this directory:

- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `url.txt`
