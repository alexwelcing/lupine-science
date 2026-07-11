# High-leverage task instructions — Sol–Fable challenge loop

Use this process for flagship or reusable visual systems, consequential research conclusions, high-cost architecture choices, and any design task where “technically correct” is materially below the publication bar. Routine production, bounded bug fixes, and already-approved pattern reuse do not need the loop.

The copy-ready body is in [`challenge-loop-task-template.md`](challenge-loop-task-template.md). Provider evidence is in [`provider-routing-verification.md`](provider-routing-verification.md). The first completed example is [`data-chart-challenge-loop-pilot.md`](data-chart-challenge-loop-pilot.md).

## Model responsibilities

### Fable — set and protect the bar

Route concept framing to `artdirector`; route independent gate review to `reviewer`. Both use Anthropic `claude-fable-5`.

Fable owns:
- the visual or conceptual standard;
- hierarchy, information ethics, narrative clarity, and editorial restraint;
- requirement refinement and contradiction detection;
- blocker / optional-refinement separation;
- objective approval checks;
- the final `APPROVE` or `REVISE` verdict.

Fable does not implement the solution or accept “looks better” without evidence.

### Sol — propose, implement, and clear the bar

Route design implementation and detailed-spec clearing to `animator`, using OpenAI `gpt-5.6-sol`.

Sol owns:
- rapid alternatives and build-ready proposals;
- exact timing, state, geometry, APIs, failure behavior, and compatibility;
- implementation and deterministic verification;
- blocker-by-blocker revisions;
- preserving every previously accepted constraint.

Sol never self-approves.

### Director — arbitrate, do not blur the roles

The director starts the loop, supplies scope and evidence, and intervenes only for contradiction, deadlock, material scope/cost/risk change, or three Fable revision verdicts. An override must record rationale and residual risk. The director must not silently convert a Fable blocker into an optional refinement.

## Operating sequence

1. Re-run the profile/token smoke checks in `provider-routing-verification.md` when route health is uncertain.
2. Start from `challenge-loop-task-template.md`; include source paths and measurable acceptance evidence.
3. Ask Sol for a proposal. Record it as a numbered round.
4. Ask Fable to critique. Preserve blocker IDs verbatim.
5. Give Sol the complete accepted spec plus the latest critique—not the critique alone.
6. Ask Fable to re-review the entire normative result, including addenda, for closure and regression.
7. Stop only on `VERDICT: APPROVE` or a documented director override.
8. Complete with the mandatory `feedback` block so both roles’ useful discoveries survive the handoff.

## Kanban conventions

- Keep all rounds in one task thread when possible; otherwise link each round with parent dependencies.
- Name rounds `Round N — Sol proposal`, `Round N — Fable critique`, `Round N — Sol revision`, and `Round N — Fable verdict`.
- Do not mark a loop task complete while any blocker is open.
- If separate CLI model calls are launched from inside a running kanban worker, isolate them from `HERMES_KANBAN_*` variables so they do not impersonate or mutate the parent task.
- Record actual model/profile routes and session IDs in the report, but never record credential values.

## Completion-summary requirement

Every challenge-loop completion must include:

```yaml
verdict: APPROVE | DIRECTOR_OVERRIDE
rounds: 0
feedback:
  sol_learned_from_fable: []
  fable_learned_from_sol: []
  retained_for_next_loop: []
open_risks: []
```

A completion without `feedback` is incomplete. Feedback must describe concrete changes in requirements, implementation, tests, or review criteria—not generic praise.
