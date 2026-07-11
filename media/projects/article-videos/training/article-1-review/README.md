# Article 1 prototype — annotated reviewer training example

Status: **REJECTED — not publication-ready**  
Reviewer task: `t_6ac37099`  
Article/video: `prototype-01-the-02-percent-synthesis-problem`  
Draft render: `../../prototype-01-the-02-percent-synthesis-problem/renders/prototype-01-the-02-percent-synthesis-problem_2026-07-10_00-57-48.mp4`  
Checklist: `../../ARTICLE_VIDEO_REVIEW_CHECKLIST.md`  
Frame evidence: `raw-frames/manifest.tsv`, `annotated-frames/`, `annotated-contact-sheets/`  

## Decision

All 49 interval/cue frames are rejected. Lowest score: **0/10**; highest score: **2/10** under the hard-gate/minimum scoring rule. The prototype has observable P0 legibility/resolution failures and P1 identity, motion, timing, and narrative failures. Missing director/script/storyboard/audio-listening evidence remains blocked but does not soften the visible rejection.

## Blocking findings

- **P0 · T01/T02/T03/T04:** HTML uses `Inter`, Helvetica, Arial, and system fallbacks instead of Newsreader/IBM Plex Mono; captions are 28 px and kickers 18 px; raster-embedded chart labels are also below the 36 px floor. The failure-economics card has visible central label collisions. Frame 00:00:00.000 is blank.
- **P0 · I01/I02:** all ten source JPGs are 1280×720 and are displayed up to 1680×880, so every scene upscales undersized raster evidence instead of using ≥1920×1080 sources.
- **P1 · M01/M02/M03:** scenes animate only as a whole-card fade/translate/scale plus caption fade. There are no 2–4 phase scene constructions, approved indigo-line transitions, or causal chart/diagram reveals.
- **P1 · C01/C03/C04:** the kicker is positioned at x=80/y=36 outside title-safe; no canonical mark appears in the first or last two seconds; backgrounds are root-only paper fills with no full-bleed child ground/grain treatment.
- **P1 · N01/N02/N04:** duration is 124.032 s (>120 s), the visual schedule diverges from narration after the opening, and there is no explicit article/proof-pack CTA. The last visual is held from 88–124 s while narration covers error field, result, deployment window, and only later partner flow.
- **P0 · X02/X04:** web encode is 10,856,382 bytes over 2.067 minutes ≈ **5.25 MB/min**, above 3 MB/min. `narration.vtt` lacks the required `WEBVTT` header and uses SRT comma timestamps.

## Verified passes / holds

- **X01 PASS:** H.264, 1920×1080, 30 fps, yuv420p.
- **X03 PASS:** `npm run check` completed lint, validate, and inspect with zero errors; lint emitted two maintainability warnings.
- **A03 N/A:** no music bed is present. Narration integrated loudness is -20.8 LUFS with -3.3 dBFS true peak.
- **A01/A02/A04 HOLD:** no human auditory sign-off was supplied; waveform metrics alone cannot prove intelligibility, pops/sibilance, or pacing.
- **G01/G02/G04 HOLD:** script gate, storyboard gate, and director final sign-off are not recorded in the review packet.

## Extraction note

The first direct VTT extraction exposed a minute-timestamp parsing defect in `extract-review-frames.sh` (for example 00:01:15.354 was emitted at 00:00:05.354). `cue-starts-seconds.txt` normalizes the 24 cue starts to absolute seconds; rerunning the required script produced the final 49-frame manifest (25 five-second samples + 24 cue samples).

## Every-frame score sheet

Group scores are 0–10. Overall is the minimum applicable group score; hard failures are never averaged away.

| # | Timestamp | Source | Type | Img | Motion | Comp | Narr | Overall | Failed gates | Annotated evidence |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|---|
| 01 | 00:00:00.000 | interval | 0 | 0 | 0 | 1 | 0 | **0** | T03 · M01 · C03 · N02 | [frame](annotated-frames/frame-00-00-00-000-annotated.jpg) |
| 02 | 00:00:00.100 | cue | 2 | 2 | 2 | 2 | 5 | **2** | T01 · T02 · T04 · I01 · C03 | [frame](annotated-frames/frame-00-00-00-100-annotated.jpg) |
| 03 | 00:00:05.000 | interval | 3 | 3 | 2 | 3 | 7 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 | [frame](annotated-frames/frame-00-00-05-000-annotated.jpg) |
| 04 | 00:00:05.158 | cue | 3 | 3 | 2 | 3 | 7 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 | [frame](annotated-frames/frame-00-00-05-158-annotated.jpg) |
| 05 | 00:00:07.416 | cue | 3 | 3 | 2 | 3 | 7 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 | [frame](annotated-frames/frame-00-00-07-416-annotated.jpg) |
| 06 | 00:00:10.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-10-000-annotated.jpg) |
| 07 | 00:00:14.062 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-14-062-annotated.jpg) |
| 08 | 00:00:15.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-15-000-annotated.jpg) |
| 09 | 00:00:16.624 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-16-624-annotated.jpg) |
| 10 | 00:00:18.499 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-18-499-annotated.jpg) |
| 11 | 00:00:20.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-20-000-annotated.jpg) |
| 12 | 00:00:22.499 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-22-499-annotated.jpg) |
| 13 | 00:00:25.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-25-000-annotated.jpg) |
| 14 | 00:00:27.291 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-27-291-annotated.jpg) |
| 15 | 00:00:30.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-30-000-annotated.jpg) |
| 16 | 00:00:31.124 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-31-124-annotated.jpg) |
| 17 | 00:00:35.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-35-000-annotated.jpg) |
| 18 | 00:00:37.197 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-37-197-annotated.jpg) |
| 19 | 00:00:40.000 | interval | 2 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · T03 · N02 | [frame](annotated-frames/frame-00-00-40-000-annotated.jpg) |
| 20 | 00:00:45.000 | interval | 2 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · T03 · N02 | [frame](annotated-frames/frame-00-00-45-000-annotated.jpg) |
| 21 | 00:00:45.864 | cue | 2 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · T03 · N02 | [frame](annotated-frames/frame-00-00-45-864-annotated.jpg) |
| 22 | 00:00:50.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-50-000-annotated.jpg) |
| 23 | 00:00:54.854 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-54-854-annotated.jpg) |
| 24 | 00:00:55.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-00-55-000-annotated.jpg) |
| 25 | 00:01:00.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-00-000-annotated.jpg) |
| 26 | 00:01:01.437 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-01-437-annotated.jpg) |
| 27 | 00:01:05.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-05-000-annotated.jpg) |
| 28 | 00:01:06.791 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-06-791-annotated.jpg) |
| 29 | 00:01:09.406 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-09-406-annotated.jpg) |
| 30 | 00:01:10.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-10-000-annotated.jpg) |
| 31 | 00:01:15.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-15-000-annotated.jpg) |
| 32 | 00:01:15.354 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-15-354-annotated.jpg) |
| 33 | 00:01:20.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-20-000-annotated.jpg) |
| 34 | 00:01:24.656 | cue | 2 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-24-656-annotated.jpg) |
| 35 | 00:01:25.000 | interval | 2 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-25-000-annotated.jpg) |
| 36 | 00:01:27.874 | cue | 2 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 | [frame](annotated-frames/frame-00-01-27-874-annotated.jpg) |
| 37 | 00:01:30.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-30-000-annotated.jpg) |
| 38 | 00:01:35.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-35-000-annotated.jpg) |
| 39 | 00:01:37.374 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-37-374-annotated.jpg) |
| 40 | 00:01:38.708 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-38-708-annotated.jpg) |
| 41 | 00:01:40.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-40-000-annotated.jpg) |
| 42 | 00:01:45.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-45-000-annotated.jpg) |
| 43 | 00:01:45.312 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-45-312-annotated.jpg) |
| 44 | 00:01:47.583 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-47-583-annotated.jpg) |
| 45 | 00:01:50.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-50-000-annotated.jpg) |
| 46 | 00:01:52.781 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-52-781-annotated.jpg) |
| 47 | 00:01:55.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-55-000-annotated.jpg) |
| 48 | 00:01:55.937 | cue | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-01-55-937-annotated.jpg) |
| 49 | 00:02:00.000 | interval | 3 | 3 | 2 | 3 | 2 | **2** | T01 · T02 · T04 · I01 · M01 · M03 · C03 · C04 · N02 · N04 | [frame](annotated-frames/frame-00-02-00-000-annotated.jpg) |

## Required fix and re-review evidence

1. Rebuild scenes with local Newsreader/IBM Plex Mono, ≥48 px body and ≥36 px labels, no overlaps, and all critical content inside x 96–1824/y 54–1026.
2. Replace every 1280×720 JPG with vector or ≥1920×1080 assets; use a full-bleed warm-paper child ground with controlled grain.
3. Re-time the scene schedule to the actual VTT/narration; stage each scene in 2–4 phases and causally draw charts/diagrams with the approved transition family.
4. Add canonical opening/outro identity, shorten to 90–120 s, and provide an explicit article/proof-pack CTA.
5. Produce valid WebVTT, a ≤3 MB/min web encode, successful HyperFrames logs, and human audio review evidence.
6. Re-extract every five seconds and cue point; re-check every flagged timestamp and all regression samples before director sign-off.

Issue language: `FINAL — REJECT (P0, T01/T02/T04/I01/X02/X04; P1, M01–M03/C03/C04/N01/N02/N04): the prototype contains undersized/wrong-font text, upscaled 720p evidence cards, static whole-card motion, missing identity/CTA, narration mismatch, oversized web encode, and invalid WebVTT. Required fix: clear every gate above and attach a versioned 1080p render, frame set, audio review, and successful tool output.`
