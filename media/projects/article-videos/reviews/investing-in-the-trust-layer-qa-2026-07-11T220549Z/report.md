# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T22:05:49Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across 1 target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting query: `?qa=2026-07-11T220549Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `7585eefb23f54be7b5af2bf55947fe2956a5899170c7c08ff4f6ab39264f6edb`
- ffprobe: FAIL (exit 1; response is not valid media)

## Result

FAIL. The smoke suite passes, but the required direct video route contract does not. The route returns HTTP 200 with the site's HTML fallback rather than an MP4. Release verification must remain blocked until the endpoint returns HTTP 200 with `Content-Type: video/mp4` and a valid MP4 payload.

## Evidence

- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
