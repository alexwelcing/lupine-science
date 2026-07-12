# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:16:27Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T231627Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The live smoke suite passes, but the direct video URL returns the site's HTML fallback instead of MP4 media. The acceptance criterion remains unmet until this URL returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `headers.txt`
- `response.bin`
- `curl.txt`
- `curl.stderr.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe.stderr.txt`
- `verification.txt`
