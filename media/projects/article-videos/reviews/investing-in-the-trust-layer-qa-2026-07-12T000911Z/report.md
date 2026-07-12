# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T00:09:36Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (cache-busting query added to the verification request)
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `de04c1f6681fa6606c7d4007fea68ec3fca76246594d23187f083ed172a265b9`
- `ffprobe`: FAIL — `moov atom not found`; invalid media

Result: FAIL. The endpoint resolves to the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract.

## Evidence

- `smoke.log`
- `url.txt`
- `curl.txt`
- `headers.txt`
- `response.mp4` (the returned HTML body retained verbatim)
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
