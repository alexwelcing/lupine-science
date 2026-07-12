# Investing in the Trust Layer — live QA verification

- Task: `t_b69a5985`
- Checked: `2026-07-12T04:55:39Z`
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T045539Z`

## Smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

```text
Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Direct video request

Result: FAIL

```text
http_code=200
content_type=text/html; charset=utf-8
size_download=84245
file=HTML document, Unicode text, UTF-8 text, with very long lines (753)
sha256=2af641ad054f275d03f4c69f5e6412d9518143ed7e5d256c45ab3d83bed7ac5f
ffprobe_exit=1 (Invalid data found when processing input)
```

The endpoint returns HTTP 200, but it does not return an MP4 or a video MIME type. It returns the site HTML fallback with `content-type: text/html; charset=utf-8`. The live video asset/routing must be fixed before this QA task can pass.
