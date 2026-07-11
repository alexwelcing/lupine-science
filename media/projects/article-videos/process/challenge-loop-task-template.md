# Sol–Fable challenge-loop task template

Copy the body below into a consequential design or research task. Replace every bracketed field.

---

## Challenge loop: [task name]

### Outcome

[One concrete result to produce. Name the artifact, audience, and decision it must support.]

### Why this merits a challenge loop

[Explain the consequence: reusable visual system, flagship scene, scientific claim, publication-level design choice, irreversible architecture, or high-cost research conclusion.]

### Evidence and constraints

- Source artifacts: [paths / URLs / data]
- Brand or editorial rules: [paths]
- Technical contract: [runtime, dimensions, API, deterministic behavior]
- Non-goals: [explicit exclusions]
- Acceptance evidence: [tests, frames, citations, comparison method]

### Roles and routes

- **Sol / proposer-clearer:** `animator` profile, OpenAI `gpt-5.6-sol`.
- **Fable / bar-setter:** `artdirector` profile, Anthropic `claude-fable-5`.
- **Fable / gate reviewer:** `reviewer` profile, Anthropic `claude-fable-5`.
- **Director / arbiter:** resolves scope, contradiction, deadlock, or risk; records any override.

### Required loop

1. **High bar.** Fable/artdirector may refine this brief into explicit quality principles and approval checks. It must not prescribe implementation where several approaches could clear the bar.
2. **Proposal.** Sol must propose a build-ready solution grounded in the supplied artifacts. It must state assumptions, exact behavior, implementation plan, failure modes, and objective verification. End with `STATUS: PROPOSED`; never self-approve.
3. **Critique.** Fable/reviewer must separate blockers from optional refinements. Every blocker must name the failed principle, the precise revision, and an objective approval check. End with exactly `VERDICT: REVISE` or `VERDICT: APPROVE`.
4. **Revision.** On `REVISE`, Sol must map every blocker ID to a changed requirement or implementation, preserve previously accepted constraints, add/adjust tests, and return the full revised spec or an explicitly scoped normative addendum. End with `STATUS: REVISED`; never self-approve.
5. **Re-review.** Fable must re-check all open blockers and detect regressions against previously accepted constraints. It may approve only when no blocker remains.
6. **Stop.** Finish on Fable `APPROVE`, or escalate to the director after [default: 3] Fable revision verdicts, a contradictory requirement, material scope change, cost/risk increase, or inability to produce objective evidence.

All rounds stay in the same task thread or are linked by parent dependencies. Label comments `Round N — Sol proposal`, `Round N — Fable critique`, and so on. Do not paraphrase away blocker IDs between rounds.

### Approval criteria

- [ ] [criterion with measurable threshold]
- [ ] [criterion with artifact/test]
- [ ] [failure/legacy behavior]
- [ ] [brand/editorial compliance]
- [ ] [director-specific constraint]

### Completion summary (required fields)

```yaml
summary: "[artifact and outcome]"
verdict: "APPROVE | DIRECTOR_OVERRIDE"
rounds: [number]
artifacts:
  - "[absolute or repo-relative path]"
tests:
  - "[command/check]: [result]"
feedback:
  sol_learned_from_fable:
    - "[critique that changed the solution]"
  fable_learned_from_sol:
    - "[implementation fact or constraint that sharpened the bar]"
  retained_for_next_loop:
    - "[reusable rule, test, or pitfall]"
open_risks:
  - "[none, or explicit residual risk accepted by director]"
```

The `feedback` field is mandatory even when one list is `none`; it is the durable handoff that lets each role carry the other model’s useful critique into the next related task.

### Director intervention record (only when used)

- Trigger: [deadlock / contradiction / scope / cost / risk]
- Decision: [what changed]
- Rationale: [why]
- Accepted residual risk: [explicit]
- Resume point or final disposition: [round / stop]

---
