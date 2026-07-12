# Investing in the Trust Layer — live QA verification

Timestamp: 2026-07-12T07:43:54Z
Task: `t_b69a5985`
URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T074354Z`

## Results

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- Video URL HTTP status: PASS — 200.
- Video URL content type: FAIL — server returned `text/html; charset=utf-8`, not a video MIME type such as `video/mp4`.
- Downloaded body MIME detection: FAIL — `file` identified the response as `text/html`.
- Downloaded size: 84,245 bytes.
- Redirects: 0.

## Conclusion

The site-wide smoke test passes, but the requested video link is not serving an MP4. The endpoint appears to return the HTML site shell with HTTP 200. This task cannot be marked complete until `/videos/investing-in-the-trust-layer.mp4` serves the video with the correct content type.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `detected-mime.txt`
- `response.bin`
- `sha256.txt`
- `status.env`
- `url.txt`
