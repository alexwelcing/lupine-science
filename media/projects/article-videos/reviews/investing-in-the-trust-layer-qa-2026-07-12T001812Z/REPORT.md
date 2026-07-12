# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T00:18:12Z

## Repository smoke suite

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage reported: 14 pages and 352 linked resources

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T001812Z`
- Redirects: 0
- HTTP status: 200
- HTTP Content-Type: `text/html; charset=utf-8`
- Detected body MIME type: `text/html`
- Downloaded size: 84,245 bytes
- `ffprobe`: FAIL (exit 1; response is not valid media)

## Verdict

FAIL. The smoke suite passes and the video URL returns HTTP 200, but the endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion requires `Content-Type: video/mp4` and valid MP4 bytes.

Raw evidence is stored alongside this report (`smoke.log`, `headers.txt`, `curl.txt`, `response.bin`, `mime.txt`, `ffprobe.txt`, and `sha256.txt`).
