import path from 'node:path';
import { defineConfig } from '@playwright/test';
import { assertBaselineUpdateAllowed } from './visual/lib/baseline-policy.mjs';

assertBaselineUpdateAllowed(process.env);

export default defineConfig({
  testDir: './visual',
  testMatch: 'visual.spec.mjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: 'visual-results/artifacts',
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  reporter: [
    ['list'],
    ['./visual/gate-reporter.mjs', { outputDir: process.env.VISUAL_REPORT_DIR || 'visual-results' }]
  ],
  use: {
    browserName: 'chromium',
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css' }
  },
  ...(process.env.VISUAL_FIXTURE_SERVER === '1' ? {
    webServer: {
      command: 'node visual/fixtures/server.mjs',
      url: 'http://127.0.0.1:4173/health',
      reuseExistingServer: false
    }
  } : {})
});
