const path = require("node:path");
const fs = require("node:fs");
const {
  writeJson,
  computeJsStats,
  computeCssHashes,
} = require("./guard-utils");

const ROOT = process.cwd();
const GUARDS_DIR = path.join(ROOT, "guards");
const JS_BASELINE = path.join(GUARDS_DIR, "js-payload-baseline.json");
const CSS_BASELINE = path.join(GUARDS_DIR, "css-hashes.json");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function run() {
  ensureDir(GUARDS_DIR);
  const now = new Date().toISOString();

  const jsStats = computeJsStats();
  writeJson(JS_BASELINE, {
    generatedAt: now,
    limits: { maxIncreaseBytes: 0 },
    routes: Object.fromEntries(
      Object.entries(jsStats).map(([route, data]) => [
        route,
        {
          totalBytes: data.totalBytes,
          uniqueScriptCount: data.uniqueScriptCount,
          externalScripts: data.externalScripts,
          internalScripts: data.internalScripts,
        },
      ])
    ),
  });

  const cssHashes = computeCssHashes();
  writeJson(CSS_BASELINE, {
    generatedAt: now,
    files: cssHashes,
  });

  console.log("Baselines updated:");
  console.log(`  ${JS_BASELINE}`);
  console.log(`  ${CSS_BASELINE}`);
}

run();
