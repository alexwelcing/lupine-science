# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T22:55:54Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one target.

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a cache-busting query)
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- Cloudflare cache status: `MISS`
- SHA-256: `a8c4c6f1a99db1205f62e26c6a46a9f9b5b5ad2060694a56abeac7734a56f00e`
- `ffprobe`: FAIL — invalid media data

## Result

FAIL. The live route returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not meet the required video contract.

## Evidence

- `smoke.log`
- `url.txt`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
