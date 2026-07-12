# Investing in the Trust Layer — live QA verification

Tested: 2026-07-12 07:51:19 UTC
Task: `t_b69a5985`
Target: `https://lupine.science`

## Site smoke suite

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T075119Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Payload identification: HTML document, Unicode/UTF-8 text
- `ffprobe`: `Invalid data found when processing input`
- Cloudflare cache: `MISS`

## Verdict

The site-wide live smoke suite passes, but the required video endpoint is not serving an MP4. It returns the HTML fallback page with HTTP 200 and an incorrect content type, so the task acceptance criterion is not met.

Evidence files in this directory:

- `headers.txt`
- `curl.txt`
- `file.txt`
- `ffprobe.txt`
- `response.bin`
- `url.txt`
