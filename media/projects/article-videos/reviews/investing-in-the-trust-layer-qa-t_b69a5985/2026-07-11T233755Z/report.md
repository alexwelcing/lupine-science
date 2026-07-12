# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:37:55Z

## Result: BLOCKED

### Repository smoke test: PASS

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: 0
- 14 pages and 352 linked resources passed across one live target.

### Direct video URL contract: FAIL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting request: `?qa=2026-07-11T233755Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File MIME detection: `text/html`
- SHA-256: `ad28fa7d273d1aab56e35306f454a01c9675f0a3d7af57cb64799459aba2d835`
- ffprobe: exit 1, `Invalid data found when processing input`

The route returns the site's HTML fallback instead of an MP4. HTTP 200 alone does not satisfy the requested contract.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
