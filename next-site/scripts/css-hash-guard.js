const path = require("node:path");
const { readJson, computeCssHashes } = require("./guard-utils");

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "guards", "css-hashes.json");

function run() {
  if (!require("node:fs").existsSync(BASELINE_PATH)) {
    console.error("Missing CSS hash baseline. Run: npm run guard:baseline");
    process.exit(1);
  }

  const baseline = readJson(BASELINE_PATH);
  const current = computeCssHashes();
  const baseFiles = Object.keys(baseline.files || {}).sort();
  const currentFiles = Object.keys(current).sort();

  const missing = baseFiles.filter((file) => !current[file]);
  const extra = currentFiles.filter((file) => !baseline.files[file]);

  const diffs = [];
  if (missing.length) diffs.push(`Missing CSS files: ${missing.join(", ")}`);
  if (extra.length) diffs.push(`New CSS files: ${extra.join(", ")}`);

  for (const file of baseFiles) {
    const base = baseline.files[file];
    const cur = current[file];
    if (!cur) continue;
    if (base.sha256 !== cur.sha256) {
      diffs.push(`${file}: hash changed`);
    }
  }

  if (diffs.length > 0) {
    console.error("CSS hash guard failed:");
    diffs.forEach((diff) => console.error(`  ${diff}`));
    process.exit(1);
  }
}

run();
