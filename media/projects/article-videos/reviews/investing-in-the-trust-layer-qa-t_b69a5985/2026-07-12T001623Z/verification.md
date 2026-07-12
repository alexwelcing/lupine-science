# Investing in the Trust Layer — QA verification

Checked: 2026-07-12T00:16:23Z

## Repository smoke test

- Command: `npm run smoke`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Live video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T001623Z`
- HTTP status: 200
- Response Content-Type: `text/html; charset=utf-8`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- ffprobe: FAIL (exit 1)

## Verdict

BLOCKED. The endpoint returns the site HTML fallback rather than an MP4. Release acceptance requires HTTP 200 and `Content-Type: video/mp4`; only the status requirement currently passes.
