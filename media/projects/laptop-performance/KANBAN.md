# Laptop Performance Kanban

## Backlog
- [ ] Capture current system baseline (CPU, RAM, disk, swap, GPU)
- [ ] Identify top memory consumers during normal work
- [ ] Identify top memory consumers during agent/render overload
- [ ] Set up continuous memory monitor with threshold alerts
- [ ] Tune kernel swappiness and dirty ratio
- [ ] Configure per-user process/ memory limits (ulimit / systemd)
- [ ] Limit Hermes kanban daemon max concurrent spawns
- [ ] Limit HyperFrames render concurrency
- [ ] Create emergency `kill-runaway.sh` script
- [ ] Document safe recovery runbook
- [ ] Schedule periodic cleanups (logs, caches, old renders)
- [ ] Validate improvements under simulated load

## In Progress
- [ ] Project scaffold and first baseline snapshot

## Done
