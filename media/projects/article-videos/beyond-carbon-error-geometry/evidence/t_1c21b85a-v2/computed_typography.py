#!/usr/bin/env python3
"""Record computed visible typography sizes from the reviewed composition."""
from __future__ import annotations

import json
import subprocess
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "evidence" / "t_1c21b85a-v2"
PORT = 8771

REQUESTED = [
    (".domain", 11.2, 36, "label"),
    (".env", 24.0, 36, "label"),
    (".rail b", 40.0, 36, "label"),
    (".candidate", 40.0, 36, "data callout"),
    (".queue", 43.0, 36, "label"),
    (".hub", 58.0, 36, "label"),
    (".spoke", 58.0, 36, "data callout"),
    (".stage", 78.4, 36, "label"),
    (".proof", 92.8, 36, "proof callout"),
    (".source", 78.4, 36, "provenance"),
    (".deck", 78.4, 48, "body copy"),
    (".caption-safe", 78.4, 48, "body/caption rail"),
]

JS_AUDIT = r"""
const selector = arguments[0];
const time = arguments[1];
const tl = window.__timelines && window.__timelines['beyond-carbon'];
if (!tl) throw new Error('beyond-carbon timeline missing');
tl.pause(time, false);
function cumulativeOpacity(node) {
  let opacity = 1;
  for (let current = node; current && current.nodeType === 1; current = current.parentElement) {
    const style = getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden') return 0;
    opacity *= Number.parseFloat(style.opacity || '1');
  }
  return opacity;
}
return Array.from(document.querySelectorAll(selector)).map((node, index) => {
  const style = getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  const opacity = cumulativeOpacity(node);
  const visible = opacity >= 0.01 && rect.width > 0 && rect.height > 0 &&
    rect.right > 0 && rect.bottom > 0 && rect.left < 1920 && rect.top < 1080;
  return {
    index,
    text: (node.textContent || '').trim().replace(/\s+/g, ' '),
    fontSizePx: Number.parseFloat(style.fontSize),
    lineHeight: style.lineHeight,
    cumulativeOpacity: Number(opacity.toFixed(4)),
    visible,
    rect: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
  };
});
"""


def main() -> None:
    server = subprocess.Popen(
        ["python3", "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    options = Options()
    options.binary_location = "/usr/bin/google-chrome"
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    try:
        driver.get(f"http://127.0.0.1:{PORT}/index.html")
        deadline = time.time() + 30
        while time.time() < deadline:
            if driver.execute_script("return Boolean(window.gsap && window.__timelines && window.__timelines['beyond-carbon'])"):
                break
            time.sleep(0.2)
        else:
            raise SystemExit("composition timeline did not become ready")

        results = []
        failures = []
        for selector, at, floor, kind in REQUESTED:
            nodes = driver.execute_script(JS_AUDIT, selector, at)
            visible = [node for node in nodes if node["visible"]]
            minimum = min((node["fontSizePx"] for node in visible), default=None)
            passed = minimum is not None and minimum >= floor
            result = {
                "selector": selector,
                "sampleTime": at,
                "kind": kind,
                "floorPx": floor,
                "visibleNodeCount": len(visible),
                "minimumComputedPx": minimum,
                "pass": passed,
                "visibleNodes": visible,
            }
            results.append(result)
            if not passed:
                failures.append(result)

        # Requested selectors that have declarations but no production node.
        synthetic = driver.execute_script("""
          const fixture = document.createElement('div');
          fixture.className = 'outro';
          fixture.style.cssText = 'opacity:1;display:block;position:absolute;left:100px;top:100px';
          fixture.innerHTML = '<p>CTA fixture</p><span class="small">Small fixture</span>';
          document.body.appendChild(fixture);
          return {
            outroP: parseFloat(getComputedStyle(fixture.querySelector('p')).fontSize),
            small: parseFloat(getComputedStyle(fixture.querySelector('.small')).fontSize),
          };
        """)
        results.extend([
            {"selector": ".outro p", "sampleTime": "CSS fixture", "kind": "body/CTA copy", "floorPx": 48,
             "visibleNodeCount": 0, "minimumComputedPx": synthetic["outroP"], "pass": synthetic["outroP"] >= 48,
             "note": "No production node uses the legacy inline .outro block; computed declaration verified with a visible fixture. Actual sub-composition CTA audited below."},
            {"selector": ".small", "sampleTime": "CSS fixture", "kind": "label", "floorPx": 36,
             "visibleNodeCount": 0, "minimumComputedPx": synthetic["small"], "pass": synthetic["small"] >= 36,
             "note": "No production .small node exists; computed declaration verified with a visible fixture."},
        ])

        driver.get(f"http://127.0.0.1:{PORT}/compositions/outro.html")
        actual_outro = driver.execute_script("""
          const template = document.querySelector('template');
          document.body.appendChild(template.content.cloneNode(true));
          const selectors = ['.outro-cta','.outro-destination','.outro-proof-label','.outro-wordmark'];
          return selectors.map(selector => {
            const node = document.querySelector(selector);
            return {selector, text: node.textContent.trim(), fontSizePx: parseFloat(getComputedStyle(node).fontSize)};
          });
        """)
        for node in actual_outro:
            floor = 48 if node["selector"] in (".outro-cta", ".outro-wordmark") else 36
            passed = node["fontSizePx"] >= floor
            result = {"selector": node["selector"], "sampleTime": "outro sub-composition", "kind": "actual outro text",
                      "floorPx": floor, "visibleNodeCount": 1, "minimumComputedPx": node["fontSizePx"],
                      "pass": passed, "visibleNodes": [node]}
            results.append(result)
            if not passed:
                failures.append(result)

        payload = {
            "canvas": "1920x1080",
            "method": "Google Chrome computed styles after seeking the paused GSAP timeline; visibility includes ancestor opacity and canvas intersection.",
            "results": results,
            "failureCount": len(failures),
            "pass": not failures,
        }
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / "computed-typography.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        lines = ["# Computed typography inventory", "", payload["method"], "", "| Selector | Sample | Floor | Computed minimum | Visible nodes | Result |", "|---|---:|---:|---:|---:|---|"]
        for result in results:
            lines.append(f"| `{result['selector']}` | {result['sampleTime']} | {result['floorPx']} px | {result['minimumComputedPx']} px | {result['visibleNodeCount']} | {'PASS' if result['pass'] else 'FAIL'} |")
        lines.extend(["", f"Overall: {'PASS' if not failures else 'FAIL'} ({len(failures)} failures).", ""])
        (OUT / "computed-typography.md").write_text("\n".join(lines), encoding="utf-8")
        print(json.dumps({"pass": not failures, "failureCount": len(failures), "selectors": len(results)}, indent=2))
        if failures:
            raise SystemExit(1)
    finally:
        driver.quit()
        server.terminate()
        server.wait(timeout=5)


if __name__ == "__main__":
    main()
