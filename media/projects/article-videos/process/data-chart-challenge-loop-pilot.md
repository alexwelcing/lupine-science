# Pilot report — data-chart “Editorial Lock”

Date: 2026-07-10  
Pilot artifact: `components/data-chart/`  
Goal: make one highlighted observation feel editorially decisive in a six-second evidence beat without decoration, misleading encoding, broken seek safety, or caption-zone intrusion.

## Loop record

| Round | Role / route | Result |
|---:|---|---|
| 1 | Sol, `animator` / `gpt-5.6-sol` | Proposed a contrast-transfer “Editorial Lock” after chart reveal. |
| 2 | Fable, `artdirector` / `claude-fable-5` | `REVISE`: six blockers covering reading time, causal overlap, color semantics, line mode, legacy failure behavior, and label determinism. |
| 3 | Sol, `animator` | Rebuilt the spec as a 180-frame deterministic contract with an 800ms unbiased hold, per-mode behavior, no-focus fallback, ordered placement algorithm, and blocker matrix. |
| 4 | Fable, `reviewer` | `REVISE`: implementation was close, but leader endpoints, wrap search, palette-token failure, and frame-range wording remained ambiguous. |
| 5–7 | Sol ↔ Fable | A first addendum regressed two accepted constraints (it allowed ellipsis and treated palette tokens as arbitrary strings). Fable caught both; Sol replaced the addendum with exact non-truncating and locked-token rules. |
| 8 | Fable, `reviewer` | `APPROVE`: B1–B6 and R1–R4 all passed; 180-frame total confirmed. Session `20260710_135750_23f0af`. |

Final gate: `VERDICT: APPROVE`

## Before / after quality notes

| Dimension | Initial Sol proposal | Fable-approved specification |
|---|---|---|
| Unbiased reading | 300ms, too short to read the whole chart | Frames 78–101: 24 frames / 800ms at full opacity with no focus treatment |
| Motion causality | Label began while de-emphasis was still moving | Transfer completes at frame 119; frames 120–121 stagger; label begins at 122 |
| Color semantics | Amber behavior included a conditional “may,” creating ambiguity | Exact-token rules: non-data fill may become `focusAmber`; encoded fill is preserved with a ring; amber category uses `focusOnAmber` |
| Line mode | “Non-selected marks recede” did not define a continuous path | Whole line path uniformly moves to 42%; selected marker and ring remain full opacity; no partial-path encoding |
| Failure / compatibility | Selected-key failure and legacy behavior were unstated | Resolution is unique key → valid index → no-focus; never throw; omitted props must be pixel-equal to legacy frames |
| Label placement | “Least occupied quadrant” and “shortest route” were assertions, not algorithms | Analytic union occupancy, ordered NE/NW/SE/SW ties, two ordered routes, inflated-boundary start, no-leader terminal fallback |
| Exact value integrity | First addendum accidentally allowed ellipsis | Try one-line sizes 32→22, then one two-line wrap sizes 32→22; no fit means no-focus; never truncate or alter evidence |
| Testability | Broad snapshots and seek checks | Decidable fixtures for every blocker, cold-seek equality, palette contrast, legacy pixels, worst-case crossing, and frame math |

## Approved design contract

- Exactly 180 local frames at 30fps; frame 180 is outside the composition.
- Every state is a pure function of local frame, immutable data, and locked config.
- Reveal source/claim, axes, labels, and marks; hold the unbiased chart for 800ms; transfer contrast; stagger; reveal exact value; reveal conclusion; hold.
- Bars and points de-emphasize non-selected marks to 42%. Line mode de-emphasizes the complete path and non-selected markers uniformly.
- Preserve chart geometry throughout. No pulse, glow, scaling, camera motion, partial-line opacity, or invented data encoding.
- Unresolved selection, unfit exact text, absent focus token, or contrast failure produces the no-focus render without throwing.
- Plot content does not extend below y=720; conclusion stays y=738–822; captions begin y=828.

## What worked

1. **Fable turned taste into tests.** “Needs more reading time” became an 800ms interval; “deterministic placement” became a fully ordered geometric algorithm.
2. **Stable blocker IDs prevented drift.** B1–B6 and R1–R4 made regressions and closure visible.
3. **Independent final review mattered.** The `reviewer` route caught regressions introduced by the first addendum, even after the main concept was sound.
4. **Sol cleared precise requirements quickly.** Once critique stated objective checks, Sol converted them into frame ranges, fallbacks, and fixtures.
5. **The stop rule was unambiguous.** Only Fable emitted the final `APPROVE`; Sol consistently described its work as proposed or revised.

## What to improve next time

- Give every revision call the accepted base spec as well as the latest critique. A critique-only prompt allowed Sol’s first addendum to forget “never truncate exact evidence” and misunderstand named palette tokens.
- Keep child model calls isolated from the parent worker environment. In a kanban worker, unset `HERMES_KANBAN_*` for standalone `hermes -p ... chat` calls; otherwise the child may behave as the active board worker, post comments, or spend its turn on lifecycle duties.
- Use `python3`, not `python`, on this host when a wrapper is needed.
- Set a default director escalation after three Fable `REVISE` verdicts. This pilot needed three revision verdicts and then approved; further cycling should require intervention.

## Feedback handoff

```yaml
feedback:
  sol_learned_from_fable:
    - "A readable full-chart hold needs a measurable duration, not a gesture."
    - "Annotation cannot begin before the causal contrast transfer is complete."
    - "Determinism includes layout tie-breaks, failure paths, and exact token semantics."
    - "Never truncate or alter exact evidence; fail to no-focus instead."
  fable_learned_from_sol:
    - "Frame-indexed state can express the editorial sequence and make cold seeks testable."
    - "A whole-path line treatment avoids implying unsupported accumulation."
    - "No-focus is a practical, backward-compatible terminal state for invalid focus inputs."
  retained_for_next_loop:
    - "Carry the full accepted spec into every revision round."
    - "Require blocker IDs, objective checks, and an explicit final verdict."
```
