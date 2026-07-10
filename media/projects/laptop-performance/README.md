# Laptop Performance Management

Systematic diagnostics, monitoring, and optimization for the Lupine Science development laptop to prevent the memory overloads and slowdowns that block large creative pushes.

## Current symptoms

- System becomes unresponsive during heavy agent / render workloads.
- Commands time out (e.g., `ps`, `pgrep`, `pkill`).
- Memory pressure forces manual process kills.

## Goals

1. Establish a baseline of CPU, memory, disk, and swap usage.
2. Set up proactive monitoring with alerts before memory exhaustion.
3. Tune process limits, swappiness, and agent concurrency.
4. Document runbooks for safe recovery and optimal workflow scheduling.

## Deliverables

- `scripts/system-snapshot.sh` — baseline capture.
- `scripts/memory-watch.sh` — live memory monitor with warning thresholds.
- `scripts/kill-runaway.sh` — safe emergency relief for agent/render storms.
- `reports/baseline.md` — initial findings and recommendations.
- `KANBAN.md` — tracking for performance work.
