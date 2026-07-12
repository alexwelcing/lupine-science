# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T00:57:07Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage reported: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T005707Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Payload identification: HTML document, UTF-8 text
- First bytes: `<!doctype html>`
- SHA-256: `0edb9891121965c590fa3c5b2ffde3d69db4e1c2b4066d1c5bdf6f9ff659347e`
- ffprobe: rejected payload as invalid media data

## Verdict

FAIL. The repository smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion requires HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `verification.txt`
