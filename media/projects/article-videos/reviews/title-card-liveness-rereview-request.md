# Title-card liveness harness re-review request

## Scope

This change touches only the title-card QA motion-regression harness. The approved title-card HTML, copy limits, provenance, palette, typography, layout, and ambient wash animation are unchanged.

Each QA fixture now owns a root-discoverable `motion-harness/index.motion.json`. `scripts/prepare-motion-harness.mjs` builds a standalone inspection project from the canonical `compositions/title-card.html`, applies that fixture's existing variable values, and copies the canonical assets. The generated harness adds a non-rendering 1×1 descendant probe inside the real `.title-card-wash` because HyperFrames 0.7.48 liveness signatures sample a scope's descendants rather than the scope element itself. The probe inherits only the real wash transform, so freezing the wash freezes the assertion without changing pixels.

`npm run check:fixtures` now runs lint, validate, and `inspect --strict` for both the mounted visual fixture and its root motion harness.

## Positive-control evidence

Command:

`cd /home/alex/Dev/lupine/lupine-science/media/projects/article-videos && npm run check`

Result: exit 0.

Full transcript: `reviews/evidence/title-card-liveness/npm-run-check.txt`.

For all four fixtures (`combined-worst-case`, `default`, `long-deck`, `long-title`):

- mounted fixture lint: 0 errors, 0 warnings;
- mounted fixture validate: no console errors, 34 text elements pass WCAG AA;
- mounted fixture `inspect --at 1.8,5.8 --strict`: 0 layout issues;
- root motion-harness lint: 0 errors, 0 warnings;
- root motion-harness validate: no console errors, 34 text elements pass WCAG AA;
- root motion-harness `inspect --strict`: 0 layout issues across 9 samples, with `motion spec (10 assertion(s))` reported, including the canonical `.title-card-wash` `keepsMoving` assertion.

The project-wide check retained the unrelated pre-existing `data-chart.html` file-size warnings and produced no new warning or error.

## Negative-control evidence

Temporary control applied only to `fixtures/default/motion-harness/index.motion.json`:

- changed `withinSelector` from `.title-card-wash` to `.definitely-missing`;
- ran `npx --yes hyperframes@0.7.48 inspect fixtures/default/motion-harness --strict`;
- result: exit 1 with `motion_selector_missing .definitely-missing` and one error;
- restored the real sidecar;
- reran the same strict inspect command; result: exit 0 with 0 layout issues across 9 samples.

Saved transcripts:

- failing control: `reviews/evidence/title-card-liveness/negative-control.txt` (`EXIT_CODE=1`);
- restored assertion: `reviews/evidence/title-card-liveness/positive-control.txt` (`EXIT_CODE=0`).

## Re-review request

Please re-review acceptance criterion 4 using `npm run check` from the article-video project root. The fixture command now executes the real wash liveness gate, and the missing-selector negative control proves the assertion is active.
