#!/usr/bin/env node
// Laptop performance diagnostics for the Lupine Science build/agent workstation.
// Generates a structured report with alerts, trend analysis, and actionable
// recommendations. Safe to run at any time: it only reads system state.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LOG_DIR = path.join(os.homedir(), '.lupine', 'monitoring');
const REPORT_FILE = path.join(LOG_DIR, 'laptop-diagnostics-latest.json');
const HISTORY_FILE = path.join(LOG_DIR, 'laptop-diagnostics-history.jsonl');
const MAX_HISTORY = 48;

function sh(cmd, args = [], { suppressStderr = true } = {}) {
  try {
    const options = { encoding: 'utf8', timeout: 5000 };
    if (suppressStderr) options.stdio = ['pipe', 'pipe', 'ignore'];
    return execFileSync(cmd, args, options).trim();
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

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function trend(values) {
  if (values.length < 2) return 0;
  const first = values.slice(0, Math.ceil(values.length / 2));
  const second = values.slice(Math.floor(values.length / 2));
  return mean(second) - mean(first);
}

function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    return fs.readFileSync(HISTORY_FILE, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

function appendHistory(report) {
  const summary = {
    timestamp: report.timestamp,
    memUsedPercent: report.memory.usedPercent,
    swapUsedPercent: report.swap.usedPercent,
    loadAverage1m: report.cpu.loadAverage1m,
    diskUsedPercent: report.disk.usedPercent,
    hermesWorkers: report.processes.hermesWorkers,
    nodeProcesses: report.processes.nodeProcesses,
    zombieCount: report.processes.zombieCount,
    gatewayRssGiB: report.processes.hermesGateway.rssGiB,
  };
  const line = JSON.stringify(summary);
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(HISTORY_FILE, `${line}\n`);
  const lines = fs.readFileSync(HISTORY_FILE, 'utf8').split('\n').filter(Boolean);
  if (lines.length > MAX_HISTORY) {
    fs.writeFileSync(HISTORY_FILE, lines.slice(-MAX_HISTORY).join('\n') + '\n');
  }
  return loadHistory();
}

function checkOomKills() {
  // Recent OOM-killer invocations from the kernel ring buffer.
  const dmesg = sh('dmesg', ['--ctime', '--level=err,warn']);
  const oomLines = dmesg
    .split('\n')
    .filter((line) => /out of memory|oom-kill|killed process/i.test(line))
    .slice(-5);
  if (!oomLines.length) return { count: 0, recent: [] };
  return {
    count: oomLines.length,
    recent: oomLines.map((line) => line.slice(0, 200)),
  };
}

function findProcessPids(pattern) {
  return sh('pgrep', ['-f', pattern])
    .split('\n')
    .filter(Boolean);
}

function processRss(pids) {
  if (!pids.length) return 0;
  return pids.reduce((sum, pid) => {
    const rss = parseNumber(sh('bash', ['-c', `ps -p ${pid} -o rss= 2>/dev/null || echo 0`]));
    return sum + rss * 1024;
  }, 0);
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

const hermesPids = findProcessPids('hermes -p');
const nodePids = findProcessPids('node');
const chromePids = findProcessPids('chrome|chromium|headless');
const playwrightPids = findProcessPids('playwright|crBrowserMain');

function parseTop(cmdSortKey) {
  return sh('ps', ['-eo', 'pid,ppid,pcpu,pmem,rss,comm,args', `--sort=-%${cmdSortKey}`])
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
}

const topMem = parseTop('mem');
const topCpu = parseTop('cpu');

const zombieCount = parseNumber(sh('bash', ['-c', 'ps aux | awk \'{if ($8 ~ /^Z/) print $0}\' | wc -l']));

const alerts = [];
const recommendations = [];

if (memUsedPct > 85) {
  alerts.push({ severity: 'high', metric: 'memory', value: `${memUsedPct.toFixed(1)}%`, message: 'Memory usage is critically high' });
  recommendations.push('Cull oldest Hermes workers and pause new dispatches until memory drops below 75%. Run `bash scripts/monitoring/hermes-swarm-guard.sh`.');
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
  recommendations.push('Free disk space: prune old proof-pack renders, article video snapshots, and npm caches. Run `bash scripts/monitoring/cleanup-hermes-artifacts.sh`.');
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

const gatewayPids = findProcessPids('hermes.*gateway run');
const gatewayRss = processRss(gatewayPids);

const chromeRss = processRss(chromePids);
const playwrightRss = processRss(playwrightPids);

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

if (bytesToGiB(chromeRss) + bytesToGiB(playwrightRss) > 1.5) {
  alerts.push({ severity: 'medium', metric: 'browser', value: `${(bytesToGiB(chromeRss) + bytesToGiB(playwrightRss)).toFixed(2)} GiB`, message: 'Headless browser processes are consuming significant memory' });
  recommendations.push('Headless Chrome/Playwright processes are using >1.5 GiB. Kill stale browser shells before starting new renders.');
}

if (gpuInfo.length) {
  const hotGpu = gpuInfo.find((g) => g.temperatureC > 85);
  if (hotGpu) {
    alerts.push({ severity: 'medium', metric: 'gpu-temp', value: `${hotGpu.temperatureC}°C`, message: 'GPU temperature is elevated' });
    recommendations.push('Pause GPU-intensive renders until GPU temperature drops below 80°C.');
  }
}

// OOM killer awareness
const oomKills = checkOomKills();
if (oomKills.count > 0) {
  alerts.push({ severity: 'high', metric: 'oom-killer', value: `${oomKills.count} recent`, message: 'Kernel OOM killer has killed processes recently' });
  recommendations.push('Recent OOM kills detected. Lower concurrent worker limits and avoid spawning large render jobs until memory headroom improves.');
}

// Recommendations based on totals, not alerts
if (bytesToGiB(totalMem) < 16) {
  recommendations.push('Consider upgrading to at least 32 GiB RAM for comfortable video rendering + agent swarms.');
}
if (cpuCount < 8) {
  recommendations.push('CPU count is modest; keep concurrent render/agent tasks low to maintain UI responsiveness.');
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
    chromeHeadless: {
      pidCount: chromePids.length,
      rssGiB: bytesToGiB(chromeRss),
    },
    playwright: {
      pidCount: playwrightPids.length,
      rssGiB: bytesToGiB(playwrightRss),
    },
    zombieCount,
    topMemory: topMem,
    topCpu: topCpu,
  },
  gpu: gpuInfo,
  oomKills,
  alerts,
  recommendations: [...new Set(recommendations)],
};

// Trend analysis after report is built
const history = appendHistory(report);
if (history.length >= 6) {
  const memTrend = trend(history.map((h) => h.memUsedPercent));
  const loadTrend = trend(history.map((h) => h.loadAverage1m));
  const swapTrend = trend(history.map((h) => h.swapUsedPercent));

  report.trends = {
    samples: history.length,
    memory: { direction: memTrend > 2 ? 'rising' : memTrend < -2 ? 'falling' : 'stable', delta: memTrend },
    load: { direction: loadTrend > cpuCount * 0.3 ? 'rising' : loadTrend < -0.5 ? 'falling' : 'stable', delta: loadTrend },
    swap: { direction: swapTrend > 5 ? 'rising' : swapTrend < -2 ? 'falling' : 'stable', delta: swapTrend },
  };

  if (report.trends.memory.direction === 'rising' && memUsedPct > 60) {
    report.alerts.push({ severity: 'medium', metric: 'memory-trend', value: `+${memTrend.toFixed(1)}%`, message: 'Memory usage is trending upward over the last samples' });
    report.recommendations.push('Memory is climbing; review recently started Hermes tasks or browser/render processes and pause non-urgent work.');
  }
  if (report.trends.load.direction === 'rising' && loadAvg[0] > cpuCount * 0.8) {
    report.alerts.push({ severity: 'medium', metric: 'load-trend', value: `+${loadTrend.toFixed(2)}`, message: 'System load is trending upward' });
    report.recommendations.push('Load is climbing; throttle new dispatches and let the queue drain.');
  }
  report.recommendations = [...new Set(report.recommendations)];
}

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

console.log(`=== Laptop diagnostics at ${report.timestamp} ===`);
console.log(`CPU: ${cpuCount} cores · load ${loadAvg[0].toFixed(2)} / ${loadAvg[1].toFixed(2)} / ${loadAvg[2].toFixed(2)}`);
console.log(`Memory: ${report.memory.usedGiB.toFixed(2)} / ${report.memory.totalGiB.toFixed(2)} GiB (${memUsedPct.toFixed(1)}%)`);
console.log(`Swap: ${report.swap.usedGiB.toFixed(2)} / ${report.swap.totalGiB.toFixed(2)} GiB (${swapUsedPct(swapTotal, swapUsed).toFixed(1)}%)`);
console.log(`Disk /home: ${report.disk.usedGiB.toFixed(2)} / ${report.disk.totalGiB.toFixed(2)} GiB (${diskUsedPct.toFixed(1)}%)`);
console.log(`Hermes workers: ${hermesPids.length} · gateway: ${gatewayPids.length} proc(s) ${bytesToGiB(gatewayRss).toFixed(2)} GiB · Node: ${nodePids.length} · Chrome/headless: ${chromePids.length} · Playwright: ${playwrightPids.length} · Zombies: ${zombieCount}`);
if (gpuInfo.length) {
  for (const g of gpuInfo) {
    console.log(`GPU ${g.name}: ${g.usedMiB}/${g.totalMiB} MiB · ${g.temperatureC}°C`);
  }
}
if (oomKills.count > 0) {
  console.log(`OOM killer: ${oomKills.count} recent invocation(s)`);
}
if (report.trends) {
  console.log(`Trends (n=${report.trends.samples}): memory ${report.trends.memory.direction} (${report.trends.memory.delta > 0 ? '+' : ''}${report.trends.memory.delta.toFixed(1)}%) · load ${report.trends.load.direction} (${report.trends.load.delta > 0 ? '+' : ''}${report.trends.load.delta.toFixed(2)}) · swap ${report.trends.swap.direction} (${report.trends.swap.delta > 0 ? '+' : ''}${report.trends.swap.delta.toFixed(1)}%)`);
}
console.log(`Report written: ${REPORT_FILE}`);

if (report.alerts.length) {
  console.log('\nAlerts:');
  for (const alert of report.alerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.metric}: ${alert.value} — ${alert.message}`);
  }
}

if (report.recommendations.length) {
  console.log('\nRecommendations:');
  for (const rec of report.recommendations) {
    console.log(`  • ${rec}`);
  }
}
