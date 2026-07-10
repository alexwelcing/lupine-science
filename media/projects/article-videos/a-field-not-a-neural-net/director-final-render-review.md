# Director final-render review — A Field, Not a Neural Net

Review ticket: `t_05505b16`  
Reviewed render: `renders/a-field-not-a-neural-net-review-v1.mp4`  
Render SHA-256: `f65830b865d1a697275fd985cee4255b960021d4421b4eda215646844d1fe842`  
Decision: **REJECT — NOT APPROVED FOR WEB**  
P0 blockers: 1  
P1 blockers: 1

## Blocking notes

### P0 — 01:46.000: narration is cut before the argument finishes

The render ends at 106.027 seconds, while `audio/final-mix.wav` and `narration-ana-final.wav` are both 117.288 seconds. The composition explicitly declares `data-duration="106"` and `data-trim-end="106"`, so the export truncates more than eleven seconds of the approved master.

The word-timed transcript places the climate-material sentence at 01:40.220–01:48.120, meaning the render cuts that sentence mid-thought at 01:46. The following approved lines do not play at all:

- 01:48.840–01:50.940 — “So the goal is not more confident predictions.”
- 01:51.780–01:56.600 — “It is fast predictions with measured corrections, certified boundaries, and a provable reason to stop.”

This removes the narrative resolution and makes the current export incomplete. It cannot ship.

### P1 — approximately 01:01–01:46: visuals increasingly lead the mastered narration

The visual world timing remains locked to the obsolete 106-second storyboard guide while the approved narration runs 117.288 seconds. Drift becomes material in the second half:

- Runtime-correction visuals begin around 01:01; the corresponding narration begins at 01:06.080 (about 5 seconds early).
- Proof-boundary visuals begin around 01:17; the corresponding narration begins at 01:23.660 (about 6.7 seconds early).
- Climate-payoff visuals begin around 01:34; the corresponding narration begins at 01:40.220 (about 6.2 seconds early).
- The visual thesis/outro arrives before its matching final narration, which is then omitted by the 106-second trim.

Retiming must be driven by the final word-level transcript, not the provisional storyboard ranges.

## What passed

- Visual export is 1920×1080, 30 fps, progressive H.264/yuv420p with BT.709 signaling.
- Audio stream is AAC-LC, 48 kHz stereo; decode completed without errors.
- Measured program loudness is approximately −16.01 LUFS integrated, −4.28 dBTP, with 1.80 LU LRA; there is adequate peak headroom and no detected long silence.
- Full-timeline frame sampling showed no persistent clipping, headline collision, unsafe-margin violation, black frame, or unintended blank hold. The brief near-white line-wipe states at world boundaries read as intentional transitions.
- Paper/ink/indigo art direction, typography, evidence hierarchy, and Lupine outro branding are visually consistent.
- The core quantitative evidence remains legible at full 1920×1080 review size: `2.2M / 736`, coordination `12 → 11 → 9 → 7`, `r = 0.906 / n = 36`, `9.7% → 1.5%`, and `813 < 813 · FALSE`.

## Required revision

1. Choose one valid timing strategy:
   - extend the composition and render to the full mastered narration (approximately 117.3 seconds), retiming all world boundaries from the word-level transcript; or
   - produce a genuinely revised 106-second narration master that contains every approved line, then regenerate word timings and retime the visuals to that master.
2. Remove the hard 106-second audio trim unless the replacement master is truly 106 seconds.
3. Re-render and verify that the closing climate sentence and both thesis lines play in full.
4. Perform a fresh full-size playback review with audio before web approval.

## Verification evidence

- Container probe: 106.027-second MP4; 1920×1080 H.264 at 30 fps; 48 kHz stereo AAC.
- Source-master probe: `audio/final-mix.wav` = 117.288 seconds; `narration-ana-final.wav` = 117.288 seconds.
- Audio QC: −16.01 LUFS integrated; −4.28 dBTP; 1.80 LU LRA; successful full-stream decode.
- Visual QC: 2-second interval contact-sheet review across the complete export plus existing project snapshot/validation evidence.

## Verdict

**REJECT.** The visual system is otherwise web-ready, but the exported audio is truncated and the second-half picture timing no longer follows the mastered narration. Approval requires a corrected, fully synchronized render.