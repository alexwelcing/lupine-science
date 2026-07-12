# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:47:49Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T234749Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- ffprobe result: FAIL (exit 1)

## Verdict

FAIL. The site smoke suite passes, but the required video endpoint serves the HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the endpoint contract.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `verification.txt`
