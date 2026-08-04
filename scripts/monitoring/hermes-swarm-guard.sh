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

hermes_count=$(pgrep -fc 'hermes -p' || true)
load_1m=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
mem_used_pct=$(free | awk '/Mem:/ {printf "%.1f", $3/$2 * 100.0}')

alert() {
  echo "$(date -Iseconds) ALERT: $*" >> "${ALERT_FILE}"
}

# Backpressure: while this flag exists, the hermes dispatcher finishes its
# reclaim/promotion tick but spawns no new workers (see kanban_db.py
# _dispatch_once_locked). Prefer pausing over killing.
PAUSE_FLAG="${HOME}/.hermes/dispatch-paused"

pause_dispatch() {
  if [[ ! -f "${PAUSE_FLAG}" ]]; then
    echo "$(date -Iseconds) paused by swarm-guard: $*" > "${PAUSE_FLAG}"
    alert "wrote dispatch pause flag (${PAUSE_FLAG}): $*"
  fi
}

kill_oldest_hermes() {
  local n="${1:-1}"
  # Sort by start time (etimes) ascending, kill the oldest hermes -p workers.
  # Exclude the gateway itself if it is running (hermes gateway run).
  # ps 'comm' for these workers is 'hermes'; $4 is the python interpreter path,
  # $5 is the hermes binary path, and $6 is '-p'. The kanban task id is the
  # last argument (e.g., t_xxxxxxxx).
  # sort -rn: largest etimes first = oldest workers. (A plain `sort -n` here
  # killed the NEWEST workers for weeks — freshly dispatched tasks died first.)
  mapfile -t victim_lines < <(ps -eo pid,etimes,comm,args | awk '$3 ~ /hermes/ && $6 == "-p" {print $2, $1, $NF}' | sort -rn | head -n "${n}")
  local pids=()
  local task_ids=()
  for line in "${victim_lines[@]}"; do
    read -r _ pid task_id <<< "${line}"
    if [[ -n "${pid}" ]]; then
      pids+=("${pid}")
      [[ "${task_id}" == t_* ]] && task_ids+=("${task_id}")
    fi
  done

  for pid in "${pids[@]}"; do
    if kill -TERM "${pid}" 2>/dev/null; then
      alert "sent SIGTERM to oldest hermes worker pid=${pid}"
    fi
  done
  sleep 3
  for pid in "${pids[@]}"; do
    if kill -0 "${pid}" 2>/dev/null; then
      kill -9 "${pid}" 2>/dev/null || true
      alert "sent SIGKILL to stubborn hermes worker pid=${pid}"
    fi
  done

  # Reclaim the killed tasks so the dispatcher knows they are free.
  for task_id in "${task_ids[@]}"; do
    if hermes kanban reclaim "${task_id}" 2>/dev/null; then
      alert "reclaimed kanban task ${task_id} after worker termination"
    fi
  done
}

# Check total hermes workers
if (( hermes_count > MAX_HERMES_PROCS )); then
  excess=$((hermes_count - MAX_HERMES_PROCS))
  pause_dispatch "hermes worker count ${hermes_count} > ${MAX_HERMES_PROCS}"
  alert "hermes worker count ${hermes_count} exceeds ${MAX_HERMES_PROCS}; culling ${excess} oldest"
  kill_oldest_hermes "${excess}"
fi

# Check load average
if awk "BEGIN {exit !(${load_1m} > ${MAX_LOAD_1M})}"; then
  alert "1-min load ${load_1m} exceeds ${MAX_LOAD_1M}; pausing dispatch"
  pause_dispatch "1-min load ${load_1m} > ${MAX_LOAD_1M}"
fi

# Check memory pressure
if awk "BEGIN {exit !(${mem_used_pct} > ${MAX_USED_MEM_PERCENT})}"; then
  alert "memory used ${mem_used_pct}% exceeds ${MAX_USED_MEM_PERCENT}%; pausing dispatch"
  pause_dispatch "memory used ${mem_used_pct}% > ${MAX_USED_MEM_PERCENT}%"
fi

# Find any single hermes process consuming too much CPU. A single-sample spike
# is normal for the hourly timers (health-watchdog, wiki refresh, standup), so
# only alert when the SAME pid was hot in both the previous minute's sample
# (persisted in HOT_STATE_FILE) and the current one. Processes younger than
# MIN_PROC_AGE_SECONDS are skipped entirely: a process that just started
# legitimately burns CPU.
HOT_STATE_FILE="${LOG_DIR}/.hot-hermes-state"
MIN_PROC_AGE_SECONDS=90

prev_hot_pids=""
if [[ -f "${HOT_STATE_FILE}" ]]; then
  prev_hot_pids=$(cat "${HOT_STATE_FILE}" 2>/dev/null || true)
fi

current_hot_pids=""
cpu_high_pids=""
while read -r pid pcpu etimes comm; do
  if [[ -z "${pid}" ]]; then continue; fi
  if awk "BEGIN {exit !(${pcpu} > ${MAX_SINGLE_CPU})}"; then
    if (( etimes < MIN_PROC_AGE_SECONDS )); then continue; fi
    current_hot_pids="${current_hot_pids} ${pid}"
    if grep -qw "${pid}" <<< "${prev_hot_pids}"; then
      cpu_high_pids="${cpu_high_pids} ${pid}(${pcpu}%)"
    fi
  fi
done < <(ps -eo pid,pcpu,etimes,comm --sort=-pcpu | awk '$4 ~ /hermes/ {print $1, $2, $3, $4}')

# Persist this minute's hot set for the next run (overwrite, even if empty).
printf '%s\n' "${current_hot_pids# }" > "${HOT_STATE_FILE}"

if [[ -n "${cpu_high_pids}" ]]; then
  alert "hot hermes processes:${cpu_high_pids}"
fi

# Cron ticker freshness: the hermes gateway's in-process ticker (profile
# "director") writes a float epoch to ticker_last_success after every clean
# 60s tick (hermes-agent cron/jobs.py record_ticker_heartbeat). Alert if the
# marker is missing or older than 2 hours.
TICKER_SUCCESS_FILE="${HOME}/.hermes/profiles/director/cron/ticker_last_success"
TICKER_MAX_AGE_SECONDS=7200
if [[ -f "${TICKER_SUCCESS_FILE}" ]]; then
  ticker_epoch=$(cut -d. -f1 "${TICKER_SUCCESS_FILE}" 2>/dev/null || echo 0)
  [[ "${ticker_epoch}" =~ ^[0-9]+$ ]] || ticker_epoch=0
  ticker_age=$(( $(date +%s) - ticker_epoch ))
  if (( ticker_age > TICKER_MAX_AGE_SECONDS )); then
    alert "hermes cron ticker stale: last successful tick ${ticker_age}s ago (threshold ${TICKER_MAX_AGE_SECONDS}s; file ${TICKER_SUCCESS_FILE})"
  fi
else
  alert "hermes cron ticker success marker missing: ${TICKER_SUCCESS_FILE}"
fi

# After any self-heal attempt, re-check whether the breach persists.
hermes_count_after=$(pgrep -fc 'hermes -p' || true)
load_1m_after=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
mem_used_pct_after=$(free | awk '/Mem:/ {printf "%.1f", $3/$2 * 100.0}')

persisted=0
if (( hermes_count_after > MAX_HERMES_PROCS )); then
  alert "hermes worker count still ${hermes_count_after} after culling"
  persisted=1
fi
if awk "BEGIN {exit !(${load_1m_after} > ${MAX_LOAD_1M})}"; then
  alert "1-min load still ${load_1m_after} after culling"
  persisted=1
fi
if awk "BEGIN {exit !(${mem_used_pct_after} > ${MAX_USED_MEM_PERCENT})}"; then
  alert "memory used still ${mem_used_pct_after}% after culling"
  persisted=1
fi

if [[ "${persisted}" -eq 1 ]]; then
  exit 1
fi

# All thresholds clear: lift the dispatch pause so the next tick can spawn.
if [[ -f "${PAUSE_FLAG}" ]]; then
  rm -f "${PAUSE_FLAG}"
  alert "cleared dispatch pause flag (${PAUSE_FLAG}); metrics back under thresholds"
fi

exit 0
