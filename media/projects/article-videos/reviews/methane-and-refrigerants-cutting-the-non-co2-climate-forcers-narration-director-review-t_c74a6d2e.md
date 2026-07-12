# Methane and Refrigerants — narration director review

Task: `t_c74a6d2e`
Review date: 2026-07-12
Source reviewed: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/narration-script.md`
Article checked: `articles/methane-and-refrigerants-cutting-the-non-co2-climate-forcers.md`

## Decision

**REVISIONS REQUESTED — narration/TTS lock is not approved.**

The seven-beat arc is strong, legible, and recognizably Lupine: two apparently separate climate levers converge on a shared model-failure geometry, followed by a measured correction and explicit verification boundary. The opening is immediate, the mechanism sequence is visual, and the final sentence has the right calm urgency.

Approval is blocked by two scientific-scope errors and one unsupported capability bridge. These are wording corrections, not a structural rewrite.

## Required line notes

### P0 — Beat 2, line 27: do not imply that methane mitigation as a whole awaits new materials

Current:

> both targets depend on materials we do not have yet. We need catalysts that convert stranded methane without burning the product...

Why it blocks approval: the source article explicitly says many methane reductions are **not** materials-limited: leak detection and repair, maintenance, landfill capture, and flaring can act now. “Both targets depend” overstates the role of materials and risks suggesting that the 30% methane target depends on catalyst discovery. “Stranded methane” also reads primarily as otherwise-saleable fossil gas; conversion is not automatically avoided methane unless the feed would otherwise be emitted and the product pathway is climate-beneficial.

Required replacement:

> Here is the connection: some of the hardest remaining cuts are materials problems. For methane streams that cannot be captured or transported economically, we need selective conversion at the source. For cooling, we need refrigerants that are efficient, safe, and low-warming—all at once.

Keep the visual card, but change `MATERIAL MISSING` to `MATERIALS BOTTLENECK` so it does not erase deployable non-material mitigation.

### P0 — Beat 5, line 45: limit the low-coordination claim to the properties it actually governs

Current:

> Millions of molecules must be screened for vapor pressure, efficiency, flammability, toxicity, and atmospheric lifetime. The safety-critical steps involve radicals and breaking bonds—the same low-coordination physics that raw models misread.

Why it blocks approval: the sentence construction implies that the entire multi-property refrigerant screen shares the same radical/low-coordination mechanism. It does not. Bulk/intermolecular thermophysics governs vapor pressure and cycle performance; radical and bond-breaking pathways matter specifically to flammability, decomposition, and atmospheric lifetime. Toxicity is also too broad to collapse into this mechanism.

Required replacement:

> Millions of molecules must be screened across thermophysical performance, flammability, toxicity, and atmospheric lifetime. Bulk interactions govern the cooling cycle. But flammability, decomposition, and atmospheric lifetime also depend on radicals and breaking bonds—the difficult configurations raw models can misread.

Visual: retain the full filter stack, but highlight only `FLAMMABILITY` and `LIFETIME` when the radical transition state appears; add `DECOMPOSITION` if room permits.

### P0 — Beat 6, line 51: do not present a general blind correlation as demonstrated application performance

Current:

> Across thirty-six blind model-and-material combinations, corrected predictions reached a correlation of zero point nine zero six, with zero adjustable parameters.

Why it blocks approval: the statistic may be a valid cross-system validation result from Lupine’s formalization, but in this placement it can be heard as validation across methane catalysts and refrigerants. The article does not establish that those 36 combinations are these application candidates. The proof statement also needs to distinguish machine-checked bounds/domain conditions from machine-verified empirical truth.

Required replacement:

> In a separate blind validation across thirty-six model-and-material combinations, the correction reached a correlation of zero point nine zero six with no parameters fitted to those predictions. Machine-checked proofs then identify which correction claims remain inside the measured domain.

On-screen label: `SEPARATE BLIND VALIDATION · n = 36 · r = 0.906`. Replace `0 FITTED PARAMETERS` with the exact source-supported phrasing used by the validation record.

### P1 — Beat 4, line 39: avoid claiming that the present correction has already opened application routes

Current:

> Corrected barriers can expose rare sites that break this trap—and open lower-temperature methanol or cleaner hydrogen routes.

The wording moves from a screening capability to an achieved materials outcome. Keep the prospectus boundary explicit.

Preferred replacement:

> Corrected barriers can help prioritize unusual sites that may escape this trap—for lower-temperature methanol routes or methane pyrolysis to hydrogen and solid carbon.

“Cleaner hydrogen” should not stand alone: methane-pyrolysis climate performance depends on upstream leakage, process energy, and durable handling of the solid carbon.

### P1 — Beat 7, line 57: soften exclusivity

Current:

> They share one hidden error geometry...

Preferred:

> Their hardest screening steps share a hidden error geometry...

This preserves the unifying close without implying that every governing error in both application classes reduces to one coordinate.

## Tone and pacing

- **Voice:** Pass. Calm, precise, ambitious, and evidence-led overall. The opening avoids alarmism, and “Here is the twist” gives the technical bridge conversational energy.
- **Structure:** Pass. Seven beats form a coherent problem → mechanism → correction → verification arc.
- **Density:** Conditional pass after edits. Beat 6 is the densest section; the revised validation sentence should receive at least 13–15 seconds by itself.
- **Timing metadata:** Needs reconciliation before TTS lock. The draft reports 298 words and a 99–108 second estimate at 165–180 WPM, while its beat sheet totals 106 seconds. The existing produced narration associated with this project runs to roughly 133.7 seconds, indicating a materially slower realized delivery. Either preserve a 130–140 second editorial runtime or shorten and regenerate against the stated 90–120 second brief; do not continue to advertise both.
- **Pronunciation:** Pass. Keep H-F-C spelled out and retain spoken forms rather than formulas.

## Approval gate

Approve narration after all five line changes are incorporated and the timing target is made internally consistent. No new beat, claim, statistic, or visual concept is required. Do not regenerate narration from the current draft.