import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const output = path.join(root, "computed-style-inventory.json");
const mime = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".wav": "audio/wav" };
const server = http.createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = requested === "/" ? "index.html" : requested.slice(1);
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) && file !== path.join(root, "index.html")) throw new Error("outside root");
    response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    response.end(await fs.readFile(file));
  } catch {
    response.statusCode = 404;
    response.end("not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  const inventory = await page.evaluate(() => {
    const rows = [];
    const visit = (scope) => {
      for (const element of scope.querySelectorAll("*")) {
        if (element.shadowRoot) visit(element.shadowRoot);
        if (element.matches("head, title, style, script, template")) continue;
        const ownText = [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent.trim())
          .filter(Boolean)
          .join(" ");
        if (!ownText) continue;
        const style = getComputedStyle(element);
        const body = element.matches("p, h3, .lede, .return");
        rows.push({
          selector: element.id ? `#${element.id}` : element.classList.length ? `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}` : element.tagName.toLowerCase(),
          text: ownText.replace(/\s+/g, " "),
          fontSize: Number.parseFloat(style.fontSize),
          fontFamily: style.fontFamily,
          policy: body ? "body/explanatory" : "label/axis/callout",
          floor: body ? 48 : 36,
        });
      }
    };
    visit(document);
    return rows;
  });
  const violations = inventory.filter((row) => row.fontSize < row.floor);
  const report = {
    generatedAt: new Date().toISOString(),
    source: "live computed styles from Chromium at 1920x1080",
    textElements: inventory.length,
    minimumComputedFontSize: Math.min(...inventory.map((row) => row.fontSize)),
    policy: { bodyExplanatoryMinimumPx: 48, labelAxisCalloutMinimumPx: 36 },
    violations,
    inventory,
  };
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output, textElements: report.textElements, minimumComputedFontSize: report.minimumComputedFontSize, violations: violations.length }, null, 2));
  if (violations.length) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
