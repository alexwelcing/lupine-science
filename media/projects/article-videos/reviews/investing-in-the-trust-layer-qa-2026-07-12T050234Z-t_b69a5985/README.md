# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T05:02:34Z
Task: `t_b69a5985`

## Result: BLOCKED

- `npm run smoke`: PASS (exit 0), covering 14 pages and 352 linked resources.
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4`: HTTP 200, but `Content-Type: text/html; charset=utf-8` rather than `video/mp4`.
- Downloaded response: 84,245 bytes, detected by `file` as `text/html`, and rejected by `ffprobe` (`moov atom not found`).
- Local source asset exists at `public/videos/investing-in-the-trust-layer.mp4`: detected as `video/mp4`, 3,813,568 bytes, 117.034 seconds.

The live endpoint therefore does not satisfy the acceptance criterion despite the general smoke suite passing. The current smoke script checks linked resources only for reachability/status; HTTP 200 HTML fallback responses can pass.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-curl-metrics.txt`
- `video-file-mime.txt`
- `video-ffprobe.txt`
- `video-response.mp4` (the unexpected HTML response body)
