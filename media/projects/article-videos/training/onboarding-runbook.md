# Reviewer onboarding runbook

Target: a new reviewer/director must classify the eight-frame reel with 8/8 decision agreement and correct severity before reviewing production work.

## Setup (owner: director)

1. Confirm the profile exists with `hermes profile show <profile>`.
2. Confirm these skill paths exist: `hyperframes-animation`, `hyperframes-core`, `hyperframes-creative`, `hyperframes-keyframes`.
3. Compare each `SKILL.md` SHA-256 with the relevant `/home/alex/.hermes/profiles/<profile>/article-video-skill-manifest.yaml`. Reinstall/synchronize any missing or mismatched skill before training.
4. Give the trainee the source checklist, framework, `frame.md`, `review-training.md`, and reel. Keep `reel/expected-decisions.json` hidden for the blind attempt.

## Blind calibration (owner: trainee)

1. Inspect `reel/contact-sheet.png` at 100%; use the individual 1920×1080 PNGs when a detail is ambiguous.
2. Review frames 01–08 using `blind-review-packet.md`.
3. For each, record PASS/REJECT/HOLD, P0/P1, binary criterion IDs, observable evidence, measurable fix, and re-review proof.
4. Do not infer motion/audio/technical compliance from a still.

## Score and coach (owner: director)

1. Reveal `reel/expected-decisions.json` only after submission.
2. Required graduation score: 8/8 decisions, all five non-pass severities correct, no hard gate averaged away, and no invented evidence.
3. Any miss requires a criterion-specific correction and a second blind attempt after at least one day or with a newly permuted reel.
4. Record disagreements. Numeric, safety, palette, and technical gates are not negotiable. Director resolves qualitative craft by naming the source criterion and observable evidence.

## Shadow review

1. Trainee independently reviews one real draft before seeing the senior reviewer’s notes.
2. Compare issue recall, false passes, severity, and actionability.
3. Graduation requires zero missed P0s and ≥90% agreement on P1s; director decides borderline publication-craft cases.

## Production loop

Director sets script/storyboard bar → reviewer enforces binary gates → animator clears every P0/P1 → reviewer verifies fixes/regressions → director watches final 1080p render with audio and signs off.

Recalibrate quarterly, after any `frame.md`/framework change, after a missed P0, or when reviewer/director disagreement exceeds one criterion in a production review.
