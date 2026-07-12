# Investing in the Trust Layer — QA smoke and live video verification

Checked: 2026-07-11T183823Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T183823Z`

Result: FAIL

- HTTP status: `200`
- Response Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- File MIME detection: `text/html`
- CF-Cache-Status: `MISS`
- SHA-256: `9911cbb5e1b24cd7fc181a72d517cde16d631aedb71de0997dd8ca69c1f02547`
- ffprobe exit: `1`

Overall: FAIL

## Evidence

- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T183823Z-smoke.log`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T183823Z-curl.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T183823Z-headers.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T183823Z-file.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T183823Z-ffprobe.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T183823Z-response.bin`
