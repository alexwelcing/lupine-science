import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixtureArg = process.argv[2];
if (!fixtureArg) {
  throw new Error("Usage: node scripts/prepare-motion-harness.mjs <fixture-directory>");
}

const componentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDir = path.resolve(fixtureArg);
const harnessDir = path.join(fixtureDir, "motion-harness");
const componentHtml = readFileSync(path.join(componentDir, "compositions", "title-card.html"), "utf8");
const fixtureHtml = readFileSync(path.join(fixtureDir, "index.html"), "utf8");

const templateMatch = componentHtml.match(/<template\b[^>]*>([\s\S]*?)<\/template>/i);
if (!templateMatch) {
  throw new Error("Canonical title-card composition is missing its <template> wrapper.");
}

const declarationsMatch = componentHtml.match(/data-composition-variables='([\s\S]*?)'/i);
if (!declarationsMatch) {
  throw new Error("Canonical title-card composition is missing data-composition-variables.");
}

const variablesMatch = fixtureHtml.match(/data-variable-values='([^']*)'/i);
if (!variablesMatch) {
  throw new Error(`${fixtureDir}/index.html is missing data-variable-values.`);
}

const variableValues = variablesMatch[1];
const standaloneComposition = templateMatch[1]
  .replace(
  'data-composition-id="title-card"',
  `data-composition-id="title-card" data-start="0" data-variable-values='${variableValues}'`,
  )
  .replace(
    '<div class="title-card-wash" data-layout-ignore></div>',
    '<div class="title-card-wash" data-layout-ignore><span aria-hidden="true" style="position:absolute;left:0;top:0;width:1px;height:1px"></span></div>',
  );

const harnessHtml = `<!doctype html>
<html lang="en" data-composition-variables='${declarationsMatch[1]}'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Title card motion QA</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  </head>
  <body>${standaloneComposition}</body>
</html>
`;

mkdirSync(harnessDir, { recursive: true });
rmSync(path.join(harnessDir, "assets"), { recursive: true, force: true });
writeFileSync(path.join(harnessDir, "index.html"), harnessHtml);
cpSync(
  path.join(componentDir, "compositions", "title-card.motion.json"),
  path.join(harnessDir, "index.motion.json"),
);
cpSync(path.resolve(componentDir, "../../assets"), path.join(harnessDir, "assets"), {
  recursive: true,
});
