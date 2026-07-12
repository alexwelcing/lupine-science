# Investing in the Trust Layer — QA smoke verification

Tested: 2026-07-12T05:43:59Z
Task: `t_b69a5985`
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: FAIL

### Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Exit code: `0`

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

### Required video URL

A cache-busting request used `Cache-Control: no-cache` and `Accept: video/mp4`.

HEAD response:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`

Range GET (`bytes=0-31`) response:

- HTTP status: `206`
- Content-Type: `text/html; charset=utf-8`
- Content-Range: `bytes 0-31/84055`
- First bytes decode to `<!doctype html>`

## Conclusion

The smoke suite passes, and the required URL returns HTTP 200 to HEAD, but the deployed route serves the site's HTML fallback rather than an MP4. The requested acceptance criterion is not met until this path serves the video with `Content-Type: video/mp4`.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `head-headers.txt`
- `range-headers.txt`
- `prefix.bin`
