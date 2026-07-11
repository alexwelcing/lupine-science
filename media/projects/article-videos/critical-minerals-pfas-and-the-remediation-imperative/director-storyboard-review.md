# Director Storyboard Review — Critical Minerals, PFAS, and the Remediation Imperative

**Decision:** REVISIONS REQUESTED

**Reviewed:** `storyboard.md`

## Executive note

The board’s narrative architecture, Lupine brand alignment, and motion ambition are strong. The recover-versus-destroy symmetry is clear, the persistent indigo selectivity trace gives the seven worlds a coherent visual grammar, and the proposed native scientific instruments avoid stock climate imagery and generic card layouts. Approval is withheld for two production-lock inconsistencies and the unresolved narration claim already identified at script review.

## What passes

- **Narrative clarity:** The split–converge opening, mineral/PFAS opposition, 15–60% evidence shock, correction reveal, and paired industrial-metabolism close form a legible causal arc.
- **Brand alignment:** Paper/ink/indigo, Newsreader plus IBM Plex Mono, evidence-led labels, sparse semantic accents, and restrained urgency are distinctly Lupine.
- **Motion ambition:** The pore-to-axis-to-bond-to-error-curve transformations are causal rather than decorative. The recurring selectivity trace is a strong continuity device, and the correction reveal earns its one exceptional transition.
- **Scientific guardrails:** The board correctly qualifies the 4 ng/L visual to PFOA and PFOS individually, bounds the 15–60% error to local under-coordinated environments, and avoids treating machine checks as experimental proof.
- **Timing coverage:** All 27 mastered lines are mapped to contiguous cue ranges covering the 112.392-second audio master.

## Required revisions

### P0 — Replace the unqualified mastered PFOA/PFOS line

The audio master and `narration.txt` still say:

> First, capture molecules at just four nanograms per liter.

The on-screen label `PFOA / PFOS · EPA MCL · 4 ng/L EACH` is accurate, but it cannot fully repair a broader spoken claim. This conflicts with the approved evidence-before-claim standard and the required revision in `director-script-review.md`.

Replace and remaster the line as:

> First, capture PFOA and PFOS down to the EPA limit: four nanograms per liter each.

Then regenerate word timestamps and reconform the affected World 03 cue boundaries. Do not lock animation to the current master.

### P1 — Reconcile the transition count and overlap math

The board states that four of six world handoffs use the 12-frame indigo-line wipe (66.7%), but the rhythm map and beat sheet assign that wipe to five handoffs: 01→02, 02→03, 03→04, 05→06, and 06→07. That is five of six (83.3%).

The stated 2.8-second transition overlap also assumes only four wipes:

- four × 0.4s = 1.6s
- one × 0.5s = 0.5s
- one × 0.7s = 0.7s
- total = 2.8s

With the five wipes currently specified, the total is 3.2 seconds. Either remove one wipe and define its replacement, or update the doctrine, compliance gate, and overlap accounting consistently. Preserve the intended transition restraint; five near-identical wipes across six handoffs is less varied than the stated plan.

### P1 — Make the outro fade and two-second brand hold internally possible

Beat 07.6 starts a 21-frame (0.7s) paper fade at 1:50.180, yet says the full outro settles by 1:50.392 and remains untouched through 1:52.392. The fade would still be running until 1:50.880, so the card cannot be both settled and untouched at 1:50.392.

Choose one frame-accurate implementation:

- start the 21-frame fade no later than 1:49.692 so the full card is settled by 1:50.392 and receives the promised final two-second hold; or
- keep the fade at 1:50.180 and shorten the clean hold to approximately 1.512 seconds.

The first option is preferred because the final title and CTA need the full two seconds.

## Approval gate

Approve after:

1. the PFOA/PFOS narration is corrected and remastered;
2. World 03 timings are reconformed to the new master;
3. transition count and overlap math agree everywhere; and
4. the outro has a frame-valid 21-frame fade plus two-second clean brand hold.

No structural rewrite is required. Keep the seven-world arc, persistent selectivity trace, local-physics evidence language, and recover/destroy close.
