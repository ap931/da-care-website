const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { parse } = require("parse5");

const ROOT = process.cwd();
const ORIGINAL_DIR = path.join(ROOT, "content");
const BUILT_DIR = path.join(ROOT, ".next", "server", "app");

const PAGES = [
  {
    route: "/",
    original: "index.html",
    built: "index.html",
    allowTextDiff: true,
  },
  { route: "/about", original: "about.html", built: "about.html", allowTextDiff: true },
  { route: "/contact", original: "contact.html", built: "contact.html", allowTextDiff: true },
  {
    route: "/article",
    original: "article.html",
    built: "article.html",
    allowTextDiff: true,
    allowImageAttrs: true,
  },
  { route: "/coren", original: "coren.html", built: "coren.html", allowTextDiff: true },
  { route: "/leda", original: "leda.html", built: "leda.html", allowTextDiff: true },
  {
    route: "/leda-business",
    original: "leda-business.html",
    built: "leda-business.html",
    allowTextDiff: true,
  },
];

const BOOLEAN_ATTRS = new Set([
  "defer",
  "async",
  "nomodule",
  "hidden",
  "muted",
  "autoplay",
  "playsinline",
  "loop",
]);

function normalizeText(value) {
  const text = value.replace(/\s+/g, " ").trim();
  return text || null;
}

function normalizeStyle(value) {
  const entries = value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [prop, ...rest] = part.split(":");
      if (!prop || rest.length === 0) return null;
      return [prop.trim().toLowerCase(), rest.join(":").trim()];
    })
    .filter(Boolean)
    .sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([prop, val]) => `${prop}:${val}`).join("; ");
}

function normalizeAttrs(attrs) {
  const map = {};
  for (const attr of attrs || []) {
    const name = attr.name;
    let value = attr.value ?? "";
    if (BOOLEAN_ATTRS.has(name)) {
      value = "";
    } else if (name === "class") {
      value = value.replace(/\s+/g, " ").trim();
    } else if (name === "style") {
      value = normalizeStyle(value);
    }
    map[name] = value;
  }
  return Object.keys(map)
    .sort()
    .map((key) => [key, map[key]]);
}

function normalizeHeadAttrValue(name, value) {
  const trimmed = (value || "").trim();
  if (name === "charset") return trimmed.toLowerCase();
  if (name === "rel" || name === "as") return trimmed.toLowerCase();
  if (name === "crossorigin") return trimmed.toLowerCase();
  return trimmed;
}

function normalizeHeadAttrs(attrs) {
  const map = {};
  for (const attr of attrs || []) {
    const name = attr.name;
    map[name] = normalizeHeadAttrValue(name, attr.value);
  }
  return Object.keys(map)
    .sort()
    .map((key) => [key, map[key]]);
}

function normalizeViewportContent(value) {
  return value.replace(/initial-scale=1(?:\.0)?/g, "initial-scale=1");
}

function normalizeNode(node) {
  if (!node) return null;
  if (node.nodeName === "#text") {
    const text = normalizeText(node.value || "");
    return text ? { type: "text", value: text } : null;
  }
  if (node.nodeName === "#comment") return null;
  if (node.nodeName === "#documentType") return null;
  if (node.childNodes) {
    const children = node.childNodes
      .map((child) => normalizeNode(child))
      .filter(Boolean);
    if (node.nodeName === "#document" || node.nodeName === "#document-fragment") {
      return { type: "root", children };
    }
    return {
      type: "element",
      name: node.tagName || node.nodeName,
      attrs: normalizeAttrs(node.attrs),
      children,
    };
  }
  return null;
}

function findFirst(node, predicate) {
  if (!node) return null;
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const found = findFirst(child, predicate);
    if (found) return found;
  }
  return null;
}

function findAll(node, predicate, results = []) {
  if (!node) return results;
  if (predicate(node)) results.push(node);
  for (const child of node.childNodes || []) {
    findAll(child, predicate, results);
  }
  return results;
}

function getBody(doc) {
  return findFirst(doc, (n) => n.tagName === "body");
}

function getHead(doc) {
  return findFirst(doc, (n) => n.tagName === "head");
}

function getSkipLink(body) {
  return findFirst(body, (n) => {
    if (n.tagName !== "a") return false;
    const classAttr = (n.attrs || []).find((a) => a.name === "class");
    return classAttr && /\bskip-link\b/.test(classAttr.value || "");
  });
}

function getSection(body, tag) {
  return findFirst(body, (n) => n.tagName === tag);
}

function getScripts(body) {
  return findAll(body, (n) => n.tagName === "script");
}

function getHeadNodes(head) {
  return (head?.childNodes || []).filter((node) => {
    if (!node.tagName) return false;
    return node.tagName === "meta" || node.tagName === "link" || node.tagName === "title";
  });
}

function getAttr(node, name) {
  const attr = (node.attrs || []).find((item) => item.name === name);
  return attr ? attr.value : null;
}

function getScriptText(node) {
  return (node.childNodes || [])
    .filter((child) => child.nodeName === "#text")
    .map((child) => child.value || "")
    .join("");
}

function isInternalNextScript(node) {
  const src = getAttr(node, "src");
  if (src && src.startsWith("/_next/")) return true;
  if (getAttr(node, "id") === "_R_") return true;
  if (!src) {
    const text = getScriptText(node);
    if (/__next_f|__next_data|self\.__next_f/.test(text)) return true;
  }
  return false;
}

function isInternalHeadNode(node) {
  if (!node || !node.tagName) return true;
  if (node.tagName === "script") return true;
  const name = getAttr(node, "name");
  if (node.tagName === "meta" && name && name.startsWith("next-")) return true;
  if (node.tagName === "link") {
    const href = getAttr(node, "href");
    if (href && href.startsWith("/_next/")) return true;
  }
  return false;
}

function getTitleText(node) {
  return (node.childNodes || [])
    .filter((child) => child.nodeName === "#text")
    .map((child) => child.value || "")
    .join("")
    .trim();
}

function serializeHeadNode(node) {
  if (node.tagName === "title") {
    return `title|${getTitleText(node)}`;
  }
  const attrs = normalizeHeadAttrs(node.attrs);
  if (node.tagName === "meta") {
    const nameEntry = attrs.find(([key]) => key === "name");
    if (nameEntry && nameEntry[1] === "viewport") {
      const contentEntry = attrs.find(([key]) => key === "content");
      if (contentEntry) {
        contentEntry[1] = normalizeViewportContent(contentEntry[1]);
      }
    }
  }
  const serialized = attrs.map(([key, val]) => `${key}=${val}`).join("|");
  return `${node.tagName}|${serialized}`;
}

function compareHead(originalHead, builtHead, diffs) {
  const originalNodes = getHeadNodes(originalHead);
  const builtNodes = getHeadNodes(builtHead).filter(
    (node) => !isInternalHeadNode(node)
  );

  const originalMap = new Map();
  for (const node of originalNodes) {
    const key = serializeHeadNode(node);
    originalMap.set(key, (originalMap.get(key) || 0) + 1);
  }

  const builtMap = new Map();
  for (const node of builtNodes) {
    const key = serializeHeadNode(node);
    builtMap.set(key, (builtMap.get(key) || 0) + 1);
  }

  for (const [key, count] of originalMap.entries()) {
    const builtCount = builtMap.get(key) || 0;
    if (builtCount < count) {
      diffs.push(`head: missing ${key} (${count - builtCount})`);
    }
  }

}

function compareNodes(a, b, path, diffs, options = {}) {
  if (!a && !b) return;
  if (!a || !b) {
    diffs.push(`${path}: ${a ? "expected" : "missing"} node`);
    return;
  }
  if (a.type !== b.type) {
    diffs.push(`${path}: type ${a.type} !== ${b.type}`);
    return;
  }
  if (a.type === "text") {
    if (options.ignoreText) {
      return;
    }
    if (a.value !== b.value) {
      diffs.push(`${path}: text "${a.value}" !== "${b.value}"`);
    }
    return;
  }
  if (a.type === "element") {
    if (a.name !== b.name) {
      diffs.push(`${path}: tag ${a.name} !== ${b.name}`);
    }
    let attrsA = a.attrs;
    let attrsB = b.attrs;
    if (options.ignoreScriptDefer && a.name === "script" && b.name === "script") {
      attrsA = stripAttr(attrsA, "defer");
      attrsB = stripAttr(attrsB, "defer");
    }
    if (a.name === "a" && b.name === "a" && options.anchorAttrAllowlist) {
      const classList = getClassList(attrsA);
      const allow = getAllowedAttrs(classList, options.anchorAttrAllowlist);
      if (allow.length) {
        attrsA = stripAttrs(attrsA, allow);
        attrsB = stripAttrs(attrsB, allow);
      }
    }
    if (a.name === "img" && b.name === "img" && options.ignoreImageAttrs) {
      attrsA = stripAttrs(attrsA, ["src", "alt", "srcset"]);
      attrsB = stripAttrs(attrsB, ["src", "alt", "srcset"]);
    }
    if (a.name === "img" && b.name === "img" && options.imageAttrAllowlist) {
      const classList = getClassList(attrsA);
      const allow = getAllowedAttrs(classList, options.imageAttrAllowlist);
      if (allow.length) {
        attrsA = stripAttrs(attrsA, allow);
        attrsB = stripAttrs(attrsB, allow);
      }
    }
    if (a.name === "video" && b.name === "video" && options.videoAttrAllowlist) {
      const classList = getClassList(attrsA);
      const allow = getAllowedAttrs(classList, options.videoAttrAllowlist);
      if (allow.length) {
        attrsA = stripAttrs(attrsA, allow);
        attrsB = stripAttrs(attrsB, allow);
      }
    }
    const attrsAString = JSON.stringify(attrsA);
    const attrsBString = JSON.stringify(attrsB);
    if (attrsAString !== attrsBString) {
      diffs.push(`${path}: attrs ${attrsAString} !== ${attrsBString}`);
    }
    const len = Math.max(a.children.length, b.children.length);
    for (let i = 0; i < len; i += 1) {
      compareNodes(
        a.children[i],
        b.children[i],
        `${path}>${a.name}[${i}]`,
        diffs,
        options
      );
    }
  }
}

function stripAttr(attrs, name) {
  if (!attrs || !attrs.length) return attrs;
  return attrs.filter(([key]) => key !== name);
}

function stripAttrs(attrs, names) {
  if (!attrs || !attrs.length) return attrs;
  return attrs.filter(([key]) => !names.includes(key));
}

function getClassList(attrs) {
  const entry = (attrs || []).find(([key]) => key === "class");
  if (!entry || !entry[1]) return [];
  return entry[1].split(/\s+/);
}

function getAllowedAttrs(classList, allowlist) {
  const allow = new Set();
  for (const rule of allowlist) {
    if (rule.classes.some((value) => classList.includes(value))) {
      rule.attrs.forEach((attr) => allow.add(attr));
    }
  }
  return Array.from(allow);
}

function compareSection(label, originalNode, builtNode, diffs, options) {
  const normA = normalizeNode(originalNode);
  const normB = normalizeNode(builtNode);
  compareNodes(normA, normB, label, diffs, options);
}

function compareScripts(originalScripts, builtScripts, diffs, options) {
  if (originalScripts.length !== builtScripts.length) {
    diffs.push(
      `scripts: count ${originalScripts.length} !== ${builtScripts.length}`
    );
  }
  const len = Math.max(originalScripts.length, builtScripts.length);
  for (let i = 0; i < len; i += 1) {
    const a = normalizeNode(originalScripts[i]);
    const b = normalizeNode(builtScripts[i]);
    compareNodes(a, b, `scripts[${i}]`, diffs, options);
  }
}

function readHtml(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function run() {
  let failed = false;
  for (const page of PAGES) {
    const originalPath = path.join(ORIGINAL_DIR, page.original);
    const builtPath = path.join(BUILT_DIR, page.built);
    const originalHtml = readHtml(originalPath);
    const builtHtml = readHtml(builtPath);

    const originalDoc = parse(originalHtml);
    const builtDoc = parse(builtHtml);

    const originalBody = getBody(originalDoc);
    const builtBody = getBody(builtDoc);
    const originalHead = getHead(originalDoc);
    const builtHead = getHead(builtDoc);

    const originalSkip = getSkipLink(originalBody);
    const builtSkip = getSkipLink(builtBody);
    const originalHeader = getSection(originalBody, "header");
    const builtHeader = getSection(builtBody, "header");
    const originalMain = getSection(originalBody, "main");
    const builtMain = getSection(builtBody, "main");
    const originalFooter = getSection(originalBody, "footer");
    const builtFooter = getSection(builtBody, "footer");
    const originalNoScript = getSection(originalBody, "noscript");
    const builtNoScript = getSection(builtBody, "noscript");

    const diffs = [];
    const anchorAttrAllowlist = [
      {
        classes: ["navbar__menu-link", "footer__link"],
        attrs: ["href", "target", "rel"],
      },
      {
        classes: ["social-icon"],
        attrs: ["href", "target", "rel", "aria-label"],
      },
      {
        classes: [
          "btn",
          "btn-p",
          "btn-s",
          "btn--primary",
          "btn--secondary",
          "btn--white",
          "product-btn-solid",
          "product-btn-outline",
        ],
        attrs: ["href", "target", "rel"],
      },
    ];
    const imageAttrAllowlist = [
      {
        classes: [
          "navbar__logo-image",
          "navbar__logo-image--brand",
          "footer__logo-image",
          "footer__logo-image--brand",
        ],
        attrs: ["src", "alt"],
      },
      {
        classes: ["about-hero__bg-image", "breakout-image"],
        attrs: ["src", "alt"],
      },
      {
        classes: ["lb-hero__image", "lb-editorial__visual-image"],
        attrs: ["src", "alt"],
      },
      {
        classes: ["leda-hero__bg-image", "split-section__image", "usp-card__image", "usp-card__icon", "split-section__logo", "ticker__logo"],
        attrs: ["src", "alt"],
      },
    ];
    const videoAttrAllowlist = [
      {
        classes: ["split-section__image"],
        attrs: ["src", "poster"],
      },
    ];
    const baseOptions = {
      ignoreScriptDefer: true,
      anchorAttrAllowlist,
      imageAttrAllowlist,
      videoAttrAllowlist,
    };
    const headerFooterOptions = {
      ...baseOptions,
      ignoreText: true,
    };
    const mainOptions = page.allowTextDiff
      ? {
          ...baseOptions,
          ignoreText: true,
          ignoreImageAttrs: Boolean(page.allowImageAttrs),
        }
      : baseOptions;

    compareHead(originalHead, builtHead, diffs);
    compareSection("skip-link", originalSkip, builtSkip, diffs, baseOptions);
    compareSection("header", originalHeader, builtHeader, diffs, headerFooterOptions);
    compareSection("main", originalMain, builtMain, diffs, mainOptions);
    compareSection("footer", originalFooter, builtFooter, diffs, headerFooterOptions);
    compareSection("noscript", originalNoScript, builtNoScript, diffs, baseOptions);

    const originalScripts = getScripts(originalBody);
    const builtScripts = getScripts(builtBody).filter(
      (node) => !isInternalNextScript(node)
    );
    compareScripts(originalScripts, builtScripts, diffs, baseOptions);

    if (diffs.length === 0) {
      console.log(`PASS ${page.route}`);
    } else {
      failed = true;
      console.log(`FAIL ${page.route}`);
      diffs.slice(0, 20).forEach((diff) => console.log(`  ${diff}`));
      if (diffs.length > 20) {
        console.log(`  ...and ${diffs.length - 20} more`);
      }
    }
  }

  if (failed) {
    process.exit(1);
  }
}

run();
