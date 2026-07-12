# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:36:27Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T203627Z`
- Result: FAIL
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `8a165a63d10bd80f7d835dfa99ba07e927c846d01350a64872502677b1bef8ef`
- `ffprobe`: failed (exit 1), confirming the response is not valid media

The endpoint resolves to the site's HTML fallback rather than the required MP4. HTTP 200 alone does not satisfy the release contract.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T203627Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T203627Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T203627Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T203627Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T203627Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T203627Z-sha256.txt`
