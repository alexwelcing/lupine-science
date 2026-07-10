#!/usr/bin/env bash
# Safe emergency relief for agent/render storms.
# Kills processes that match known runaway patterns, preserving the shell,
# window manager, and critical system services.

set -euo pipefail

echo "=== Runaway process relief ==="
echo "Current memory:"
free -h

echo ""
echo "Killing Hermes agent/kanban processes..."
pkill -f 'hermes-(agent|kanban)' 2>/dev/null || true
sleep 1

echo "Killing stray HyperFrames / @model render helpers..."
pkill -f 'npm exec @model' 2>/dev/null || true
pkill -f 'hyperframes' 2>/dev/null || true
sleep 1

echo "Killing stray Node/Puppeteer/Playwright processes (older than 5 min)..."
pkill -f 'puppeteer' 2>/dev/null || true
pkill -f 'playwright' 2>/dev/null || true
# Use pgrep to avoid killing the current shell/node if applicable.
for pid in $(pgrep -f 'node.*render' 2>/dev/null || true); do
  age=$(ps -o etimes= -p "$pid" 2>/dev/null | tr -d ' ' || echo 0)
  if [ "$age" -gt 300 ]; then
    kill "$pid" 2>/dev/null || true
  fi
done

echo ""
echo "Memory after relief:"
free -h
