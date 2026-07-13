# Animator visual QA — t_1c21b85a-v2

## Verdict

**ANIMATOR PASS — independent Fable/director approval still required.**

The final rendered master was decoded at 98 review timestamps and inspected through 11 contact sheets plus the native 1920×1080 mandatory frames. No animator-scored frame remains below 7/10; `below-7/` is intentionally empty apart from its README.

## Review identity

- Master: `renders/beyond-carbon-error-geometry-v2-review-1080p.mp4`
- Master SHA-256: `ccf781aff8f3dcc9f74b9eaf61c4cd0b72ca3ad18f30f116c9344fa65b2f7ef6`
- Captions: `renders/beyond-carbon-error-geometry-v2-review-1080p.vtt`
- Canvas: 1920×1080
- Video: H.264, yuv420p, 30 fps, 112.000 s
- Audio: AAC, 48 kHz, stereo, 112.021333 s
- Review rows: 98
- Contact sheets: 11 (nine full-resolution decodes per sheet except the final partial sheet)

## Zero-tolerance transition remediation

The first v2 render exposed real failures at the director-mandated exact timestamps: the moving vertical trace crossed text at 74.991 s and 93.935 s, while the animated section banner obscured the chart's lower callout at 61.612 s. The final source removes those overlay transitions, uses single-frame scene handoffs, suppresses the occluding section banners, and starts the outro with substantive mark/wordmark/CTA content already present.

Fresh source preflight snapshots are preserved in `preflight-exact/`. The final decoded master was then re-rendered, re-hashed, and re-extracted.

## Mandatory exact-frame findings

| Timestamp | Frame | Animator finding | Score |
|---:|---|---|---:|
| 00:00.000 | `frame-000-f0000-at-00-00-00-000.jpg` | Intentional Lupine mark + wordmark composition; nonblank, centered, unclipped. | 10/10 |
| 00:00.100 | `frame-001-f0003-at-00-00-00-100.jpg` | Intentional Lupine mark + wordmark composition remains substantive and clean. | 10/10 |
| 01:01.612 | `frame-049-f1848-at-00-01-01-612.jpg` | Clean scene 05 handoff; headline/body provide one focal system; no wipe or banner obscures the graph. | 10/10 |
| 01:14.991 | `frame-062-f2250-at-00-01-14-991.jpg` | Clean scene 06 handoff; no outgoing text, crossing trace, or lower-third collision. | 10/10 |
| 01:33.935 | `frame-078-f2818-at-00-01-33-935.jpg` | Clean scene 07 handoff; one complete incoming focal system; no crossing trace or overlay. | 10/10 |
| 01:46.920 | `frame-093-f3208-at-00-01-46-920.jpg` | Substantive outro mark, wordmark, CTA, rule, and destination; no competing article scene. | 10/10 |
| 01:51.967 | `frame-097-f3359-at-00-01-51-967.jpg` | Final hold remains stable and readable. | 10/10 |

## Full-sheet review

All 98 manifest rows were visually checked for:

- visible type below the 36 px label/data floor or 48 px narrative/CTA floor;
- text clipping, overlap, or rule/wipe crossings;
- outgoing/incoming focal competition;
- blank or identity-less transition states;
- accidental low-opacity focal content;
- render corruption or obvious artifacts.

The opening identity, seven article scenes, all transition brackets, cue boundaries, five-second cadence frames, and final hold passed animator review. Deliberately staged chart construction states retain a complete headline/body claim and are not blank or half-empty focal failures.

## Objective checks

- HyperFrames lint: 0 errors, 0 warnings.
- HyperFrames validate: 0 errors, 0 warnings, 0 contrast failures.
- HyperFrames strict inspect: 0 errors, 0 warnings, 0 issues.
- Computed typography: 18 audited selectors, 0 failures.
- CSpell: 1 file checked, 0 issues; exceptions are recorded in `cspell.json`.
- Full ffmpeg decode: exit 0.
- VTT timing: 32 monotonic, non-overlapping cues contained by the 112 s master.
- Versioned VTT and source VTT: byte-identical (`cmp` exit 0).

## Evidence index

- `manifest.tsv` / `manifest.json` — timestamps, frame numbers, master hash, reasons, filenames.
- `decoded-frames/` — 98 full-resolution JPEG decodes.
- `contact-sheets/` — 11 review sheets.
- `animator-self-scorecard.csv` — one row per manifest timestamp.
- `computed-typography.json` / `.md` / `.raw.txt` — visible computed font-size evidence.
- `hyperframes-*.raw.txt` — fresh lint, validation, and strict inspection output.
- `master.ffprobe.raw.txt` — stream and format metadata.
- `master.full-decode.raw.txt` — complete decode command and exit status.
- `master.sha256.txt` / `review-package.sha256.txt` — master and package hashes.
- `vtt-timing-validation.txt` / `vtt-spellcheck.raw.txt` / `cspell.json` — caption evidence.
- `preflight-exact/` / `preflight-exact.raw.txt` — final source transition snapshots.
- `below-7/README.md` — explicit empty animator failure set.

## Reviewer boundary

This animator scorecard is not independent review. Fable must score every `manifest.tsv` row independently, enforce the same zero-tolerance rules, and issue the final verdict. The task must remain blocked until reviewer/director approval is recorded.
