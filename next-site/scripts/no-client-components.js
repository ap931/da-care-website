const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const TARGET_DIRS = [path.join(ROOT, "app")];
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git"]);

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), files);
      continue;
    }
    if (!entry.name.endsWith(".js") && !entry.name.endsWith(".jsx")) continue;
    files.push(path.join(dir, entry.name));
  }
  return files;
}

function hasUseClient(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const trimmed = content.trimStart();
  return trimmed.startsWith('"use client"') || trimmed.startsWith("'use client'");
}

function run() {
  const offenders = [];
  for (const dir of TARGET_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir);
    for (const file of files) {
      if (hasUseClient(file)) {
        offenders.push(file);
      }
    }
  }

  if (offenders.length > 0) {
    console.error("Client Components detected (use client):");
    offenders.forEach((file) => console.error(`  ${file}`));
    process.exit(1);
  }
}

run();
