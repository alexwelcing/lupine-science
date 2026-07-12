# Five Materials — P0 single-frame rejection remediation

Status: READY FOR VISUAL RE-REVIEW

Task: `t_f88b8de7`

## Fix

- Reflowed every 48 px lower-third from y=666 to y=600, preserving the typography floor while separating multi-line copy from the evidence divider at y=828.
- Removed the full-height indigo wipe choreography that traversed meaningful text during scene transitions.
- Preserved composition duration, narration, captions, scene timing, palette, fonts, and all substantive copy.

## Replacement master

- File: `five-materials-for-5-to-12-gtco2-year/renders/five-materials-v3-review-1080p.mp4`
- SHA-256: `5fdaa88725ac68fb5e7cd17b92a231966edb8ca9df9f83f68906edc8e95e8af0`
- Video: H.264, 1920×1080, yuv420p, 30 fps
- Audio: AAC
- Duration: 92.437333 seconds
- Size: 14,098,263 bytes
- Captions: `five-materials-for-5-to-12-gtco2-year/captions/five-materials.en.vtt` (19 synchronized cues)

## Required timestamp results

| Time | Result |
|---:|---|
| 48.0s | PASS — lower-third copy is clear; evidence divider is below it; no wipe or graphic obscures text. |
| 75.0s | PASS — three-line proof-kernel copy is clear and separated from the divider. |
| 80.0s | PASS — animated candidates remain inside the diagram; body and evidence copy are unobstructed. |
| 84.0s | PASS — refusal state remains inside the diagram; no rule crosses meaningful copy. |

Boundary samples at 36.2, 36.585, 36.8, 47.8, 48.0, 48.2, 49.3, 49.535, 49.8, 72.1, 72.313, 72.6, 86.2, 86.434, and 86.7 seconds are also clear.

## Verification

- HyperFrames lint: PASS, 0 errors / 0 warnings / 0 info.
- HyperFrames validate: PASS, 0 errors / 0 warnings; all sampled text passes WCAG AA.
- HyperFrames inspect `--strict`: PASS, 0 issues across 19 samples.
- Strict high-quality render: PASS.
- Full-stream ffmpeg decode: PASS.
- Decoded master audit: 41 full-frame JPEGs covering the five-second grid, all WebVTT cue starts, all scene boundaries, and explicit defect/worst timestamps; no single-frame rejection defect observed.

## Evidence

- Full decoded-frame contact sheet: `five-materials-for-5-to-12-gtco2-year/evidence/p0-clear-t_f88b8de7/full-frame-contact-sheet.jpg`
- Full-resolution decoded frames and manifest: `five-materials-for-5-to-12-gtco2-year/evidence/p0-clear-t_f88b8de7/decoded-frames/`
- ffprobe record: `five-materials-for-5-to-12-gtco2-year/evidence/p0-clear-t_f88b8de7/ffprobe.json`
- checksum record: `five-materials-for-5-to-12-gtco2-year/evidence/p0-clear-t_f88b8de7/sha256.txt`
- HyperFrames transition/worst-frame snapshots: `five-materials-for-5-to-12-gtco2-year/snapshots-p0-t_f88b8de7/`

## Reviewer gate

A visual reviewer must re-approve the decoded v3 master before director sign-off. Review the MP4-derived evidence rather than HTML snapshots, with particular attention to 48.0, 75.0, 80.0, 84.0 seconds and every transition boundary listed above.
