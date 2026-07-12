# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T22:51:56Z

## Result: BLOCKED

The repository smoke suite passes, but the required direct video URL contract fails.

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS
- Coverage: 14 pages and 352 linked resources across one live target

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a unique cache-busting query parameter)
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Cloudflare cache status: `MISS`
- Downloaded bytes: `84245`
- Detected MIME type: `text/html`
- SHA-256: `47593c32adba5560320f4173a8a425d5599df51c500f9e169a5c3b0f42da5f64`
- ffprobe exit code: `1` (`moov atom not found`; invalid media)

HTTP 200 alone is a false positive: the route currently serves the site's HTML fallback rather than an MP4.

## Evidence

All evidence is in this directory:

- `npm-smoke.log`
- `npm-smoke.exit`
- `url.txt`
- `headers.txt`
- `http-status.txt`
- `response.mp4`
- `file-mime.txt`
- `bytes.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe.exit`
