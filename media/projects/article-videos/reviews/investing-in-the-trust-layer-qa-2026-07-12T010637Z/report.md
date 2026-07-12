# Investing in the Trust Layer — live QA smoke

Checked: 2026-07-12T01:06:37Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across one live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting request URL recorded in `url.txt`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `9fd784a9c4b1f0b492c5395467814f8fc622d4498f87562f6bbdadc7d2197eb6`
- ffprobe: FAIL (`moov atom not found`; invalid media)

## Verdict

BLOCKED / FAIL. The URL returns the site's HTML fallback with HTTP 200 rather than an MP4. The acceptance requirement is not met until the video artifact is deployed and the endpoint returns HTTP 200 with `Content-Type: video/mp4`.

## Evidence

- `curl.txt`
- `headers.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `response.mp4`
- `url.txt`
