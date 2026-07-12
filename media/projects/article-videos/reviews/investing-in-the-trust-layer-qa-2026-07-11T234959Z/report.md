# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:49:59Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across one live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T234959Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `44f63531222c56ee03db94452388724eba8922243482101b6bfa2aab47d25a72`
- ffprobe: FAIL (exit 1; response is not valid media)

## Verdict

FAIL. The repository smoke suite passes, but the required `/videos/investing-in-the-trust-layer.mp4` endpoint returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the release contract.

Raw evidence is stored alongside this report: `smoke.log`, `smoke.exit`, `url.txt`, `headers.txt`, `curl.txt`, `response.bin`, `file.txt`, `sha256.txt`, `ffprobe.txt`, and `status.txt`.
