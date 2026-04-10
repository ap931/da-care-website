const path = require("node:path");
const { readJson, computeJsStats } = require("./guard-utils");

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "guards", "js-payload-baseline.json");

function compareSets(a, b) {
  const onlyA = a.filter((item) => !b.includes(item));
  const onlyB = b.filter((item) => !a.includes(item));
  return { onlyA, onlyB };
}

function run() {
  if (!require("node:fs").existsSync(BASELINE_PATH)) {
    console.error(
      "Missing JS payload baseline. Run: npm run guard:baseline"
    );
    process.exit(1);
  }

  const baseline = readJson(BASELINE_PATH);
  const current = computeJsStats();
  const allowance = Number(
    process.env.JS_BUDGET_ALLOWANCE_BYTES ??
      baseline.limits?.maxIncreaseBytes ??
      0
  );

  const baselineRoutes = Object.keys(baseline.routes || {});
  const currentRoutes = Object.keys(current);
  const missingRoutes = baselineRoutes.filter(
    (route) => !currentRoutes.includes(route)
  );
  const extraRoutes = currentRoutes.filter(
    (route) => !baselineRoutes.includes(route)
  );

  const diffs = [];

  if (missingRoutes.length > 0) {
    diffs.push(`Missing routes: ${missingRoutes.join(", ")}`);
  }
  if (extraRoutes.length > 0) {
    diffs.push(`New routes (baseline update required): ${extraRoutes.join(", ")}`);
  }

  for (const route of baselineRoutes) {
    const base = baseline.routes[route];
    const cur = current[route];
    if (!cur) continue;

    if (cur.totalBytes > base.totalBytes + allowance) {
      diffs.push(
        `${route}: totalBytes ${cur.totalBytes} > ${base.totalBytes} (+${allowance} allowance)`
      );
    }

    if (cur.uniqueScriptCount > base.uniqueScriptCount) {
      diffs.push(
        `${route}: script count ${cur.uniqueScriptCount} > ${base.uniqueScriptCount}`
      );
    }

    const baseExt = base.externalScripts || [];
    const curExt = cur.externalScripts || [];
    const { onlyA, onlyB } = compareSets(curExt, baseExt);
    if (onlyA.length || onlyB.length) {
      diffs.push(
        `${route}: external scripts changed (added: ${onlyA.join(
          ", "
        )} removed: ${onlyB.join(", ")})`
      );
    }
  }

  if (diffs.length > 0) {
    console.error("JS payload guard failed:");
    diffs.forEach((diff) => console.error(`  ${diff}`));
    process.exit(1);
  }
}

run();
