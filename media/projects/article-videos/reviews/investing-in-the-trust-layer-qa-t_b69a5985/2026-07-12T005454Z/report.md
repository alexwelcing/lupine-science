# Investing in the Trust Layer — live QA verification

Timestamp: 2026-07-12T00:54:54Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Exit code: `0`

Result:

- PASS: 14 pages and 352 linked resources
- All live smoke checks passed across 1 target

## Direct video URL contract

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T005512Z`
Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`

Observed:

- HTTP status: `200`
- Redirects: `0`
- Content-Type: `text/html; charset=utf-8`
- Download size: `84,245` bytes
- Cloudflare cache status: `MISS`
- SHA-256: `874d2744ce1775e0ca66666ea7ab0c6ef51ef9a03a5ea3c512201ae56d3ced1e`
- `file`: `HTML document, Unicode text, UTF-8 text, with very long lines (753)`
- `ffprobe`: exit `1`, `Invalid data found when processing input`

## Verdict

**FAIL / BLOCKED.** The general live smoke suite passes, and the requested video path returns HTTP 200, but it serves the site's HTML fallback rather than an MP4. The task's required contract is not satisfied until the endpoint returns `Content-Type: video/mp4` with valid MP4 bytes.
