# Director v2 signoff — A Field, Not a Neural Net

Date: 2026-07-10  
Review ticket: `t_1cb4d4b6`  
Reviewed render: `renders/a-field-not-a-neural-net-review-v2.mp4`  
Render SHA-256: `2ad3031e29d119670f2345b38871b251bf3ac7bec99d0511560bbc50672549eb`  
Decision: **APPROVED FOR WEB**  
P0 blockers: 0  
P1 blockers: 0

## Director findings

- The corrected export runs 117.312 seconds and carries the full 117.288-second program. Narration remains active through the closing thesis at 01:51.780–01:56.600; the only detected trailing silence begins at 01:56.618 and lasts 0.694 seconds into the completed outro. The v1 hard cutoff at 01:46 is resolved.
- The seven retimed visual worlds land cleanly at the final word-cue starts: 00:15.700, 00:32.580, 00:47.460, 01:06.080, 01:23.660, 01:40.220, and 01:51.780. Exact-boundary frames contain designed content rather than blank or wipe-only states.
- Full-timeline frame review shows coherent progression from prediction gap through under-coordination, measured field, blind evidence, runtime correction, proof boundary, climate payoff, and final Lupine Science thesis/outro.
- Typography, evidence hierarchy, chart labels, and quantitative callouts are legible at 1920×1080. No blocking headline collision, clipping, unsafe-margin violation, black frame, unintended blank hold, or persistent stale frame was found.
- The final thesis and Lupine Science outro are complete and remain on screen through the final frame.
- Both review and web files decode without audio/video errors. Review audio is 48 kHz stereo AAC with approximately 1.9 LU loudness range and −4.2 dBFS true peak; no mid-program silence of 0.5 seconds or longer was detected.
- English WebVTT captions are present, nonempty, monotonic, and cover all 26 approved cues through 01:56.600.
- The 1280×720 web encode is 5,205,681 bytes over 117.312 seconds: **2.662 MB/min**, below the ≤3 MB/min gate.

## Technical evidence

- Review: 1920×1080, 30 fps, H.264/AAC, 117.312 s, 16,085,548 bytes.
- Web: 1280×720, 30 fps, H.264/AAC, 117.312 s, 5,205,681 bytes.
- Review SHA-256: `2ad3031e29d119670f2345b38871b251bf3ac7bec99d0511560bbc50672549eb`.
- Web SHA-256: `016c28be8fba70420724612e705e5e00975ffbca07d3179b31b96d6784fe140b`.
- Full-stream decode: clean for both files.
- Black-frame detection: none.
- Timeline evidence: `/tmp/visual-qa-t_1cb4d4b6/full-timeline.jpg` and `/tmp/visual-qa-t_1cb4d4b6/keyframes.jpg`.

## Verdict

**APPROVE.** The v2 render resolves the prior truncation and synchronization rejection, passes visual and audio QC, includes complete captions, and meets the web bitrate-size gate. `a-field-not-a-neural-net-web-v2-720p.mp4` is approved for publication.
