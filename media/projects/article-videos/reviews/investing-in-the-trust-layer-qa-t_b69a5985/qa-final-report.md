# Investing in the Trust Layer — QA smoke test

Run date: 2026-07-11

## Result: BLOCKED / FAIL

### Live smoke test

Command: `npm run smoke`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

Evidence: `npm-smoke-final.log`

### Video URL verification

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

- HTTP status: `200`
- Expected Content-Type: `video/mp4`
- Actual Content-Type: `text/html; charset=utf-8`
- Downloaded response identified by `file` as an HTML document
- Response size: 84,245 bytes
- SHA-256: `e450089ffc8a8241941faa271cac518be67ff85660b8782e9866e0997837733e`

The route appears to return the site's HTML fallback rather than an MP4 asset. The task cannot be confirmed until this URL serves the actual video with `Content-Type: video/mp4`.

Evidence:

- `video-response-headers-final.txt`
- `video-response-final.mp4` (the returned HTML response, retained verbatim despite the extension)
