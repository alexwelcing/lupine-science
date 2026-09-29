#!/usr/bin/env node
// Fail-closed QA reconciliation for the MIDWEST-2076 brand library.
//
// The durable out-of-tree archive branch (origin/archive/midwest-2076-library-2026-08)
// preserves every reviewed selection/QA/provenance record plus the exact bytes that the
// rescue branch once published under public/brand-assets/assets/images/midwest-2076/
// (archived at media/projects/midwest-2076-library/published-tree/). This tool:
//
//   --write   regenerates media/projects/midwest-2076-library/qa-reconciliation.json
//             deterministically, computing every digest from actual bytes on disk and
//             refusing on any divergence from the recorded provenance.
//   (default) verifies an existing ledger byte-for-byte against the hydrated archive
//             and enforces the acceptance invariants. Zero records are QA-accepted;
//             any entry claiming acceptance without a matching qa.status === 'accepted'
//             in requests.json AND an explicit human review reference is a hard error.
//
// This tool never grants acceptance. It maps each once-published master/thumb to its
// repository-relative source, provenance record, and explicit non-accepted QA state so
// that the fail-closed publication builder (scripts/build-midwest-2076-brand-library.mjs)
// keeps refusing until genuine human QA acceptance lands in requests.json.
//
// Running it against an unhydrated checkout (media contracts absent) is a refusal,
// not a pass: hydrate from the archive branch first.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const writeMode = args.includes('--write');
const rootFlag = args.indexOf('--root');
const ROOT = rootFlag !== -1 ? path.resolve(args[rootFlag + 1]) : DEFAULT_ROOT;

const PROJECT_DIR = path.join(ROOT, 'media', 'projects', 'midwest-2076-library');
const LEDGER = path.join(PROJECT_DIR, 'qa-reconciliation.json');
const PUBLISHED_TREE = path.join(PROJECT_DIR, 'published-tree');
const PUBLISHED_TREE_COMMIT = 'e2ba251a08e92b408bd85572d318547a0fb871ad';
const ARCHIVE_REF = 'origin/archive/midwest-2076-library-2026-08';

function fail(message) {
  console.error(`qa-reconciliation: ${message}`);
  process.exit(1);
}

function sha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function repoFile(relative) {
  if (typeof relative !== 'string' || relative.startsWith('/') || relative.includes('..')) {
    fail(`unsafe repository-relative path: ${relative}`);
  }
  return path.join(ROOT, relative);
}

function requireRegularFile(relative) {
  const file = repoFile(relative);
  if (!fs.existsSync(file)) fail(`missing hydrated file: ${relative} (hydrate from ${ARCHIVE_REF})`);
  const stat = fs.lstatSync(file);
  if (!stat.isFile()) fail(`not a regular file: ${relative}`);
  return file;
}

function readJson(relative) {
  return JSON.parse(fs.readFileSync(requireRegularFile(relative), 'utf8'));
}

// publicMasterPath in generation records is repo-relative ('public/brand-assets/...').
// The archive branch preserves those exact bytes under published-tree/.
function archivedPublishedPath(publicRelative) {
  if (!publicRelative.startsWith('public/')) fail(`unexpected public path: ${publicRelative}`);
  return path.posix.join(
    'media/projects/midwest-2076-library/published-tree',
    publicRelative.slice('public/'.length),
  );
}

function verifiedFileFacts(relative, claimedSha, claimedBytes, context) {
  const file = requireRegularFile(relative);
  const actualSha = sha256(file);
  const actualBytes = fs.statSync(file).size;
  if (claimedSha && actualSha !== claimedSha) {
    fail(`digest mismatch for ${context} at ${relative}: record claims ${claimedSha}, bytes are ${actualSha}`);
  }
  if (Number.isInteger(claimedBytes) && actualBytes !== claimedBytes) {
    fail(`byte-count mismatch for ${context} at ${relative}: record claims ${claimedBytes}, file is ${actualBytes}`);
  }
  return { path: relative, sha256: actualSha, bytes: actualBytes };
}

// ---------------------------------------------------------------------------
// Cohorts: every once-published master/thumb belongs to exactly one reviewed
// cohort with a provenance record and an explicit human selection verdict.
// ---------------------------------------------------------------------------

function selectionStates(selection, resultsKey, idField = 'id', stateField = 'state') {
  const map = new Map();
  for (const entry of selection[resultsKey] ?? []) {
    const id = entry[idField];
    const state = entry[stateField] ?? entry.verdict;
    if (!id || !state) fail(`selection entry missing id/state in ${resultsKey}`);
    map.set(id, entry);
  }
  return map;
}

function buildEntries() {
  const entries = [];

  const pushGenerated = ({ record, recordPath, qaFor, cohort, cohortNote }) => {
    for (const result of record.results) {
      const qa = qaFor(result);
      if (!qa || typeof qa.state !== 'string') fail(`no explicit QA state for ${result.id} in ${cohort}`);
      if (qa.state === 'accepted') {
        fail(`cohort ${cohort} claims accepted state for ${result.id}; acceptance may only originate from requests.json qa.status`);
      }
      const source = verifiedFileFacts(
        result.sourceLocalPath,
        result.sha256?.source,
        result.bytes?.source,
        `${result.id} source`,
      );
      const master = verifiedFileFacts(
        archivedPublishedPath(result.publicMasterPath),
        result.sha256?.master,
        result.bytes?.master,
        `${result.id} published master`,
      );
      const thumbnail = verifiedFileFacts(
        archivedPublishedPath(result.publicThumbPath),
        result.sha256?.thumbnail,
        result.bytes?.thumbnail,
        `${result.id} published thumbnail`,
      );
      entries.push({
        id: result.id,
        cohort,
        cohortNote,
        provenance: {
          record: recordPath,
          provider: record.provider ?? result.provider ?? null,
          endpoint: result.endpoint ?? record.endpoint,
          providerRequestId: result.requestId ?? null,
          generatedAt: result.generatedAt ?? record.generatedAt,
          promptSha256: result.promptSha256 ?? null,
        },
        source,
        publishedMaster: { oncePublishedAs: result.publicMasterPath.replace(/^public/, ''), ...master },
        publishedThumbnail: { oncePublishedAs: result.publicThumbPath.replace(/^public/, ''), ...thumbnail },
        qa,
        eligibleForFinalLibrary: false,
      });
    }
  };

  // Cohort 1: calibration round 02 (5 masters) — superseded before scene canon.
  const calibrationPath = 'media/projects/midwest-2076-library/calibration-02-generation-record.json';
  const calibration = readJson(calibrationPath);
  pushGenerated({
    record: calibration,
    recordPath: calibrationPath,
    cohort: 'calibration-02',
    cohortNote: calibration.supersededReason,
    qaFor: (result) => ({
      state: 'calibration-superseded',
      reviewedIn: calibrationPath,
      verdict: result.selectionStatus ?? calibration.selectionStatus,
    }),
  });

  // Cohort 2: pilot round 01 (10 masters) — human contact-sheet QA, 0 publish verdicts.
  const pilotRecordPath = 'media/projects/midwest-2076-library/pilot-generation-record.json';
  const pilotSelectionPath = 'media/projects/midwest-2076-library/pilot-selection.json';
  const pilotQaPath = 'media/projects/midwest-2076-library/pilot-qa.json';
  const pilotRecord = readJson(pilotRecordPath);
  const pilotStates = selectionStates(readJson(pilotSelectionPath), 'reviews');
  pushGenerated({
    record: pilotRecord,
    recordPath: pilotRecordPath,
    cohort: 'pilot-01',
    cohortNote: 'Pilot round reviewed on contact sheet plus full-resolution inspection; zero publish verdicts.',
    qaFor: (result) => {
      const review = pilotStates.get(result.id);
      if (!review) return null;
      return {
        state: review.state,
        reviewedIn: pilotSelectionPath,
        qaRecord: pilotQaPath,
        verdict: review.state,
        weightedScore: review.weightedScore ?? null,
      };
    },
  });

  // Cohort 3: first-principles pilot (5 masters).
  const fpPilotRecordPath = 'media/projects/midwest-2076-library/first-principles-pilot-generation-record.json';
  const fpPilotSelectionPath = 'media/projects/midwest-2076-library/first-principles-pilot-selection.json';
  const fpPilotStates = selectionStates(readJson(fpPilotSelectionPath), 'results');
  pushGenerated({
    record: readJson(fpPilotRecordPath),
    recordPath: fpPilotRecordPath,
    cohort: 'first-principles-pilot',
    cohortNote: 'First-principles pilot; verdictCounts pass:0 mutate:4 reject:1.',
    qaFor: (result) => {
      const review = fpPilotStates.get(result.id);
      if (!review) return null;
      return { state: review.state ?? review.verdict, reviewedIn: fpPilotSelectionPath, verdict: review.state ?? review.verdict };
    },
  });

  // Cohort 4: first-principles iteration 02 (5 masters).
  const fpIt02RecordPath = 'media/projects/midwest-2076-library/first-principles-iteration-02-generation-record.json';
  const fpIt02SelectionPath = 'media/projects/midwest-2076-library/first-principles-iteration-02-selection.json';
  const fpIt02States = selectionStates(readJson(fpIt02SelectionPath), 'results');
  pushGenerated({
    record: readJson(fpIt02RecordPath),
    recordPath: fpIt02RecordPath,
    cohort: 'first-principles-iteration-02',
    cohortNote: 'First-principles revision round; verdictCounts pass:0 mutate:4 reject:1.',
    qaFor: (result) => {
      const review = fpIt02States.get(result.id);
      if (!review) return null;
      return { state: review.state ?? review.verdict, reviewedIn: fpIt02SelectionPath, verdict: review.state ?? review.verdict };
    },
  });

  // Cohort 5: sequence pilot sys-07 (4 masters) — sequence verdict fail.
  const seqRecordPath = 'media/projects/midwest-2076-library/sequence-pilot-sys-07-generation-record.json';
  const seqSelectionPath = 'media/projects/midwest-2076-library/sequence-pilot-sys-07-selection.json';
  const seqSelection = readJson(seqSelectionPath);
  const seqStates = selectionStates(seqSelection, 'results');
  pushGenerated({
    record: readJson(seqRecordPath),
    recordPath: seqRecordPath,
    cohort: 'sequence-pilot-sys-07',
    cohortNote: `Blind causal-sequence evaluation verdict: ${seqSelection.sequenceEvaluation?.verdict}.`,
    qaFor: (result) => {
      const review = seqStates.get(result.id);
      if (!review) return null;
      return {
        state: review.state ?? review.verdict,
        reviewedIn: seqSelectionPath,
        verdict: review.state ?? review.verdict,
        sequenceVerdict: seqSelection.sequenceEvaluation?.verdict ?? null,
      };
    },
  });

  // Cohort 6: gpt-image-2 edit test (1 master) — workflow fail, asset reject.
  const editTestPath = 'media/projects/midwest-2076-library/first-principles-edit-test-record.json';
  const editTest = readJson(editTestPath);
  {
    const evaluation = editTest.evaluation ?? {};
    if (evaluation.assetVerdict === 'accepted') fail('edit-test claims acceptance; refusing');
    const source = verifiedFileFacts(
      editTest.files.source.path,
      editTest.files.source.sha256,
      editTest.files.source.bytes,
      `${editTest.testId} source`,
    );
    const master = verifiedFileFacts(
      archivedPublishedPath(editTest.files.master.path),
      editTest.files.master.sha256,
      editTest.files.master.bytes,
      `${editTest.testId} published master`,
    );
    const thumbnail = verifiedFileFacts(
      archivedPublishedPath(editTest.files.thumbnail.path),
      editTest.files.thumbnail.sha256,
      editTest.files.thumbnail.bytes,
      `${editTest.testId} published thumbnail`,
    );
    entries.push({
      id: editTest.testId,
      cohort: 'first-principles-edit-test',
      cohortNote: 'Localized-edit workflow test; workflowVerdict fail, assetVerdict reject.',
      provenance: {
        record: editTestPath,
        provider: 'fal.ai',
        endpoint: editTest.endpoint,
        providerRequestId: editTest.providerRequestId ?? null,
        generatedAt: null,
        promptSha256: null,
      },
      source,
      publishedMaster: { oncePublishedAs: editTest.files.master.path.replace(/^public/, ''), ...master },
      publishedThumbnail: { oncePublishedAs: editTest.files.thumbnail.path.replace(/^public/, ''), ...thumbnail },
      qa: {
        state: evaluation.assetVerdict,
        reviewedIn: editTestPath,
        verdict: evaluation.assetVerdict,
        workflowVerdict: evaluation.workflowVerdict ?? null,
      },
      eligibleForFinalLibrary: false,
    });
  }

  entries.sort((a, b) => a.id.localeCompare(b.id, 'en'));
  return entries;
}

function manifestSummary() {
  const manifest = readJson('media/projects/midwest-2076-library/requests.json');
  if (manifest.requests?.length !== 100) fail(`requests.json cardinality ${manifest.requests?.length}, expected 100`);
  const statusCounts = {};
  let accepted = 0;
  for (const request of manifest.requests) {
    statusCounts[request.status] = (statusCounts[request.status] ?? 0) + 1;
    if (request.qa?.status === 'accepted') accepted += 1;
  }
  return {
    path: 'media/projects/midwest-2076-library/requests.json',
    manifestStatus: manifest.status,
    eligibleForFinalLibrary: manifest.eligibleForFinalLibrary === true,
    supersededBy: manifest.supersededBy ?? null,
    requestCount: manifest.requests.length,
    statusCounts: Object.fromEntries(Object.entries(statusCounts).sort(([a], [b]) => a.localeCompare(b, 'en'))),
    qaAcceptedCount: accepted,
  };
}

function buildLedger() {
  const entries = buildEntries();
  if (entries.length !== 30) fail(`expected exactly 30 once-published masters, mapped ${entries.length}`);
  const manifest = manifestSummary();
  if (manifest.qaAcceptedCount !== 0) {
    fail(`requests.json reports ${manifest.qaAcceptedCount} accepted records; this reconciliation predates any genuine acceptance and must be regenerated under review`);
  }
  return {
    schemaVersion: 1,
    project: 'midwest-2076-brand-library',
    purpose:
      'Reconcile every master/thumbnail once published by the rescue branch with its repository-relative source, provenance record, and explicit QA state. No record is QA-accepted; the fail-closed publication builder must keep refusing.',
    publishedTree: {
      commit: PUBLISHED_TREE_COMMIT,
      note: 'Exact bytes the rescue branch once published under public/brand-assets/assets/images/midwest-2076/, preserved durably at media/projects/midwest-2076-library/published-tree/. Remediation commit 7e6ef4065c176b03f45af6fe62a057490e5a99ce removed them from the public tree; merged main publishes none.',
      archiveRef: ARCHIVE_REF,
      fileCount: 60,
    },
    activeManifest: manifest,
    acceptanceRule:
      'An asset may only be published when its requests.json record reaches qa.status "accepted" through human review; generation, calibration, pilot, mutate, or reject states never publish. This ledger records historical publication without granting acceptance.',
    counts: {
      mappedMasters: entries.length,
      mappedFiles: entries.length * 2,
      byQaState: entries.reduce((acc, entry) => {
        acc[entry.qa.state] = (acc[entry.qa.state] ?? 0) + 1;
        return acc;
      }, {}),
      qaAccepted: 0,
    },
    entries,
  };
}

function verifyLedger() {
  if (!fs.existsSync(LEDGER)) {
    fail(`missing ledger ${path.relative(ROOT, LEDGER)} (hydrate from ${ARCHIVE_REF})`);
  }
  const onDisk = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
  const rebuilt = buildLedger();
  const a = JSON.stringify(onDisk, null, 2);
  const b = JSON.stringify(rebuilt, null, 2);
  if (a !== b) fail('ledger does not match a deterministic rebuild from provenance records and actual bytes');
  for (const entry of rebuilt.entries) {
    if (entry.qa.state === 'accepted' || entry.eligibleForFinalLibrary === true) {
      fail(`entry ${entry.id} claims acceptance without requests.json qa.status backing`);
    }
  }
  // The published tree must contain exactly the mapped files — no orphans.
  const mapped = new Set();
  for (const entry of rebuilt.entries) {
    mapped.add(path.resolve(repoFile(entry.publishedMaster.path)));
    mapped.add(path.resolve(repoFile(entry.publishedThumbnail.path)));
  }
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
      const file = path.join(dir, item.name);
      return item.isDirectory() ? walk(file) : [path.resolve(file)];
    });
  const actual = walk(PUBLISHED_TREE);
  if (actual.length !== mapped.size) fail(`published-tree has ${actual.length} files, ledger maps ${mapped.size}`);
  for (const file of actual) {
    if (!mapped.has(file)) fail(`orphan published file with no QA mapping: ${path.relative(ROOT, file)}`);
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        mappedMasters: rebuilt.counts.mappedMasters,
        mappedFiles: rebuilt.counts.mappedFiles,
        byQaState: rebuilt.counts.byQaState,
        qaAccepted: rebuilt.counts.qaAccepted,
        manifestQaAccepted: rebuilt.activeManifest.qaAcceptedCount,
      },
      null,
      2,
    ),
  );
}

if (writeMode) {
  const ledger = buildLedger();
  fs.writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`);
  console.log(JSON.stringify({ wrote: path.relative(ROOT, LEDGER), masters: ledger.counts.mappedMasters }, null, 2));
} else {
  verifyLedger();
}
