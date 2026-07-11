---
title: "[Article title] — Storyboard"
slug: "[article-slug]"
format: 1920x1080
fps: 30
target_duration: "90–120s"
message: "[One-sentence thesis the viewer should remember]"
arc: "Hook → Problem → Mechanism → Evidence → Scale → CTA"
audience: "[Primary audience]"
design_spec: "../frame.md"
script: "[Relative path to approved narration script]"
status: draft
---

# [Article title] — Storyboard

Use this file as the director-approved beat sheet before animation begins. Copy it into the article project as `storyboard.md`, replace every bracketed field, and keep the design reference pointed at the shared [`frame.md`](../frame.md). The narration must match the approved script verbatim; the visual and motion columns translate each line into one proof-first frame world.

This table is the editorial approval format, not HyperFrames Studio’s parsed contact-sheet manifest. If the project uses Studio’s Storyboard view, transpose the approved rows into parser-compatible `## Frame N — Title` sections in `STORYBOARD.md` during animator handoff; keep this beat sheet as the timing and approval source of truth.

## Direction

- **Thesis:** [What the film proves in one sentence.]
- **Rhythm:** [Name the pacing pattern, e.g. hook–hold–build–proof–proof–expand–resolve.]
- **Emotional journey:** [What the viewer should feel at the hook, evidence peak, and close.]
- **Evidence peak:** Beat [#] — [the strongest sourced finding or visual proof].
- **Transition plan:** Use the 12-frame indigo-line wipe for 60–70% of handoffs; reserve no more than two 15-frame field-line reveals for major turns; use the 21-frame paper fade for the outro.
- **Audio notes:** [Narration pace, music bed, intentional pauses, and any essential SFX cues.]

## Beat sheet

| Beat | Narration line | Visual | Animation note | Duration |
|---|---|---|---|---:|
| 01 — Hook | “[Approved narration line.]” | **World:** [2–3 sentences describing the experience, metaphor, and intended feeling—not just a layout.] **BG:** paper grain + [field texture]. **MG:** [single dominant claim]. **FG:** [source label / rule / registration detail]. | [Motion verb] the claim; [motion verb] the evidence. Enter in 2–4 phases. **Transition in:** opening reveal. **Handoff:** 12f indigo-line wipe. | [0:00–0:__ / __s] |
| 02 — Problem | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [texture]. **MG:** [problem made visible]. **FG:** [evidence chrome]. | [Specific choreography with a verb for each element]. **Handoff:** [transition and frames]. | [0:__–0:__ / __s] |
| 03 — Context | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [texture]. **MG:** [context / comparison]. **FG:** [source or axis labels]. | [Specific choreography; reveal information in reading order]. **Handoff:** [transition and frames]. | [0:__–0:__ / __s] |
| 04 — Mechanism | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [field geometry]. **MG:** [real mechanism, vectors, contours, or process]. **FG:** [method label]. | Build causally: frame/axis → labels → marks → highlighted conclusion. **Handoff:** [transition and frames]. | [0:__–0:__ / __s] |
| 05 — Evidence A | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [texture]. **MG:** [sourced chart / finding]. **FG:** [source ID and direct conclusion label]. | [Draw / fill / count / assemble the proof in causal order]. **Handoff:** [transition and frames]. | [0:__–0:__ / __s] |
| 06 — Evidence B | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [texture]. **MG:** [second sourced finding or contrast]. **FG:** [provenance readout]. | [Specific choreography with distinct motion verbs]. **Handoff:** [transition and frames]. | [0:__–0:__ / __s] |
| 07 — Scale | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [texture]. **MG:** [scale comparison / system view]. **FG:** [units, labels, or registration ticks]. | [Expand / populate / connect the scale without decorative motion]. **Handoff:** [transition and frames]. | [0:__–0:__ / __s] |
| 08 — Implication | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [texture]. **MG:** [consequence for the viewer or field]. **FG:** [supporting proof cue]. | [Specific choreography]. **Handoff:** [transition and frames]. | [0:__–0:__ / __s] |
| 09 — Synthesis | “[Approved narration line.]” | **World:** [experience and visual metaphor]. **BG:** [resolved motif from earlier beats]. **MG:** [thesis restated as one claim]. **FG:** [final evidence key]. | Resolve prior elements toward the thesis; do not introduce a new visual language. **Handoff:** 21f paper fade. | [0:__–0:__ / __s] |
| 10 — CTA / Outro | “[Approved narration line.]” | **World:** quiet, conclusive editorial close. **BG:** paper ground. **MG:** concise CTA + canonical Lupine Science mark. **FG:** mono article URL or proof-pack label. | Mark and CTA settle in; hold the canonical mark for the final 2s. No new evidence or motif. | [0:__–0:__ / __s] |

**Planned total:** [__s]  
**Narration total:** [__ words at __ WPM = __s]  
**Transition overlap:** [__s; do not double-count overlaps in the final runtime]

Add, remove, or merge rows to fit the approved script. Preserve sequential beat numbers and the narrative arc; do not pad the film merely to keep ten rows.

## Beat-writing rules

1. **One claim per beat.** The narration line, focal visual, and highlighted conclusion must express the same idea.
2. **Describe a world, then a layout.** Start each visual with the experience and metaphor. Follow with background, midground, and foreground layers.
3. **Make proof visible.** Every number, date, institution, quotation, and scientific assertion must trace to the approved script or source material.
4. **Name the motion.** Use specific verbs—draws, fills, assembles, counts up, locks in, drifts—not “animates in.” Every meaningful element needs a verb.
5. **Reveal causally.** For data: frame/axis → labels → marks → conclusion. Motion explains the argument instead of decorating it.
6. **Plan the handoff.** Outgoing and incoming scenes overlap through the transition; do not add a separate exit animation before the handoff.
7. **Time from speech.** Set each beat to its narration line plus an intentional breath or visual hold. Record both the timeline range and net seconds.

## `frame.md` compliance gate

Before storyboard approval, confirm:

- [ ] Every beat uses the shared paper / ink / indigo system and no unapproved color; at most one semantic accent appears per frame.
- [ ] Newsreader carries claims; IBM Plex Mono carries evidence, labels, axes, and provenance.
- [ ] Critical content stays inside x 96–1824 / y 54–1026 at 1920×1080.
- [ ] Caption space (x 192–1728 / y 828–954) is reserved whenever captions are enabled.
- [ ] Each frame has background texture, one dominant midground claim, and foreground evidence chrome; target 8–10 visible elements without creating repeated UI-card grids.
- [ ] The canonical mark appears in the first 2s and remains visible for the final 2s without alteration.
- [ ] Body and caption text remain at least 48px; labels and axes remain at least 36px.
- [ ] Every beat has an intentional entrance in 2–4 phases and every chart reveals its conclusion causally.
- [ ] Indigo-line wipes account for 60–70% of scene changes; field-line reveals appear no more than twice; no hard cuts, glitch, neon, elastic bounce, or transition roulette.
- [ ] No people, literal flower photography, generic atom/network imagery, stock-looking 3D render, or text baked into generated imagery appears.
- [ ] Beat durations sum to the target runtime after transition overlap is accounted for.

## Approval

- **Script gate:** [ ] Approved by [name] on [date]
- **Storyboard gate:** [ ] Approved by [name] on [date]
- **Animator handoff:** [ ] Assets, citations, narration, and timing references are available
- **Revision notes:** [None / link]
