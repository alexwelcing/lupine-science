# Investing in the Trust Layer — live QA verification

Tested: 2026-07-12 07:11:52 UTC
Target: https://lupine.science
Task: t_b69a5985

## Smoke suite

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T071152Z`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Downloaded response size: 84,245 bytes
- Cloudflare cache status: `MISS`
- Expected Content-Type: `video/mp4`

## Verdict

FAIL. The site-wide smoke suite passes and the requested video URL returns HTTP 200, but the endpoint serves the HTML fallback page rather than MP4 media. The required content type is not present, so the video link is not verified as working.

Evidence:

- `headers.txt` — complete response headers
- `curl-result.txt` — curl status, content type, size, and timing
