> **Date:** 2026-07-12
> **Deck:** Lupine Rhizo now formally accounts for methane, N₂O, HFCs, and SF₆ inside its Lean 4 climate library.
> **Summary:** The latest `lupine-rhizo` build adds `ClimateForcers.lean` and a validation module that machine-checks non-CO₂ warming potentials, lifetimes, and substitution savings — 289 theorems, zero `sorry`.
> **Status:** Live


# Non-CO₂ Climate Forcers, Now Formalized in Lean

Carbon dioxide gets the headline, but the next decade of climate leverage is increasingly molecular: methane vented from oil fields and landfills, nitrous oxide from agriculture, hydrofluorocarbon refrigerants escaping into the atmosphere, and sulfur hexafluoride from electrical gear. Each has a different lifetime, a different radiative efficiency, and a different replacement chemistry. Getting the accounting right matters for policy, for investment, and for materials discovery.

The latest commit to [`lupine-rhizo`](https://github.com/alexwelcing/lupine-rhizo) adds a `ClimateForcers.lean` module that formalizes the IPCC AR6 global warming potential tables and lifetime bounds for CO₂, CH₄, N₂O, HFC-134a, HFC-410A, and SF₆ inside Lean 4. A companion validation module proves two concrete claims: the emissions avoided by fixing a heat-pump refrigerant leak, and the savings from substituting a low-GWP refrigerant for a high-GWP one.

![Anthropogenic radiative forcing share by agent, 1750–2019](/result-graphics/climate-forcers-share.svg)
*Non-CO₂ agents account for roughly 35% of total anthropogenic radiative forcing. Source: IPCC AR6 WGI Summary for Policymakers, Figure SPM.2.*

## Why formalize climate forcers?

Most climate accounting lives in spreadsheets. That is fine for static reporting, but it is fragile when the same number is reused across downstream models — materials screens, supply-chain tools, policy simulators, and investment memos. A small unit error or an outdated GWP horizon can compound into a wrong ranking.

Formalizing the accounting in a theorem prover means:

- **Every constant is typed and versioned.** GWP₁₀₀ and GWP₂₀ are different objects; you cannot substitute one for the other silently.
- **Bounds are explicit.** Lifetimes are ranges, not point estimates, and the theorems track which bound they depend on.
- **Claims are machine-checked.** Substitution savings are derived from the definitions rather than pasted from a slide.

The module does not replace the IPCC tables; it commits to them. The theorems reference AR6 values as assumptions, so if a future assessment revises a number, the proof breaks in a visible way and can be re-certified.

## What the new module proves

`ClimateForcers.lean` defines the forcer inventory and proves basic cancellation and ordering properties. `Validation.ClimateForcers.lean` then applies the definitions to two realistic scenarios:

1. **Heat-pump leak repair.** A residential heat pump charged with R-410A loses refrigerant over its lifetime. The theorem bounds the CO₂-equivalent warming from the leaked mass and proves that the repair threshold depends on the GWP horizon chosen for the policy.
2. **Low-GWP substitution.** Replacing R-134a with a next-generation fluid that has GWP < 1 avoids a quantified amount of warming per kilogram deployed. The theorem expresses the savings in terms of the forcer definitions and shows the result is monotone in the replaced charge size.

Both proofs are checked by `lake build` with no `sorry` axioms. The full library now stands at 289 theorems across 51 modules, with certificate gates for field-domain, ranking-inversion, and barrier-conservatism claims wired into the policy engine.

## How this connects to materials discovery

The same forcer accounting underpins the methane-to-methanol, refrigerant-substitution, and cement chemistry articles already published on Lupine Science. When a candidate material is screened, its predicted impact must eventually be expressed in the same climate units as the policy target. Formalized forcer accounting closes the loop: a verified correction of a catalyst barrier or a refrigerant property can be propagated into a machine-checked climate claim.

The `lupine-rhizo` repository is open at [github.com/alexwelcing/lupine-rhizo](https://github.com/alexwelcing/lupine-rhizo). The compiled library is browsable at [library.lupine.science](https://library.lupine.science).
