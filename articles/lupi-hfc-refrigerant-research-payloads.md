> **Date:** 2026-07-12
> **Deck:** Lupi now streams real hydrofluorocarbon refrigerant trajectories with full research payloads: charges, velocities, forces, thermo, and temperature profiles.
> **Summary:** The latest Lupi viewer release adds R32 and R125 NVT simulations from the Maginn group force fields, a `fix ave/chunk` profile parser, vector glyph views, and billion-atom brick LOD.
> **Status:** Live


# Lupi Gains HFC Refrigerant Research Payloads

The molecules behind the Kigali Amendment are now first-class citizens in [Lupi](https://lupi.live). The latest release adds two hydrofluorocarbon refrigerant trajectories — R32 and R125 — simulated at 273 K with the Maginn group force fields, streamed as `.glimbin` with full per-atom research payloads including charges, velocities, forces, per-atom potential and kinetic energy, thermo tables, and temperature-profile sidecars.

![R32 refrigerant trajectory in Lupi](images/lupi-hfc-refrigerant-research-payloads-hero.jpg)
*R32 liquid at 273 K, rendered in Lupi with the new research-payload pipeline. Source: Maginn group HFC force fields, LAMMPS NVT simulation, 10,000 atoms.*

## What changed

Until recently, Lupi excelled at viewing curated molecular systems: MOFs, proteins, metals, and water clusters. The new release pushes it toward research-grade trajectory analysis. The key additions are:

- **Research payload support.** The LAMMPS `.data` parser now reads the `Masses` section, remaps atom types to elements, parses `Velocities` into per-atom `vx/vy/vz`, preserves molecule ids as `mol`, and respects triclinic tilt and `Atoms # style` hints. Topology files now render with correct CPK chemistry instead of guesswork.
- **`fix ave/chunk` profile parser.** Spatial temperature, density, and velocity profiles produced by LAMMPS replay in sync with the trajectory inside the Telemetry panel. This is the view transport-studies researchers actually need.
- **Vector glyphs.** Per-atom force, velocity, and dipole arrows are now rendered as instanced camera-facing ribbon impostors, with p95 auto-scaling, magnitude colormaps, and URL round-tripping.
- **Curated HFC collection.** R32 (10k atoms) and R125 (8k atoms) NVT liquids are pre-loaded in the gallery with thermo and temperature-profile sidecars. The trajectories are reproducible via `tools/sims/make_hfc_trajectories.py`.
- **One billion atoms in view.** A procedural 630³ FCC copper block — 1,000,188,000 atoms — renders through hierarchical brick LOD as a scale testbed.

## Why refrigerants matter

Hydrofluorocarbons are a strange climate problem. They were introduced to save the ozone layer, but their greenhouse warming potential is hundreds to thousands of times that of CO₂. The Kigali Amendment aims to cut HFC consumption roughly 80% by 2047, which could avoid up to 0.5 °C of warming by 2100.

![Refrigerant 100-year GWP comparison](/result-graphics/gwp-comparison.svg)
*Refrigerant 100-year global warming potential on a mass basis, with CO₂ = 1. Source: IPCC AR6 WGI Table 7.SM.7.*

Finding replacements is hard because the design space is constrained by thermophysical performance, flammability, toxicity, atmospheric lifetime, and lubricant compatibility all at once. Computational screening must predict vapor pressure, latent heat, transport properties, and decomposition pathways across millions of small molecules. Each of those properties depends on under-coordinated environments — radical transition states, surfaces, and phase boundaries — where generic force fields and universal machine-learning potentials systematically soften the energy surface.

Lupi's research payloads make those environments inspectable. You can watch the temperature profile evolve, see the velocity field, and correlate per-atom forces with local structure. The correction-and-verification layer can then be applied to the same trajectories to recover trustworthy barriers and lifetimes.

## Try it

The HFC trajectories are live in the Lupi gallery at [lupi.live](https://lupi.live). The source code and simulation scripts are in the [Lupi repository](https://github.com/alexwelcing/Lupi).
