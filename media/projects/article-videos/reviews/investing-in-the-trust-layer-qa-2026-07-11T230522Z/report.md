# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:05:22Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T230522Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- Leading bytes: `<!doctype html>` (not an MP4 `ftyp` box)
- SHA-256: `3ea5993d29b03123b31edc9f09f1e506d047ede3a6e5bec016fae66de3c293cf`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The live smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not satisfied until this URL returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `headers.txt`
- `response.bin`
- `curl.txt`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `verification.txt`
