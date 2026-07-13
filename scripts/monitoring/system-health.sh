#!/usr/bin/env bash
# System health snapshot for Lupine Science build / agent swarm host.
# Logs CPU, memory, load, swap, and top consumers to a rotating log.

set -euo pipefail

LOG_DIR="${HOME}/.lupine/monitoring"
LOG_FILE="${LOG_DIR}/system-health.log"
MAX_LOG_BYTES=$((5 * 1024 * 1024))  # 5 MiB
KEEP_BACKUPS=3

mkdir -p "${LOG_DIR}"

rotate_if_needed() {
  if [[ -f "${LOG_FILE}" ]] && [[ $(stat -c%s "${LOG_FILE}" 2>/dev/null || echo 0) -ge ${MAX_LOG_BYTES} ]]; then
    for i in $(seq $((KEEP_BACKUPS - 1)) -1 1); do
      if [[ -f "${LOG_FILE}.${i}" ]]; then
        mv "${LOG_FILE}.${i}" "${LOG_FILE}.$((i + 1))"
      fi
    done
    mv "${LOG_FILE}" "${LOG_FILE}.1"
  fi
}

rotate_if_needed

exec >> "${LOG_FILE}"
exec 2>&1

echo "=== $(date -Iseconds) ==="
echo "--- load ---"
uptime
echo "--- memory ---"
free -h
echo "--- disk ---"
df -h /home /tmp 2>/dev/null | head -5

echo "--- hermes processes ---"
ps aux | awk '/hermes -p/ && !/awk/ {print $2, $3, $4, $5, $6, $11, $12, $13}' | head -20

echo "--- top cpu ---"
ps -eo pid,pcpu,pmem,comm --sort=-pcpu | head -10

echo "--- top memory ---"
ps -eo pid,pcpu,pmem,comm --sort=-pmem | head -10

echo "--- zombie/high cpu guard ---"
# Flag any single process >80% CPU or >4 GiB RSS for more than a glance.
# Exclude the sampler processes (ps, awk, bash, sh) — this pipeline is itself a burst
# of short-lived CPU, so without the filter the guard periodically alerts on its own
# `ps`/`awk` and trains the reader to ignore it.
#
# Both sides of this conflict were real: main captured the output into
# high_consumers for the exit-status check below, and this branch added the sampler
# exclusion. Taking the branch alone would have left high_consumers unset, so the
# `if [[ -n "${high_consumers}" ]]` below could never fire and the alert would be
# silently dead. Combined deliberately.
high_consumers=$(ps -eo pid,pcpu,pmem,rss,comm --sort=-pcpu \
  | awk 'NR>1 && $5 !~ /^(ps|awk|bash|sh)$/ && ($2>80.0 || $4>4194304) {print "ALERT high consumer:", $0}')
echo "${high_consumers}"

echo ""

if [[ -n "${high_consumers}" ]]; then
  exit 1
fi
