# Investing in the Trust Layer — QA smoke and live video verification

Checked: 2026-07-12T03:05:19Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busted request URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T030519Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded bytes: `84,245`
- Detected MIME type: `text/html`
- SHA-256: `52941723f4950ad10d555659972da93c8b966ec90d63e32c7d3f14bc593207a8`
- ffprobe: `Invalid data found when processing input`

## Verdict

BLOCKED / FAIL. The repository smoke suite passes, but the required video endpoint serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested contract; the deployment/static asset mapping must return `video/mp4` for this path.

## Evidence

- `smoke.log`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
