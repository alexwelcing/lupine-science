# Investing in the Trust Layer — live QA

Run: 2026-07-12T06:31:54Z  
Task: `t_b69a5985`

## Result

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4`: HTTP 200, but incorrect `Content-Type: text/html; charset=utf-8`.
- Downloaded response: 84,245 bytes of HTML, not MP4.
- `ffprobe`: failed with `moov atom not found` / `Invalid data found when processing input`.

The live video link does not satisfy the required MP4 content-type/content verification. The 200 response appears to be the site's HTML fallback.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `curl-summary.txt`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `video.mp4` (captured HTML response, retained with requested URL extension)
