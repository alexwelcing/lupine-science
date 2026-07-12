# Investing in the Trust Layer — QA smoke and live video verification

Checked: 2026-07-11T18:40:08Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T184008Z`

Result: FAIL

- HTTP status: `200`
- Response Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- File MIME detection: `text/html`
- CF-Cache-Status: `MISS`
- SHA-256: `fbb5b909e2d768004a85c532e3be361a32b7b23b6cb27ed683e1a80462091593`
- ffprobe exit: `1` (`Invalid data found when processing input`)

Overall: BLOCKED — the smoke suite passes, but the required video endpoint serves an HTML document rather than an MP4.

## Evidence

- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T184008Z-smoke.log`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T184008Z-curl.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T184008Z-headers.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T184008Z-file.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T184008Z-ffprobe.txt`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-11T184008Z-response.bin`
