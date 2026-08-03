function escapeXml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function buildGateReport(checks) {
  const summary = { total: checks.length, passed: 0, failed: 0, skipped: 0 };
  for (const check of checks) {
    if (!(check.status in summary)) throw new Error(`unsupported check status: ${check.status}`);
    summary[check.status] += 1;
  }
  return {
    schemaVersion: 1,
    passed: summary.failed === 0,
    summary,
    checks
  };
}

export function toJUnit(report) {
  const cases = report.checks.map((check) => {
    const failure = check.status === 'failed' ? `<failure message="${escapeXml(check.error || 'visual mismatch')}">${escapeXml(check.error || '')}</failure>` : '';
    const skipped = check.status === 'skipped' ? '<skipped/>' : '';
    return `  <testcase name="${escapeXml(check.id)}" time="${(check.durationMs || 0) / 1000}">${failure}${skipped}</testcase>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="visual-regression" tests="${report.summary.total}" failures="${report.summary.failed}" skipped="${report.summary.skipped}">\n${cases}\n</testsuite>\n`;
}
