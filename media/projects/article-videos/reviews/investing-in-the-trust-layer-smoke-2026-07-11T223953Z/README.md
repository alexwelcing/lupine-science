# Investing in the Trust Layer — production QA

UTC run: 2026-07-11T22:39:53Z
Target: https://lupine.science/videos/investing-in-the-trust-layer.mp4

## Results

- `npm run smoke`: PASS (`14 pages and 352 linked resources`)
- Direct video request HTTP status: `200`
- Direct video response Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)
- Downloaded response MIME detected by `file`: `text/html`
- Downloaded response size: `84245` bytes
- Response body title: `Lupine Science — Unlocking the materials that build the future`
- `ffprobe`: FAIL (`moov atom not found`; invalid media)

## Conclusion

The acceptance criterion is not met. Production serves the homepage fallback HTML at the requested MP4 URL. The general smoke command passes because its linked-resource check accepts an HTTP-successful response without asserting the resource Content-Type or validating that the body is an MP4.

Evidence files:

- `npm-run-smoke.log`
- `smoke-status.txt`
- `video-http-summary.txt`
- `video-headers.txt`
- `downloaded-file-mime.txt`
- `investing-in-the-trust-layer.mp4` (the misrouted HTML response, retained with requested filename)
