# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T02:06:56Z

## Result: FAIL

The repository smoke suite passes, but the stable production video URL does not satisfy the media contract.

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources

## Production video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T020656Z`
- Redirects: `0`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- `file`: HTML document
- `ffprobe`: FAIL — invalid media data

The route is serving the site HTML fallback rather than an MP4. The asset must be included in the production deployment or served from the configured video origin before this QA gate can pass.

## Evidence

- `smoke.log`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `verification.txt`
