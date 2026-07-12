# Investing in the Trust Layer — live QA

UTC run: 2026-07-12T01:17:45Z

## Result

BLOCKED / FAIL: the live smoke suite passes, but the expected MP4 URL serves HTML rather than video.

## Smoke test

Command: `npm run smoke`

Result: PASS

- 14 pages checked
- 352 linked resources checked
- Exit code 0

Full output: `smoke.log`

## Video URL verification

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected a video media type such as `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document, Unicode text, UTF-8 text
- `ffprobe`: Invalid data found when processing input
- SHA-256: `81b604799c6d4b72fff935c31d12c986a0c527f60c62a77d5b08d24943bb9a9a`

The route appears to fall back to the site's HTML document instead of returning the MP4 asset. The acceptance criterion “returns 200 with correct content-type” is therefore not satisfied despite the 200 status.

## Evidence

- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `url.txt`
- `smoke.log`
