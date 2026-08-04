#!/usr/bin/env bash
# Cleanup old Hermes kanban workspaces, logs, build artifacts, and runtime
# detritus to prevent disk/memory bloat on the Lupine Science workstation.
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-/home/alex/Dev/lupine/lupine-science}"
KANBAN_ROOT="${HOME}/.hermes/kanban/boards/article-videos"
LOG_DIR="${HOME}/.lupine/monitoring"
RUNTIME_DIR="${HOME}/.hermes/runtime"
RETENTION_DAYS="${CLEANUP_RETENTION_DAYS:-3}"
MAX_LOG_BYTES="${CLEANUP_MAX_LOG_BYTES:-10485760}" # 10 MiB

mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/cleanup-hermes-artifacts.log"

log() {
  echo "$(date -Iseconds) $*" | tee -a "$LOG_FILE"
}

log "starting cleanup retention=${RETENTION_DAYS}d max_log_bytes=${MAX_LOG_BYTES}"

# Remove archived/done task workspaces older than retention days.
if [ -d "$KANBAN_ROOT/workspaces" ]; then
  removed_ws=$(find "$KANBAN_ROOT/workspaces" -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -print | wc -l)
  find "$KANBAN_ROOT/workspaces" -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -exec rm -rf {} + 2>/dev/null || true
  log "removed ${removed_ws} old workspace directories"
fi

# Rotate worker logs if they exceed max size.
if [ -d "$KANBAN_ROOT/logs" ]; then
  oversized=$(find "$KANBAN_ROOT/logs" -type f -size +"${MAX_LOG_BYTES}c" -print)
  for f in $oversized; do
    mv "$f" "${f}.old"
    : > "$f"
    log "rotated $f"
  done
fi

# Clear stale active session leases (older than 1 hour) if any.
if [ -d "$RUNTIME_DIR" ]; then
  stale_sessions=$(find "$RUNTIME_DIR" -maxdepth 1 -type f -mmin +60 -name "*.json" -print | wc -l)
  find "$RUNTIME_DIR" -maxdepth 1 -type f -mmin +60 -name "*.json" -delete 2>/dev/null || true
  log "removed ${stale_sessions} stale runtime files"
fi

# Clean old proof-pack render scratch directory.
if [ -d "$REPO_ROOT/public/.proofpack-render" ]; then
  removed_pp=$(find "$REPO_ROOT/public/.proofpack-render" -mindepth 1 -maxdepth 1 -type d -mtime +1 -print | wc -l)
  find "$REPO_ROOT/public/.proofpack-render" -mindepth 1 -maxdepth 1 -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
  log "removed ${removed_pp} old proof-pack render directories"
fi

# Clean old article video snapshot directories (keep 7 days).
VIDEO_SNAPSHOT_DIR="$REPO_ROOT/media/projects/article-videos/snapshots"
if [ -d "$VIDEO_SNAPSHOT_DIR" ]; then
  removed_snaps=$(find "$VIDEO_SNAPSHOT_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +7 -print | wc -l)
  find "$VIDEO_SNAPSHOT_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
  log "removed ${removed_snaps} old video snapshot directories"
fi

# Remove untracked Hermes worktree directories in the repo root older than 1 day.
# These are created by `hermes kanban workspace` and should never be committed.
if [ -d "$REPO_ROOT/.worktrees" ]; then
  removed_wt=$(find "$REPO_ROOT/.worktrees" -mindepth 1 -maxdepth 1 -type d -mtime +1 -print | wc -l)
  find "$REPO_ROOT/.worktrees" -mindepth 1 -maxdepth 1 -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
  log "removed ${removed_wt} old repo worktree directories"
fi

# Rotate local monitoring logs if they grow too large.
for f in "$LOG_DIR"/*.log; do
  if [ -f "$f" ] && [ "$(stat -c%s "$f" 2>/dev/null || echo 0)" -ge "$MAX_LOG_BYTES" ]; then
    mv "$f" "${f}.old"
    : > "$f"
    log "rotated $f"
  fi
done

# Trim npm/pip caches if disk pressure > 90%.
home_usage=$(df -h "$HOME" | awk 'NR==2 {gsub(/%/,""); print $5}')
if [ "$home_usage" -gt 90 ] 2>/dev/null; then
  log "disk usage ${home_usage}% > 90%; trimming caches"
  npm cache clean --force 2>/dev/null || true
  pip cache purge 2>/dev/null || true
fi

log "cleanup complete"
