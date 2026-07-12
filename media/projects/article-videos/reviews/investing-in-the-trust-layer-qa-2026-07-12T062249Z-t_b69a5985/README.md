# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T06:22:49Z
Task: `t_b69a5985`
URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result

BLOCKED / FAIL: the live URL does not serve an MP4.

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- HEAD request: HTTP 200, but `Content-Type: text/html; charset=utf-8`.
- Range GET (`bytes=0-1023`): HTTP 206, but `Content-Type: text/html; charset=utf-8`.
- Returned object size is 84,055 bytes (`Content-Range: bytes 0-1023/84055`), and the downloaded prefix is an HTML document rather than MP4 data.

The route appears to resolve to an HTML fallback/object instead of the requested video. The acceptance criterion requiring HTTP 200 with the correct MP4 content type is therefore not met.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `video-result.txt`
- `video-range-headers.txt`
- `video-range-result.txt`
- `video-prefix.bin`
- `video-prefix-file.txt`
