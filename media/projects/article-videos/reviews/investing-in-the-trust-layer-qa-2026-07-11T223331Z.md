# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T22:33:31Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T223331Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `a3f3c605036ac97c9505823ec1f6bcd70bd682e190bd8d3e8dcad0b72f292593`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The production smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not satisfied until the endpoint returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T223331Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T223331Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T223331Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T223331Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T223331Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T223331Z-sha256.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T223331Z-ffprobe.txt`
