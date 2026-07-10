#!/usr/bin/env bash
# Live memory monitor with warning thresholds.
# Usage: ./memory-watch.sh [interval_seconds]

INTERVAL="${1:-5}"
WARN_PCT=75
CRIT_PCT=90

while true; do
  read -r total used free shared buff cache available <<< "$(free -m | awk '/^Mem:/{print $2,$3,$4,$5,$6,$7,$8}')"
  used_pct=$((used * 100 / total))
  available_pct=$((available * 100 / total))

  status="OK"
  if [ "$used_pct" -ge "$CRIT_PCT" ]; then
    status="CRIT"
  elif [ "$used_pct" -ge "$WARN_PCT" ]; then
    status="WARN"
  fi

  printf "%s | used: %s/%s MB (%d%%) | available: %s MB (%d%%) | %s\n" \
    "$(date +%H:%M:%S)" "$used" "$total" "$used_pct" "$available" "$available_pct" "$status"

  sleep "$INTERVAL"
done
