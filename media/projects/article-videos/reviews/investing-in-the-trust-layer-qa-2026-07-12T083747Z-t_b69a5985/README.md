# Investing in the Trust Layer — live QA verification

Tested: 2026-07-12 08:37:47 UTC
Task: `t_b69a5985`
Target: `https://lupine.science`

## Site smoke suite

Command: `npm run smoke`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T083747Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- File identification: HTML document, Unicode UTF-8 text
- `ffprobe` exit code: 1 (payload is not valid media)

## Verdict

The general live smoke suite passes, but the requested video endpoint does not serve an MP4. It returns the site's HTML fallback with HTTP 200, so the required video-link verification cannot pass.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `video-response.bin`
- `curl-summary.txt`
- `file.txt`
- `ffprobe.txt`
- `exit-codes.txt`
