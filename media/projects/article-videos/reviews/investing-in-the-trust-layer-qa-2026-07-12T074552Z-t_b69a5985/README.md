# Investing in the Trust Layer — live QA verification

Timestamp (UTC): 2026-07-12T07:45:52Z
URL: https://lupine.science/videos/investing-in-the-trust-layer.mp4

## Results

- `npm run smoke`: PASS (`14 pages and 352 linked resources`)
- Video URL HTTP status: `200`
- Video URL content type: `text/html; charset=utf-8` — FAIL (expected an MP4 media type such as `video/mp4`)
- Download size: `84245` bytes
- `file`: HTML document, not MP4
- `ffprobe`: failed with exit code 1

The route is returning the site's HTML fallback with HTTP 200 rather than the requested video. Therefore the task's video-link acceptance criterion is not met.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `curl-result.txt`
- `video-response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `result.env`
