#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function valueAfter(flag, argv) {
  const index = argv.indexOf(flag);
  if (index === -1 || !argv[index + 1]) throw new Error(`missing required ${flag}`);
  return argv[index + 1];
}

function readJson(file, label) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${label} artifact is unreadable: ${error.message}`);
  }
  if (parsed.schemaVersion !== 1) throw new Error(`${label} artifact schemaVersion must be 1`);
  return parsed;
}

export function certifyRelease({ visual, smoke, commitSha, ciRunUrl, visualArtifactUrl, smokeArtifactUrl }) {
  const failures = [];
  if (visual.passed !== true || visual.summary?.failed !== 0 || !Array.isArray(visual.checks) || visual.checks.length === 0) {
    failures.push('visual-check suite did not pass');
  }
  if (smoke.outcome !== 'pass' || !Array.isArray(smoke.targets) || smoke.targets.length === 0) {
    failures.push('smoke suite did not pass');
  }
  if (!commitSha || !/^[0-9a-f]{40}$/i.test(commitSha)) failures.push('release commit SHA is invalid');
  for (const [label, url] of [['CI run', ciRunUrl], ['visual artifact', visualArtifactUrl], ['smoke artifact', smokeArtifactUrl]]) {
    if (!url || !/^https:\/\//.test(url)) failures.push(`${label} link is invalid`);
  }

  return {
    schemaVersion: 1,
    decision: failures.length === 0 ? 'pass' : 'fail',
    commitSha,
    checks: {
      visual: {
        passed: failures.includes('visual-check suite did not pass') === false,
        artifactUrl: visualArtifactUrl,
        total: visual.summary?.total ?? null,
        failed: visual.summary?.failed ?? null,
      },
      smoke: {
        passed: failures.includes('smoke suite did not pass') === false,
        artifactUrl: smokeArtifactUrl,
        targets: smoke.targets?.length ?? 0,
        failed: smoke.targets?.reduce((sum, target) => sum + (target.summary?.failed ?? 0), 0) ?? null,
      },
    },
    failures,
    ciRunUrl,
    ownerSignoff: {
      requiredEnvironment: 'publication',
      requiredReviewer: 'alexwelcing',
      status: 'pending',
      evidence: 'GitHub deployment review record for the publication environment',
    },
    productionApproval: {
      requiredEnvironment: 'production',
      requiredReviewer: 'alexwelcing',
      status: 'pending',
      evidence: 'GitHub deployment review record for the production environment',
    },
  };
}

function main(argv = process.argv.slice(2)) {
  const visualPath = valueAfter('--visual', argv);
  const smokePath = valueAfter('--smoke', argv);
  const outputPath = valueAfter('--output', argv);
  const receipt = certifyRelease({
    visual: readJson(visualPath, 'visual'),
    smoke: readJson(smokePath, 'smoke'),
    commitSha: valueAfter('--sha', argv),
    ciRunUrl: valueAfter('--ci-run-url', argv),
    visualArtifactUrl: valueAfter('--visual-artifact-url', argv),
    smokeArtifactUrl: valueAfter('--smoke-artifact-url', argv),
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
  if (receipt.decision !== 'pass') {
    console.error(`Release certification rejected: ${receipt.failures.join('; ')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Release certification passed for ${receipt.commitSha}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
