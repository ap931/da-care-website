import fs from "node:fs";
import path from "node:path";

function parseStyle(styleText) {
  if (!styleText) return undefined;
  const style = {};
  styleText.split(";").forEach((part) => {
    const [rawProp, rawValue] = part.split(":");
    if (!rawProp || !rawValue) return;
    const prop = rawProp.trim();
    const value = rawValue.trim();
    if (!prop || !value) return;
    if (prop.startsWith("--")) {
      style[prop] = value;
      return;
    }
    const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[camelProp] = value;
  });
  return Object.keys(style).length ? style : undefined;
}

function parseAttributes(attrString) {
  const props = {};
  if (!attrString) return props;
  const attrRegex = /([^\s=]+)(?:="([^"]*)")?/g;
  let match;
  while ((match = attrRegex.exec(attrString))) {
    const name = match[1];
    const value = match[2];
    if (name === "class") {
      props.className = value || "";
      continue;
    }
    if (name === "style") {
      const style = parseStyle(value || "");
      if (style) props.style = style;
      continue;
    }
    if (value === undefined) {
      props[name] = "";
      continue;
    }
    props[name] = value;
  }
  return props;
}

function extractTag(bodyHtml, tag) {
  const match = bodyHtml.match(
    new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "i")
  );
  if (!match) return null;
  return {
    props: parseAttributes(match[1]),
    inner: match[2],
  };
}

function extractSkipLink(bodyHtml) {
  const match = bodyHtml.match(
    /<a([^>]*)class="([^"]*\bskip-link\b[^"]*)"([^>]*)>([\s\S]*?)<\/a>/i
  );
  if (!match) return null;
  const attrString = `${match[1]}class="${match[2]}"${match[3]}`;
  return {
    props: parseAttributes(attrString),
    inner: match[4],
  };
}

function extractScripts(bodyHtml) {
  const scripts = [];
  const scriptRegex = /<script([^>]*)><\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(bodyHtml))) {
    scripts.push(parseAttributes(match[1]));
  }
  return scripts;
}

export function getPageParts(fileName, options = {}) {
  const { transform } = options;
  let html = fs.readFileSync(
    path.join(process.cwd(), "content", fileName),
    "utf8"
  );
  if (typeof transform === "function") {
    const nextHtml = transform(html);
    if (typeof nextHtml === "string") {
      html = nextHtml;
    }
  }
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : "";

  return {
    skipLink: extractSkipLink(bodyHtml),
    header: extractTag(bodyHtml, "header"),
    main: extractTag(bodyHtml, "main"),
    footer: extractTag(bodyHtml, "footer"),
    noscript: extractTag(bodyHtml, "noscript"),
    scripts: extractScripts(bodyHtml),
  };
}
