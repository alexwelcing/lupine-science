# Investing in the Trust Layer — Live QA

Timestamp: 2026-07-12T01:27:00Z
Task: `t_b69a5985`

## Result: FAIL / BLOCKED

The repository live smoke suite passes, but the required video URL does not serve MP4 media.

## Smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

- Exit code: 0
- Pages: 14 passed
- Linked resources: 352 passed

## Video endpoint

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T012700Z`

The request used `Accept: video/mp4` and `Cache-Control: no-cache`.

- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Cloudflare cache: `MISS`
- Payload detected by `file`: `text/html`
- SHA-256: `fb990997c1b8d84fe53a168ce75f4987a0c67747dbcf13d55752f064061baa64`
- `ffprobe`: failed with `Invalid data found when processing input`

## Conclusion

The live route is returning the site's HTML fallback rather than an MP4. The acceptance criterion is not met. Publish or correctly map the video at `/videos/investing-in-the-trust-layer.mp4`, then rerun this QA task and require HTTP 200, `Content-Type: video/mp4`, and a successful media probe.
