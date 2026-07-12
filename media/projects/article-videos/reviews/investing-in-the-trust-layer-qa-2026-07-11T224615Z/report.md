# Investing in the Trust Layer — production video QA

Checked: 2026-07-11T22:46:15Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T224615Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `3a79410b489563f2de430af8e21cd71d590dc8ffcdc074632811baed21deaf1d`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The site-wide smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` serves the HTML application fallback rather than MP4 media. The acceptance criterion is not met until this URL returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `url.txt`
- `headers.txt`
- `response.bin`
- `curl.txt`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `results.txt`
