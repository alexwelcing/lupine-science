import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildGateReport, toJUnit } from './lib/gate-report.mjs';

export default class GateReporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || process.env.VISUAL_REPORT_DIR || 'visual-results';
    this.checks = [];
  }

  onTestEnd(test, result) {
    const status = result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'skipped' : 'failed';
    this.checks.push({
      id: test.title,
      status,
      ...(result.error ? { error: result.error.message || String(result.error) } : {}),
      attachments: result.attachments.map(({ name, path: attachmentPath, contentType }) => ({ name, path: attachmentPath, contentType }))
    });
  }

  async onEnd() {
    const report = buildGateReport(this.checks);
    await mkdir(this.outputDir, { recursive: true });
    await Promise.all([
      writeFile(path.join(this.outputDir, 'visual-gate.json'), `${JSON.stringify(report, null, 2)}\n`),
      writeFile(path.join(this.outputDir, 'visual-gate.junit.xml'), toJUnit(report))
    ]);
  }
}
