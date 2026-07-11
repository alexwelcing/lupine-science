# Methane and Refrigerants — director final-render review

Decision: **APPROVED FOR WEB**

Review date: 2026-07-10
Review render: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/renders/methane-refrigerants-review-1080p.mp4`
Corrected web render: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/renders/methane-refrigerants-web-720p.mp4`
WebVTT captions: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/renders/methane-refrigerants-web-720p.vtt`
Runtime: 139.840 s

## Blocker-resolution update

Both release blockers identified below are resolved in the corrected 720p web package. The final program audio now measures **−16.0 LUFS integrated** with a **−1.4 dBTP** true peak (ffmpeg `ebur128=peak=true`), and the synchronized 20-cue WebVTT sidecar follows the approved narration timing through 02:13.707. The corrected MP4 is 4.211 MB over 139.840 seconds (**1.807 MB/min**), below the 3 MB/min web ceiling, and completes a full ffmpeg decode with no errors.

## Executive finding

The corrected visual package passes the previously flagged clipping review: the Beat 1 leverage summary, both Beat 2 cards, all four Beat 3 edge-physics cells, and all five Beat 5 filter chips are complete and readable in the fresh 1920×1080 evidence. The H.264/AAC file also decodes without errors and contains no detected black-frame interval.

The corrected 720p web MP4 is approved for release. The published file is byte-identical to the corrected review render, its audio meets the delivery target, its WebVTT sidecar is present and synchronized, and the generated article page links to the MP4 with valid `VideoObject` schema.

## Director recheck — 2026-07-10

- Published render: `public/videos/methane-and-refrigerants-cutting-the-non-co2-climate-forcers.mp4`
- Published captions: `public/videos/methane-and-refrigerants-cutting-the-non-co2-climate-forcers.vtt`
- Media probe: H.264/AAC, 1280×720, 30 fps, 139.840 s; full decode PASS.
- Measured loudness: **−16.04 LUFS integrated**, **−1.39 dBTP** true peak, 2.50 LU LRA (`ffmpeg loudnorm` analysis of the published MP4).
- Delivery size: 4,211,492 bytes over 139.840 s (**1.807 MB/min**), below the 3 MB/min ceiling.
- Caption spot-check: 20 valid, ordered WebVTT cues from 00:00.100 through 02:13.707. Opening, methane-bond section (00:56.027), and closing section (01:59.046) align to the approved narration timing; maximum adjacent-cue overlap is 0.050 s.
- Article integration: generated article includes the narrated-version link, MP4 discovery link, and `VideoObject` with the expected `contentUrl`, `embedUrl`, thumbnail, and upload date. `node --test tests/article-metadata.test.mjs` passes 12/12.
- Timestamped recheck defects: **none**. The deliberate silent end-card hold from approximately 02:13.7–02:19.84 remains acceptable.

## Timestamped notes

| Time | Severity | Finding | Required action |
|---|---:|---|---|
| 00:00–02:13.7 | P1 | Integrated program loudness is **−20.94 LUFS**, roughly 5 LU below the −16 LUFS web target. True peak is −6.27 dBTP, leaving ample headroom. | Loudness-normalize the final mix to approximately −16 LUFS integrated, with true peak no higher than −1.5 dBTP; remux/rerender and verify again. |
| 00:00–02:13.7 | P1 | The MP4 contains only H.264 video and AAC stereo audio. No subtitle stream exists, and no `.vtt` sidecar is present in the article package, although `word-timestamps.json` contains 20 synchronized cues through 02:13.707. | Export the timed transcript as WebVTT and include it with the web package, or embed a standards-compatible subtitle track. |
| 00:18.8–00:19.4 | PASS | Beat 1 leverage summary is complete before the handoff; Beat 2 cards enter without clipped copy or footers. | None. |
| 00:32.8–00:33.5 | PASS | Both Beat 2 cards remain complete through the transition; Beat 3 settles with a clear hierarchy. | None. |
| 00:55.2–00:55.9 | PASS | All four edge-environment cells, including `PHASE BOUNDARIES`, fit before the Beat 4 handoff. | None. |
| 01:34.1–01:34.7 | PASS | All five refrigerant filter chips are visible with padding; runtime-correction scene enters cleanly. | None. |
| 02:13.0–02:19.84 | PASS | Narration ends at approximately 02:13.7 and the end card holds in silence for about 6.1 seconds; this is a deliberate readable outro rather than a dropout. | None. |

## Original 1080p review-master verification

- Container duration: 139.840 s
- Video: H.264, 1920×1080, 30 fps
- Audio: AAC, 48 kHz, stereo
- Full decode: PASS, zero ffmpeg decode errors
- Black-frame detection: none
- Loudness: −20.94 LUFS integrated; −6.27 dBTP; 2.50 LU LRA
- Long silence: 132.956–139.840 s, corresponding to the end-card hold
- Caption/subtitle assets at review time: none found (resolved by the corrected web sidecar listed above)
- Corrected-frame evidence: PASS at 18.8–19.4 s, 32.8–33.5 s, 55.2–55.9 s, and 94.1–94.7 s

## Approval condition — satisfied

The corrected web master and synchronized caption sidecar satisfy both technical approval conditions. No further visual redesign is requested; the package is approved for web release.
