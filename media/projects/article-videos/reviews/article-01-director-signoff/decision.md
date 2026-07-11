# Article 1 director sign-off

## Decision: REJECT

The prototype communicates the scientific topic, but it is not release-ready: visual cues run substantially ahead of narration, the piece behaves as a sequence of static image cards rather than a causally animated film, opening typography collides, identity/outro requirements are absent, and the web encode exceeds the release limit.

## Review identity

- Article/video: `the-02-percent-synthesis-problem`
- Review task: `t_d2138916`
- Director: `director` (GPT-5.6 Sol)
- Review date: 2026-07-10
- Render: `prototype-01-the-02-percent-synthesis-problem/renders/prototype-01-the-02-percent-synthesis-problem_2026-07-10_00-57-48.mp4`
- SHA-256: `70c637b5fc7f523f0b07a1a2a64d32de5011e66ba5de77342fdb8cdd32471f2c`
- Evidence: `evidence/frames/manifest.tsv` (55 unique interval/cue frames) and `evidence/contact-sheet-5s.jpg`
- Source inspected: `prototype-01-the-02-percent-synthesis-problem/index.html`, `cues.json`, `audio/narration.vtt`

## Technical proof

- Video: H.264, 1920×1080, 30 fps — PASS X01.
- Audio stream: AAC, 48 kHz, stereo; integrated loudness `-20.8 LUFS`, true peak `-6.4 dBFS`.
- Duration: `124.032 s` — REJECT N01; exceeds the 90–120 second requirement by `4.032 s`.
- File size: `10,856,382 bytes`; `5.252 MB/min` decimal — REJECT X02; limit is `3 MB/min` (`6,201,600 bytes` for this duration), exceeded by `4,654,782 bytes`.
- HyperFrames: lint 0 errors/2 warnings; validate no console errors and 10 text elements pass WCAG AA; inspect 0 layout issues across 9 samples — PASS X03. Warnings identify a 317-line monolith and a 10-element dense track.
- WebVTT exists and reaches `00:02:03.916`; release re-review must still verify spell-check and playback synchronization.

## Release blockers

### P0

1. **00:00 — REJECT (P0, T03/R01):** the title card is composited over the synthesis-funnel frame, producing a visible headline/chart collision at the opening. Required fix: give the opener an independent, non-overlapping state or begin the first evidence scene after the title handoff. Re-review evidence: full-resolution frames at 00:00, 00:01, 00:02, and the opener transition playback.
2. **ALL SCENES — REJECT (P0, T01/T02; P1, T04):** source inspection sets figure captions to `28px`, kickers to `18px`, and the title deck to `42px`, below the published 48 px body/caption and 36 px label floors; the composition uses `Inter/Helvetica/Arial/system-ui` instead of local Newsreader + IBM Plex Mono. The 5-second evidence sheet confirms the captions and provenance text read as thumbnail-scale metadata. Required fix: rebuild text with local approved fonts, body/captions ≥48 px, and labels/axes/data callouts ≥36 px without overlap. Re-review evidence: computed-style audit and 100% 1080p frames for every scene.
3. **FINAL ENCODE — REJECT (P0, X02):** `5.252 MB/min` exceeds the `3 MB/min` web limit. Required fix: produce a versioned web encode at or below 3 MB/min while preserving legibility and motion quality. Re-review evidence: new file path/hash plus `ffprobe` size and duration calculation.

### P1

1. **00:09–01:55 — REJECT (P1, N02/M05):** visuals lead narration by roughly 10–28 seconds. Examples: at 00:09 the “Four Filters” graphic appears while narration is still establishing 736 synthesized materials; at 00:30 the barrier-error chart appears while narration is only introducing the four filters; at 00:48 the cobalt/climate chart appears during the barrier-error explanation; at 01:10 the error-field visual appears during the batteries/climate section; at 01:28 the final partner pipeline begins while narration is just defining Lupine’s error field. Required fix: retime each scene to the approved narration cue starts or revise narration/beat sheet together, then hold each proof state only for its spoken claim. Re-review evidence: cue map, revised VTT/beat sheet, and full 1× playback.
2. **SCENE HANDOFFS / DATA — REJECT (P1, M02/M03/M04/R01):** the source mounts static JPEG cards and animates only each whole `.visual-inner` plus caption; there are no indigo-line transition handoffs and no causal axis → labels → marks → conclusion reveals. The contact sheet shows nearly unchanged states within each scene, including the same partner pipeline from about 01:30 through the final frame. Required fix: animate evidence causally, use the approved transition family with overlapping outgoing/incoming scenes, and eliminate the 36-second static final-card hold. Re-review evidence: timeline diagnostics and muted playback across every entrance/reveal/handoff.
3. **OPEN / OUTRO — REJECT (P1, C03):** no canonical Lupine mark is mounted in the composition. Opening identity is absent and the final two seconds remain the partner-pipeline card rather than the canonical outro mark. Required fix: show the canonical mark within the first two seconds and a 180 px centered mark/wordmark for the final two seconds with prescribed clear space. Re-review evidence: 00:00–00:02 and final-three-second playback plus source-asset path.
4. **BRAND SYSTEM — REJECT (P1, I03/C04):** source defines unapproved `#1e1f24` and `#e8eaf7`, relies on a root-only paper fill, and presents repeated shadowed raster cards rather than a full-bleed child ground with restrained evidence chrome. Required fix: use only the seven locked palette tokens, local approved fonts, and a full-bleed warm-paper child ground per scene; use at most paper + ink + indigo + one semantic accent per frame. Re-review evidence: color-literal/computed-style audit and representative 1080p frames.
5. **ARC / CTA — REJECT (P1, N01/N04):** runtime is 124.032 seconds, outside the 90–120 second gate, and the final card states a partner flow but supplies no explicit article or proof-pack destination. Required fix: cut at least 4.032 seconds while repairing cue timing, and end with a clear CTA naming a valid destination. Re-review evidence: final cue map, outro frame, and `ffprobe` duration.

## Gate summary

- P0 blockers: 3
- P1 blockers: 5
- Observable must-pass failures: present
- Missing-evidence items: caption spell-check/playback sync and final subjective audio QA remain required, but cannot downgrade this REJECT to HOLD.
- Director sign-off: **DENIED**

## Re-review scope

Supply a new, versioned 1080p render with a new SHA-256. Re-check all eight blocker groups, run the complete checklist, then watch the entire film again for regressions. Partial frame replacements or unchanged-render promises are not eligible for approval.

Normative rubric: `../../training/director-sign-off-rubric.md`
