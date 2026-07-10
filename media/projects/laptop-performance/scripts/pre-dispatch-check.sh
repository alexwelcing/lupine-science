#!/usr/bin/env bash
# Abort a dispatch if memory pressure is too high.
MAX_PCT=80
read -r total used _rest <<< "$(free -m | awk '/^Mem:/{print $2,$3}')"
used_pct=$((used * 100 / total))
if [ "$used_pct" -ge "$MAX_PCT" ]; then
  echo "Memory usage ${used_pct}% exceeds ${MAX_PCT}%. Refusing to dispatch more agents." >&2
  echo "Run media/projects/laptop-performance/scripts/kill-runaway.sh to relieve pressure." >&2
  exit 1
fi
echo "Memory usage ${used_pct}% OK."
