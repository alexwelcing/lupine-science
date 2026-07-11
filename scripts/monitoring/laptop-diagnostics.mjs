#!/usr/bin/env node
// Laptop performance diagnostics for the Lupine Science build/agent workstation.
// Generates a structured report with alerts and actionable recommendations.
// Safe to run at any time: it only reads system state and prints suggestions.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LOG_DIR = path.join(os.homedir(), '.lupine', 'monitoring');
const REPORT_FILE = path.join(LOG_DIR, 'laptop-diagnostics-latest.json');

function sh(cmd, args = []) {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', timeout: 5000 }).trim();
  } catch {
    return '';
  }
}

function parseNumber(text) {
  const n = parseFloat(text);
  return Number.isFinite(n) ? n : 0;
}

function bytesToGiB(bytes) {
  return bytes / (1024 ** 3);
}

function swapUsedPct(total, used) {
  return total ? (used / total) * 100 : 0;
}

const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memUsedPct = (usedMem / totalMem) * 100;

const loadAvg = os.loadavg();
const cpuCount = os.cpus().length;

const swapInfo = sh('free', ['-b']).split('\n').find((l) => l.startsWith('Swap:'));
let swapTotal = 0;
let swapUsed = 0;
if (swapInfo) {
  const parts = swapInfo.split(/\s+/).filter(Boolean);
  swapTotal = parseNumber(parts[1]);
  swapUsed = parseNumber(parts[2]);
}

const diskInfo = sh('df', ['-B1', '/home']).split('\n')[1];
let diskTotal = 0;
let diskUsed = 0;
if (diskInfo) {
  const parts = diskInfo.split(/\s+/).filter(Boolean);
  diskTotal = parseNumber(parts[1]);
  diskUsed = parseNumber(parts[2]);
}
const diskUsedPct = diskTotal ? (diskUsed / diskTotal) * 100 : 0;

const hermesPids = sh('pgrep', ['-f', 'hermes -p']).split('\n').filter(Boolean);
const nodePids = sh('pgrep', ['-f', 'node']).split('\n').filter(Boolean);

const topMem = sh('ps', ['-eo', 'pid,ppid,pcpu,pmem,rss,comm,args', '--sort=-%mem'])
  .split('\n')
  .slice(1, 11)
  .map((line) => {
    const parts = line.trim().split(/\s+/);
    return {
      pid: parts[0],
      ppid: parts[1],
      cpu: parts[2],
      mem: parts[3],
      rssBytes: parseNumber(parts[4]) * 1024,
      command: parts[5],
      args: parts.slice(6).join(' ').slice(0, 120),
    };
  });

const topCpu = sh('ps', ['-eo', 'pid,ppid,pcpu,pmem,rss,comm,args', '--sort=-%cpu'])
  .split('\n')
  .slice(1, 11)
  .map((line) => {
    const parts = line.trim().split(/\s+/);
    return {
      pid: parts[0],
      ppid: parts[1],
      cpu: parts[2],
      mem: parts[3],
      rssBytes: parseNumber(parts[4]) * 1024,
      command: parts[5],
      args: parts.slice(6).join(' ').slice(0, 120),
    };
  });

const zombieCount = parseNumber(sh('bash', ['-c', 'ps aux | awk \'{if ($8 ~ /^Z/) print $0}\' | wc -l']));

const alerts = [];
const recommendations = [];

if (memUsedPct > 85) {
  alerts.push({ severity: 'high', metric: 'memory', value: `${memUsedPct.toFixed(1)}%`, message: 'Memory usage is critically high' });
  recommendations.push('Cull oldest Hermes workers and pause new dispatches until memory drops below 75%.');
}
if (memUsedPct > 70) {
  alerts.push({ severity: 'medium', metric: 'memory', value: `${memUsedPct.toFixed(1)}%`, message: 'Memory usage is elevated' });
  recommendations.push('Review top memory consumers; consider closing unused browser tabs or IDE windows.');
}

if (loadAvg[0] > cpuCount * 1.5) {
  alerts.push({ severity: 'high', metric: 'load', value: loadAvg[0].toFixed(2), message: `1-min load is high relative to ${cpuCount} CPUs` });
  recommendations.push('Reduce concurrent Hermes workers; throttle dispatch to 2-3 at a time.');
}

if (swapUsedPct(swapTotal, swapUsed) > 50) {
  alerts.push({ severity: 'high', metric: 'swap', value: `${swapUsedPct(swapTotal, swapUsed).toFixed(1)}%`, message: 'More than half of swap is in use' });
  recommendations.push('Swap pressure detected: reduce working set or add RAM; avoid spawning new render jobs.');
}

if (diskUsedPct > 90) {
  alerts.push({ severity: 'high', metric: 'disk', value: `${diskUsedPct.toFixed(1)}%`, message: 'Root/home disk is nearly full' });
  recommendations.push('Free disk space: prune old proof-pack renders, article video snapshots, and npm caches.');
}
if (diskUsedPct > 75) {
  alerts.push({ severity: 'medium', metric: 'disk', value: `${diskUsedPct.toFixed(1)}%`, message: 'Disk usage is elevated' });
  recommendations.push('Audit large directories in ~/.cache, node_modules, and media/projects/article-videos/snapshots.');
}

if (hermesPids.length > 8) {
  alerts.push({ severity: 'medium', metric: 'hermes', value: hermesPids.length, message: 'Many Hermes workers are running' });
  recommendations.push('Run hermes-swarm-guard.sh or manually cull oldest workers to keep count ≤ 8.');
}

if (zombieCount > 0) {
  alerts.push({ severity: 'low', metric: 'zombies', value: zombieCount, message: 'Zombie processes detected' });
  recommendations.push('Zombies are usually harmless but may indicate a parent process crash; investigate if count grows.');
}

// Recommendations based on totals, not alerts
if (bytesToGiB(totalMem) < 16) {
  recommendations.push('Consider upgrading to at least 32 GiB RAM for comfortable video rendering + agent swarms.');
}
if (cpuCount < 8) {
  recommendations.push('CPU count is modest; keep concurrent render/agent tasks low to maintain UI responsiveness.');
}

// Track Hermes gateway explicitly
const gatewayPids = sh('pgrep', ['-f', 'hermes.*gateway run']).split('\n').filter(Boolean);
const gatewayRss = gatewayPids.length
  ? gatewayPids.reduce((sum, pid) => {
      const rss = parseNumber(sh('bash', ['-c', `ps -p ${pid} -o rss= 2>/dev/null || echo 0`]));
      return sum + rss * 1024;
    }, 0)
  : 0;

// GPU memory if nvidia-smi is available
const gpuInfo = sh('nvidia-smi', ['--query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu', '--format=csv,noheader,nounits'])
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [name, total, used, free, temp] = line.split(',').map((s) => s.trim());
    return {
      name,
      totalMiB: parseNumber(total),
      usedMiB: parseNumber(used),
      freeMiB: parseNumber(free),
      temperatureC: parseNumber(temp),
    };
  });

if (gatewayPids.length && bytesToGiB(gatewayRss) > 0.5) {
  recommendations.push(`Hermes gateway is using ${bytesToGiB(gatewayRss).toFixed(2)} GiB; restart if it grows beyond 1 GiB.`);
}

if (gpuInfo.length) {
  const hotGpu = gpuInfo.find((g) => g.temperatureC > 85);
  if (hotGpu) {
    alerts.push({ severity: 'medium', metric: 'gpu-temp', value: `${hotGpu.temperatureC}°C`, message: 'GPU temperature is elevated' });
    recommendations.push('Pause GPU-intensive renders until GPU temperature drops below 80°C.');
  }
}

const report = {
  timestamp: new Date().toISOString(),
  hostname: os.hostname(),
  uptimeSeconds: os.uptime(),
  cpu: {
    count: cpuCount,
    model: os.cpus()[0]?.model ?? 'unknown',
    loadAverage1m: loadAvg[0],
    loadAverage5m: loadAvg[1],
    loadAverage15m: loadAvg[2],
  },
  memory: {
    totalGiB: bytesToGiB(totalMem),
    usedGiB: bytesToGiB(usedMem),
    freeGiB: bytesToGiB(freeMem),
    usedPercent: memUsedPct,
  },
  swap: {
    totalGiB: bytesToGiB(swapTotal),
    usedGiB: bytesToGiB(swapUsed),
    usedPercent: swapUsedPct(swapTotal, swapUsed),
  },
  disk: {
    path: '/home',
    totalGiB: bytesToGiB(diskTotal),
    usedGiB: bytesToGiB(diskUsed),
    usedPercent: diskUsedPct,
  },
  processes: {
    hermesWorkers: hermesPids.length,
    hermesGateway: {
      pidCount: gatewayPids.length,
      rssGiB: bytesToGiB(gatewayRss),
    },
    nodeProcesses: nodePids.length,
    zombieCount,
    topMemory: topMem,
    topCpu: topCpu,
  },
  gpu: gpuInfo,
  alerts,
  recommendations: [...new Set(recommendations)],
};

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

console.log(`=== Laptop diagnostics at ${report.timestamp} ===`);
console.log(`CPU: ${cpuCount} cores · load ${loadAvg[0].toFixed(2)} / ${loadAvg[1].toFixed(2)} / ${loadAvg[2].toFixed(2)}`);
console.log(`Memory: ${report.memory.usedGiB.toFixed(2)} / ${report.memory.totalGiB.toFixed(2)} GiB (${memUsedPct.toFixed(1)}%)`);
console.log(`Swap: ${report.swap.usedGiB.toFixed(2)} / ${report.swap.totalGiB.toFixed(2)} GiB (${swapUsedPct(swapTotal, swapUsed).toFixed(1)}%)`);
console.log(`Disk /home: ${report.disk.usedGiB.toFixed(2)} / ${report.disk.totalGiB.toFixed(2)} GiB (${diskUsedPct.toFixed(1)}%)`);
console.log(`Hermes workers: ${hermesPids.length} · gateway: ${gatewayPids.length} proc(s) ${bytesToGiB(gatewayRss).toFixed(2)} GiB · Node processes: ${nodePids.length} · Zombies: ${zombieCount}`);
if (gpuInfo.length) {
  for (const g of gpuInfo) {
    console.log(`GPU ${g.name}: ${g.usedMiB}/${g.totalMiB} MiB · ${g.temperatureC}°C`);
  }
}
console.log(`Report written: ${REPORT_FILE}`);

if (alerts.length) {
  console.log('\nAlerts:');
  for (const alert of alerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.metric}: ${alert.value} — ${alert.message}`);
  }
}

if (report.recommendations.length) {
  console.log('\nRecommendations:');
  for (const rec of report.recommendations) {
    console.log(`  • ${rec}`);
  }
}
