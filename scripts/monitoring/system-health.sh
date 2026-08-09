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
#
# Exclude the sampler by PID LINEAGE, not by command name. Filtering on
# comm ~ /^(ps|awk|bash|sh)$/ also suppressed every real runaway shell: a CPU-bound
# bash loop has comm "bash", so the guard went silent for exactly the kind of process
# it exists to catch. Only this script's own direct children are the sampler, so match
# on ppid == $$ instead, which no unrelated runaway can satisfy.
#
# Both sides of an earlier merge conflict were real and are combined here: main
# captured the output into high_consumers for the check below, and the branch added
# the sampler exclusion. Dropping the capture would leave the `if` below unable to
# fire at all.
high_consumers=$(ps -eo pid,ppid,pcpu,pmem,rss,comm --sort=-pcpu \
  | awk -v self="$$" 'NR>1 && !($2 == self && $6 ~ /^(ps|awk|sh|bash)$/) \
      && ($3>80.0 || $5>4194304) {print "ALERT high consumer:", $0}')
echo "${high_consumers}"

echo ""

if [[ -n "${high_consumers}" ]]; then
  exit 1
fi
