#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(new URL("..", import.meta.url).pathname);
const outPath = join(root, "accent-audit.json");
const samples = [12, 15, 24, 28, 37, 46, 50, 56, 61, 64, 68, 76, 79, 82, 86, 90, 96];
const accents = {
  rose: "rgb(199, 91, 91)",
  amber: "rgb(232, 168, 56)",
  sage: "rgb(90, 138, 110)",
};

const mime = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".wav": "audio/wav" };
const server = createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/+/, "") || "index.html";
    const path = resolve(root, relative);
    if (!path.startsWith(root)) throw new Error("path outside project");
    res.setHeader("Content-Type", mime[extname(path)] || "application/octet-stream");
    res.end(await readFile(path));
  } catch (error) {
    res.statusCode = 404;
    res.end(String(error));
  }
});
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const pagePort = server.address().port;
const debugPort = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(join(tmpdir(), "hf-accent-audit-"));
const chrome = spawn("google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
  `http://127.0.0.1:${pagePort}/index.html`,
], { stdio: "ignore" });

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
let target;
for (let attempt = 0; attempt < 100; attempt += 1) {
  try {
    const list = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
    target = list.find((item) => item.type === "page" && item.url.includes(String(pagePort)));
    if (target) break;
  } catch {}
  await sleep(100);
}
if (!target) throw new Error("Chrome DevTools target did not become ready");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", rejectOpen, { once: true });
});
let id = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve: resolveCall, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolveCall(message.result);
});
const call = (method, params = {}) => new Promise((resolveCall, reject) => {
  const callId = ++id;
  pending.set(callId, { resolve: resolveCall, reject });
  socket.send(JSON.stringify({ id: callId, method, params }));
});
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

try {
  await call("Runtime.enable");
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate("Boolean(window.__timelines?.['synthesis-problem'])")) break;
    await sleep(100);
  }
  const frames = [];
  for (const time of samples) {
    const result = await evaluate(`(() => {
      window.__timelines['synthesis-problem'].seek(${time}, false);
      const tokens = ${JSON.stringify(accents)};
      const found = Object.fromEntries(Object.keys(tokens).map((name) => [name, []]));
      const sceneElement = [...document.querySelectorAll('.clip')].find((clip) => {
        const start = Number(clip.dataset.start); const duration = Number(clip.dataset.duration);
        return ${time} >= start && ${time} < start + duration;
      });
      const properties = ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','fill','stroke'];
      const inspect = (element, pseudo = null) => {
        const style = getComputedStyle(element, pseudo);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.01) return;
        if (!pseudo) {
          const rect = element.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0 || rect.right <= 0 || rect.bottom <= 0 || rect.left >= 1920 || rect.top >= 1080) return;
        }
        for (const property of properties) {
          const value = style[property];
          for (const [name, token] of Object.entries(tokens)) {
            if (value === token || value.startsWith(token.replace(')', ', '))) {
              found[name].push({ selector: element.id ? '#' + element.id : element.className?.baseVal || element.className || element.tagName, pseudo, property, value });
            }
          }
        }
      };
      for (const element of sceneElement?.querySelectorAll('*') || []) {
        inspect(element);
        inspect(element, '::before');
        inspect(element, '::after');
      }
      const active = Object.entries(found).filter(([, hits]) => hits.length).map(([name]) => name);
      const scene = sceneElement?.id || null;
      return { time: ${time}, scene, active, counts: Object.fromEntries(Object.entries(found).map(([name, hits]) => [name, hits.length])), hits: found };
    })()`);
    frames.push(result);
  }
  const violations = frames.filter((frame) => frame.active.length > 1);
  const report = {
    policy: "paper + ink + indigo + at most one semantic accent per frame",
    accentTokens: accents,
    generatedAt: new Date().toISOString(),
    samples: frames,
    violations,
    pass: violations.length === 0,
  };
  await writeFile(outPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`Semantic accent audit: ${report.pass ? "PASS" : "FAIL"} (${frames.length} frames, ${violations.length} violations)`);
  for (const frame of frames) console.log(`${frame.time.toFixed(1)}s ${frame.scene}: ${frame.active.join(" + ") || "no semantic accent"}`);
  console.log(`Report: ${outPath}`);
  if (!report.pass) process.exitCode = 1;
} finally {
  socket.close();
  chrome.kill("SIGTERM");
  await Promise.race([new Promise((resolveExit) => chrome.once("exit", resolveExit)), sleep(1000)]);
  server.close();
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
