# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T19:41:46Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across one live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting query and `Cache-Control: no-cache` used
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File detection: HTML document
- SHA-256: `c9562195f25d4233b2e37a60692786f2f39b0ea23886572ee21a3e0741210163`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The smoke suite passes, but the direct video URL returns the site's HTML fallback instead of an MP4. HTTP 200 alone does not satisfy the required video contract.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194146Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194146Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194146Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194146Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194146Z-sha256.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194146Z-ffprobe.txt`
