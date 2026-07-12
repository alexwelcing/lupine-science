# Beyond Carbon video-link QA

- Task: `t_34b6cb7e`
- Checked: `2026-07-12T10:37:02Z`
- Target: `https://lupine.science`
- Video URL: `https://lupine.science/videos/beyond-carbon-the-error-geometry-of-environmental-materials.mp4`
- Result: **FAIL — URL resolves to HTML, not MP4**

## Smoke suite

Command:

`npm run smoke`

Result: exit code `0`.

```text
Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Direct video verification

A HEAD request followed redirects and returned:

```text
HTTP/2 200
content-type: text/html; charset=utf-8
x-content-type-options: nosniff
```

Expected:

```text
HTTP 200
content-type: video/mp4
```

A ranged GET (`Range: bytes=0-31`) returned HTTP `206` with `content-type: text/html; charset=utf-8`. The first 32 response bytes were:

```text
00000000: 3c 21 64 6f 63 74 79 70 65 20 68 74 6d 6c 3e 0a  <!doctype html>.
00000010: 3c 68 74 6d 6c 20 6c 61 6e 67 3d 22 65 6e 22 3e  <html lang="en">
```

An MP4 response should have an ISO Base Media File Format signature containing `ftyp` near the start. The response is therefore an HTML fallback page, not playable MP4 media.

## Conclusion

The general live smoke suite passes, but the Beyond Carbon video is not correctly deployed at the linked URL. Publication/deployment should remain blocked until the endpoint returns the MP4 payload with `Content-Type: video/mp4`.
