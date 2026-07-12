# Investing in the Trust Layer — live QA result

Task: `t_b69a5985`
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
Checked: 2026-07-11 22:20–22:21 UTC

## Result: FAIL

- `npm run smoke`: PASS (exit 0), reporting 14 pages and 352 linked resources.
- Direct `HEAD` request: HTTP 200, but `Content-Type: text/html; charset=utf-8` rather than `video/mp4`.
- Range request (`bytes=0-1023`): HTTP 206, also `Content-Type: text/html; charset=utf-8`.
- Returned payload begins with `<!doctype html>` and is identified by `file` as an HTML document.

The route exists only through an HTML fallback; it does not currently serve the requested MP4. The task acceptance criterion is therefore not met even though the general smoke suite passes.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit`
- `video-head.headers`
- `video-head.result`
- `video-range.headers`
- `video-range.result`
- `video-range.bin`
- `video-range.file`
