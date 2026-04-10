const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parse } = require("parse5");

const ROOT = process.cwd();
const NEXT_DIR = path.join(ROOT, ".next");
const PUBLIC_DIR = path.join(ROOT, "public");
const APP_HTML_DIR = path.join(NEXT_DIR, "server", "app");
const ROUTES_MANIFEST = path.join(NEXT_DIR, "app-path-routes-manifest.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function getRoutes() {
  if (!fs.existsSync(ROUTES_MANIFEST)) {
    throw new Error("Missing .next/app-path-routes-manifest.json. Run build first.");
  }
  const manifest = readJson(ROUTES_MANIFEST);
  const routes = new Set();
  for (const route of Object.values(manifest)) {
    if (route.startsWith("/_")) continue;
    routes.add(route);
  }
  return Array.from(routes).sort();
}

function routeToHtml(route) {
  if (route === "/") return "index.html";
  return `${route.slice(1)}.html`;
}

function findAll(node, predicate, results = []) {
  if (!node) return results;
  if (predicate(node)) results.push(node);
  if (node.childNodes) {
    for (const child of node.childNodes) {
      findAll(child, predicate, results);
    }
  }
  return results;
}

function getScriptSrcs(html) {
  const doc = parse(html);
  const scripts = findAll(doc, (node) => node.tagName === "script");
  return scripts
    .map((node) => {
      const attr = (node.attrs || []).find((item) => item.name === "src");
      return attr ? attr.value : null;
    })
    .filter(Boolean);
}

function resolveScriptPath(src) {
  const cleanSrc = src.split("?")[0];
  if (cleanSrc.startsWith("/_next/")) {
    return {
      type: "next",
      filePath: path.join(NEXT_DIR, cleanSrc.replace("/_next/", "")),
    };
  }
  if (cleanSrc.startsWith("/")) {
    return {
      type: "public",
      filePath: path.join(PUBLIC_DIR, cleanSrc.slice(1)),
    };
  }
  if (cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://")) {
    return { type: "external", filePath: null };
  }
  return { type: "external", filePath: null };
}

function computeJsStats() {
  const routes = getRoutes();
  const stats = {};
  const errors = [];

  for (const route of routes) {
    const htmlFile = path.join(APP_HTML_DIR, routeToHtml(route));
    if (!fs.existsSync(htmlFile)) {
      errors.push(`Missing built HTML: ${htmlFile}`);
      continue;
    }
    const html = fs.readFileSync(htmlFile, "utf8");
    const srcs = getScriptSrcs(html);
    const uniqueSrcs = Array.from(new Set(srcs));
    let totalBytes = 0;
    const internalScripts = [];
    const externalScripts = [];

    for (const src of uniqueSrcs) {
      const resolved = resolveScriptPath(src);
      if (resolved.type === "external") {
        externalScripts.push(src);
        continue;
      }
      if (!fs.existsSync(resolved.filePath)) {
        errors.push(`Missing script file for ${route}: ${src}`);
        continue;
      }
      const size = fs.statSync(resolved.filePath).size;
      totalBytes += size;
      internalScripts.push({ src, size, type: resolved.type });
    }

    stats[route] = {
      totalBytes,
      uniqueScriptCount: uniqueSrcs.length,
      externalScripts: externalScripts.sort(),
      internalScripts,
    };
  }

  if (errors.length > 0) {
    const message = errors.map((line) => `  ${line}`).join("\n");
    throw new Error(`JS payload analysis failed:\n${message}`);
  }

  return stats;
}

function walkFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, results);
      continue;
    }
    results.push(fullPath);
  }
  return results;
}

function computeCssHashes() {
  const cssRoot = path.join(PUBLIC_DIR, "css");
  const files = walkFiles(cssRoot).filter((file) => file.endsWith(".css"));
  const hashes = {};

  for (const filePath of files) {
    const rel = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
    const contents = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(contents).digest("hex");
    hashes[rel] = {
      sha256: hash,
      size: contents.length,
    };
  }

  return hashes;
}

module.exports = {
  readJson,
  writeJson,
  computeJsStats,
  computeCssHashes,
};
