#!/usr/bin/env bash
# Hermes swarm guard: prevent runaway agent workers from melting the laptop.
# Designed to be run from cron every minute. This version actively throttles
# the swarm when thresholds are breached.

set -euo pipefail

LOG_DIR="${HOME}/.lupine/monitoring"
ALERT_FILE="${LOG_DIR}/swarm-guard-alerts.log"
mkdir -p "${LOG_DIR}"

# Thresholds
MAX_LOAD_1M=12.0
MAX_HERMES_PROCS=8
MAX_SINGLE_CPU=80.0
MAX_USED_MEM_PERCENT=85

hermes_count=$(pgrep -c 'hermes -p' || true)
load_1m=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
mem_used_pct=$(free | awk '/Mem:/ {printf "%.1f", $3/$2 * 100.0}')

alert() {
  echo "$(date -Iseconds) ALERT: $*" >> "${ALERT_FILE}"
}

kill_oldest_hermes() {
  local n="${1:-1}"
  # Sort by start time (etimes) ascending, kill the oldest hermes -p workers.
  # Exclude the gateway itself if it is running (hermes gateway run).
  mapfile -t victims < <(ps -eo pid,etimes,comm,args | awk '$4 ~ /hermes/ && $5 == "-p" {print $2, $1}' | sort -n | head -n "${n}" | awk '{print $2}')
  for pid in "${victims[@]}"; do
    if [[ -n "${pid}" ]] && kill -TERM "${pid}" 2>/dev/null; then
      alert "sent SIGTERM to oldest hermes worker pid=${pid}"
    fi
  done
  sleep 3
  for pid in "${victims[@]}"; do
    if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
      kill -9 "${pid}" 2>/dev/null || true
      alert "sent SIGKILL to stubborn hermes worker pid=${pid}"
    fi
  done
}

# Check total hermes workers
if (( hermes_count > MAX_HERMES_PROCS )); then
  local excess=$((hermes_count - MAX_HERMES_PROCS))
  alert "hermes worker count ${hermes_count} exceeds ${MAX_HERMES_PROCS}; culling ${excess} oldest"
  kill_oldest_hermes "${excess}"
fi

# Check load average
if awk "BEGIN {exit !(${load_1m} > ${MAX_LOAD_1M})}"; then
  alert "1-min load ${load_1m} exceeds ${MAX_LOAD_1M}; culling 4 oldest hermes workers"
  kill_oldest_hermes 4
fi

# Check memory pressure
if awk "BEGIN {exit !(${mem_used_pct} > ${MAX_USED_MEM_PERCENT})}"; then
  alert "memory used ${mem_used_pct}% exceeds ${MAX_USED_MEM_PERCENT}%; culling 4 oldest hermes workers"
  kill_oldest_hermes 4
fi

# Find any single hermes process consuming too much CPU for >1 minute would be
# handled by the load/memory guards above; log it here for diagnostics.
cpu_high_pids=""
while read -r pid pcpu comm; do
  if [[ -z "${pid}" ]]; then continue; fi
  if awk "BEGIN {exit !(${pcpu} > ${MAX_SINGLE_CPU})}"; then
    cpu_high_pids="${cpu_high_pids} ${pid}(${pcpu}%)"
  fi
done < <(ps -eo pid,pcpu,comm --sort=-pcpu | awk '$3 ~ /hermes/ {print $1, $2, $3}')

if [[ -n "${cpu_high_pids}" ]]; then
  alert "hot hermes processes:${cpu_high_pids}"
fi

# Always write a one-line status for dashboards
{
  echo -n "$(date -Iseconds) STATUS load=${load_1m} mem=${mem_used_pct}% hermes=${hermes_count}"
  [[ -n "${cpu_high_pids}" ]] && echo -n " hot_pids=${cpu_high_pids}"
  echo
} >> "${ALERT_FILE}"
