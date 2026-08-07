#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function valueAfter(flag, argv) {
  const index = argv.indexOf(flag);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing required ${flag}`);
  return argv[index + 1];
}

function artifactLinks(receipt, recordsArtifactUrl) {
  const links = [
    ['Visual checks', receipt?.checks?.visual?.artifactUrl],
    ['Smoke checks', receipt?.checks?.smoke?.artifactUrl],
    ['Source CI run', receipt?.ciRunUrl],
    ['Release-certification records', recordsArtifactUrl],
  ];
  return links.filter(([, url]) => typeof url === 'string' && /^https:\/\//.test(url));
}

export function buildReleaseNotification({ receipt, releaseName, gateRunUrl, recordsArtifactUrl }) {
  const hasReceipt = receipt && typeof receipt === 'object';
  const decision = hasReceipt && receipt.decision === 'pass' ? 'pass' : 'fail';
  const failures = hasReceipt
    ? (Array.isArray(receipt.failures) && receipt.failures.length > 0 ? receipt.failures : decision === 'fail' ? ['release certification returned an invalid failing receipt'] : [])
    : ['release certification receipt was not produced; artifact download or validation failed before a receipt could be written'];
  const icon = decision === 'pass' ? '✅' : '🚨';
  const title = `${icon} RELEASE GATE ${decision.toUpperCase()}: ${releaseName}`;
  const links = artifactLinks(receipt, recordsArtifactUrl);
  const markdown = [
    `# ${title}`,
    '',
    `- Release: \`${releaseName}\``,
    `- Decision: **${decision.toUpperCase()}**`,
    `- Commit: \`${receipt?.commitSha ?? 'unavailable'}\``,
    `- Gate workflow: ${gateRunUrl}`,
    `- Failing checks: ${failures.length === 0 ? 'none' : ''}`,
    ...failures.map((failure) => `  - ${failure}`),
    '',
    '## Retained artifacts',
    ...links.map(([label, url]) => `- ${label}: ${url}`),
    '',
    decision === 'pass'
      ? 'Publication remains blocked until the named-owner protected-environment sign-off.'
      : 'Publication is blocked. Inspect the retained artifacts and failing checks before retrying.',
    '',
  ].join('\n');

  return {
    schemaVersion: 1,
    releaseName,
    decision,
    title,
    failingChecks: failures,
    artifactLinks: Object.fromEntries(links),
    gateRunUrl,
    markdown,
  };
}

function readReceipt(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeOutput(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function main(argv = process.argv.slice(2)) {
  const notification = buildReleaseNotification({
    receipt: readReceipt(valueAfter('--receipt', argv)),
    releaseName: valueAfter('--release-name', argv),
    gateRunUrl: valueAfter('--gate-run-url', argv),
    recordsArtifactUrl: valueAfter('--records-artifact-url', argv),
  });
  writeOutput(valueAfter('--markdown-output', argv), notification.markdown);
  writeOutput(valueAfter('--json-output', argv), `${JSON.stringify(notification, null, 2)}\n`);
  console.log(`${notification.decision}: ${notification.title}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
