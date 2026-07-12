# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T21:43:17Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `052d082c18cdafc702536c6245c66a2db6e53495903419edf4dcecdd6f0f754d`
- ffprobe: FAIL (response is not valid media)

## Verdict

FAIL. The production smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not satisfied until the endpoint returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `headers.txt`
- `response.bin`
- `curl.txt`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `status.txt`
