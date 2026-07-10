#!/usr/bin/env bash
set -euo pipefail
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/reports"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/baseline-$(date +%Y%m%d-%H%M%S).md"

cat > "$OUT" <<EOF
# System Baseline Snapshot

**Date:** $(date -Iseconds)
**Hostname:** $(hostname)
**Uptime:** $(uptime -p 2>/dev/null || uptime)

## CPU / cores
\`\`\`
$(nproc && lscpu 2>/dev/null | grep -E 'Model name|CPU\(s\)|Thread|Core' || true)
\`\`\`

## Memory
\`\`\`
$(free -h)
\`\`\`

## Swap
\`\`\`
$(swapon --show 2>/dev/null || true)
\`\`\`

## Disk usage
\`\`\`
$(df -h / /home 2>/dev/null | head -20)
\`\`\`

## Top memory consumers
\`\`\`
$(ps -eo pid,ppid,%cpu,%mem,rss,comm --sort=-%mem | head -30)
\`\`\`

## Top CPU consumers
\`\`\`
$(ps -eo pid,ppid,%cpu,%mem,rss,comm --sort=-%cpu | head -30)
\`\`\`

## Process counts
\`\`\`
Total processes: $(ps -e | wc -l)
User processes: $(ps -u "$USER" | wc -l)
Hermes processes: $(pgrep -c hermes 2>/dev/null || echo 0)
Node processes: $(pgrep -c node 2>/dev/null || echo 0)
Python processes: $(pgrep -c python 2>/dev/null || echo 0)
\`\`\`

## vmstat 1 5
\`\`\`
$(vmstat 1 5 2>/dev/null || true)
\`\`\`
EOF

echo "Snapshot written to $OUT"
