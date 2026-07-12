# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:12:53Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a unique cache-busting query)
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `3d580d5e60a66f85c262cfbeafba0854d4e3b47fad310bfa3925eb4b0f00d91d`
- ffprobe: FAIL (exit 1; response is not valid media)

## Verdict

FAIL. The repository smoke suite passes, but the required video endpoint returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the release contract.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T201253Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T201253Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T201253Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T201253Z-ffprobe.txt`
