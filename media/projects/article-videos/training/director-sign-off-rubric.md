# Director sign-off rubric — Lupine Science article videos

Status: normative training rubric  
Published: 2026-07-10  
Applies after: script gate, storyboard gate, and independent frame review  
Sources: `../frame.md`, `../REVIEW_FRAMEWORK.md`, `../ARTICLE_VIDEO_REVIEW_CHECKLIST.md`, `review-training.md`

## Decision law

Director sign-off is a release gate, not a taste score.

- `APPROVE` only when every applicable binary requirement is YES, every representative-frame score is at least 7/10, no P0/P1 is open, all required evidence is present, and the director has watched the exact final 1080p render at 100% with audio.
- `REJECT` when any observable must-pass requirement is NO. One hard failure is sufficient; averages and strengths elsewhere cannot compensate.
- `HOLD` only when no failure is established but required evidence is absent. HOLD is blocked, never provisional approval.
- When both a visible failure and an evidence gap exist, record `REJECT` and list the missing evidence as a re-review requirement.
- A new render is a new review object. Sign-off never transfers by filename, promise, or partial patch.

## Evidence packet required before viewing

The director must record:

1. article/video slug and review-ticket ID;
2. immutable render path or URL, render timestamp/version, byte size, and SHA-256;
3. 5-second interval frames plus frames at every narration/beat cue, with a manifest;
4. approved narration, beat sheet, storyboard, and completed reviewer score sheet;
5. successful `hyperframes lint`, `validate`, and `inspect` output for the reviewed source revision;
6. `ffprobe` proof of 1920×1080, 30 fps, H.264, duration, and web-encode size;
7. synchronized, spell-checked WebVTT;
8. open-issue list and evidence that every prior P0/P1 was re-checked.

Missing items produce HOLD only if the render has no observable hard failure. Otherwise reject.

## Viewing protocol

1. Verify the render identity before playback; never review “latest” without a hash/version.
2. Watch once uninterrupted at 1×, 1920×1080, 100% scale, with normal audio. Judge comprehension, pacing, narration/visual alignment, and overall film craft.
3. Watch again with the 5% title-safe overlay and cue manifest. Pause at the opening, each cue, each transition, each data conclusion, final-minus-two-seconds, and final frame.
4. Watch the data/motion pass muted. Every scene must enter intentionally in 2–4 phases; every chart must reveal cause/evidence/conclusion rather than merely appear.
5. Listen without reading the transcript. Then inspect flagged audio moments and verify captions at first, middle, last, and flagged cues.
6. Compare against the approved beat sheet and reviewer record. Sample the entire render for regressions, not only previously flagged frames.
7. Record explicit `APPROVE`, `REJECT`, or `HOLD` against the exact render hash.

## Non-negotiable gates

### P0 — release blockers

Reject immediately for any of the following:

- unreadable, cropped, overlapping, or unsafe critical text;
- body/captions below 48 px, or labels/axes/data callouts below 36 px at 1080p;
- factual/claim error, unsupported number, corrupted media, missing required content, or narration that cannot be understood;
- wrong release master: not 1920×1080, 30 fps, H.264;
- web encode above 3 MB per minute;
- any HyperFrames lint/validate/inspect error;
- missing or materially unsynchronized captions in the release package.

### P1 — publication blockers

Reject for any of the following:

- static-slide construction, generic science imagery, or a frame without claim-specific evidence structure;
- narration/visual mismatch, wrong beat timing, lingering scene, or unclear Hook → Problem → Mechanism → Evidence → Scale → CTA arc;
- missing 2–4-phase entrances, hard-cut scene swaps, non-causal chart reveals, arbitrary motion, or transition roulette;
- colors/type/ground outside the locked Lupine system without a written director exception;
- missing canonical opening identity in the first two seconds or final mark in the last two seconds;
- unclear CTA or no valid article/proof-pack destination;
- any representative frame or criterion below 7/10;
- total duration outside 90–120 seconds.

## Director judgment tests

Qualitative judgment is allowed only when tied to an observable test:

- **Not a slide:** can the scene’s evidence be understood from spatial structure and motion, not a heading-plus-card/bullet layout?
- **Claim-specific:** can the director name the exact mechanism, comparison, or causal evidence the visual explains?
- **Two-step hierarchy:** within two seconds, is the dominant claim obvious, followed by a clear second focal destination?
- **Motion earns its place:** can every movement be tied to causality, hierarchy, narration, continuity, or controlled ambient depth?
- **Short-film bar:** does the sequence feel composed as one research film rather than a queue of independently designed images?

“Feels off,” “make it pop,” “looks AI,” and “close enough” are invalid sign-off language.

## Severity and wording

Use one row per blocker:

`[TIMESTAMP] — REJECT ([P0|P1], [criterion IDs]): [observable fact]. Required fix: [specific measurable change]. Re-review evidence: [exact frame/playback/log needed].`

For an evidence gap:

`[TIMESTAMP/SCOPE] — HOLD ([criterion IDs]): the supplied evidence cannot prove [requirement]. Supply [specific evidence]. This remains blocked until verified.`

A director may approve a palette exception only in writing, naming the exact color, scene, semantic purpose, and duration. Exceptions cannot waive legibility, safety, factual, technical, caption, or source-integrity gates.

## Sign-off record template

```text
Article/video:
Review ticket:
Decision: APPROVE | REJECT | HOLD
Director:
Review date:
Render path/URL:
Render version/timestamp:
SHA-256:
Duration / format / size-per-minute:
Frame evidence manifest:
Reviewer decision and lowest score:
HyperFrames checks:
P0 count:
P1 count:

Decision rationale:
- [one sentence describing whether the film communicates the intended argument]

Blockers / evidence requests:
- [timestamped criterion-specific rows]

Re-review scope:
- Exact new render/version required.
- Re-check every blocker, then resample the full render for regressions.
```

## Authority and precedent

Published numeric, safety, factual, and technical gates win automatically. The reviewer cannot lower them and the director cannot silently waive them. For unresolved craft questions, the director names the criterion and observable evidence, records the decision as a precedent, and requires measurable re-review proof. Approval means release-ready, not “good direction.”
