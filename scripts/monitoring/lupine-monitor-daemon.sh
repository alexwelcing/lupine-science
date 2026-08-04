#!/usr/bin/env bash
# Lupine Science self-healing monitor daemon.
# Runs the swarm guard, system health, and laptop diagnostics checks in the
# background, silently.  It attempts to resolve issues (kill runaway workers,
# log high consumers) and only surfaces an alert if a problem persists after
# self-heal attempts.
#
# Intended to be started once and left running:
#   bash scripts/monitoring/lupine-monitor-daemon.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${HOME}/.lupine/monitoring"
DAEMON_LOG="${LOG_DIR}/lupine-monitor-daemon.log"
ALERT_LOG="${LOG_DIR}/lupine-monitor-alerts.log"
MAX_LOG_BYTES=$((2 * 1024 * 1024))  # 2 MiB

mkdir -p "${LOG_DIR}"

log() {
  echo "$(date -Iseconds) $*" >> "${DAEMON_LOG}"
}

alert() {
  echo "$(date -Iseconds) ALERT: $*" >> "${ALERT_LOG}"
}

rotate_log() {
  local file="$1"
  if [[ -f "${file}" ]] && [[ $(stat -c%s "${file}" 2>/dev/null || echo 0) -ge ${MAX_LOG_BYTES} ]]; then
    mv "${file}" "${file}.old"
  fi
}

consecutive_failures=0
MAX_CONSECUTIVE_FAILURES=3
loop_count=0

log "daemon started (pid=$$)"

while true; do
  rotate_log "${DAEMON_LOG}"
  rotate_log "${ALERT_LOG}"

  failure=0

  # Swarm guard: self-heals and exits non-zero if the breach persists.
  if ! "${SCRIPT_DIR}/hermes-swarm-guard.sh" >> "${DAEMON_LOG}" 2>&1; then
    alert "swarm guard reports unresolved runaway workers or resource pressure"
    failure=1
  fi

  # System health: logs high consumers and exits non-zero if any are found.
  if (( loop_count % 5 == 0 )); then
    if ! "${SCRIPT_DIR}/system-health.sh" >> "${DAEMON_LOG}" 2>&1; then
      alert "system health reports high CPU/memory consumers"
      failure=1
    fi
  fi

  # Laptop diagnostics: silent unless alerts; exits non-zero on severe alerts.
  if (( loop_count % 5 == 2 )); then
    if ! SILENT=1 "${SCRIPT_DIR}/laptop-diagnostics.mjs" >> "${DAEMON_LOG}" 2>&1; then
      alert "laptop diagnostics reports severe resource alerts"
      failure=1
    fi
  fi

  if [[ "${failure}" -eq 1 ]]; then
    consecutive_failures=$((consecutive_failures + 1))
    log "check failure ${consecutive_failures}/${MAX_CONSECUTIVE_FAILURES}"
  else
    consecutive_failures=0
  fi

  if [[ "${consecutive_failures}" -ge "${MAX_CONSECUTIVE_FAILURES}" ]]; then
    alert "monitoring daemon giving up after ${MAX_CONSECUTIVE_FAILURES} consecutive failures; human intervention required"
    log "daemon exiting after repeated failures"
    echo "Lupine monitor daemon: repeated failures detected. Check ${ALERT_LOG} and ${DAEMON_LOG}" >&2
    exit 1
  fi

  loop_count=$((loop_count + 1))
  sleep 60
done
