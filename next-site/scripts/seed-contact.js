const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parse } = require("parse5");
const { createClient } = require("@sanity/client");

const ROOT = process.cwd();
const HTML_PATH = path.join(ROOT, "content", "contact.html");
const ENV_FILES = [path.join(ROOT, ".env.local"), path.join(ROOT, ".env")];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

ENV_FILES.forEach(loadEnvFile);

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION || "2026-03-01";

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity credentials.");
  console.error("Ensure SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_TOKEN are set.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

function key() {
  return crypto.randomUUID();
}

function getAttr(node, name) {
  const attr = (node.attrs || []).find((item) => item.name === name);
  return attr ? attr.value : null;
}

function getClassList(node) {
  const className = getAttr(node, "class");
  if (!className) return [];
  return className.split(/\s+/).filter(Boolean);
}

function hasClass(node, className) {
  return getClassList(node).includes(className);
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

function textContent(node) {
  if (!node) return "";
  if (node.nodeName === "#text") return node.value || "";
  return (node.childNodes || []).map(textContent).join("");
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function findByClass(root, className) {
  return findFirst(root, (node) => hasClass(node, className));
}

function findAllByClass(root, className) {
  return findAll(root, (node) => hasClass(node, className));
}

function firstTag(root, tagName) {
  return findFirst(root, (node) => node.tagName === tagName);
}

function allTags(root, tagName) {
  return findAll(root, (node) => node.tagName === tagName);
}

function extractParagraphLines(node) {
  if (!node) return [];
  const lines = [];
  let current = "";
  (node.childNodes || []).forEach((child) => {
    if (child.nodeName === "#text") {
      current += child.value || "";
      return;
    }
    if (child.tagName === "br") {
      lines.push(normalizeText(current));
      current = "";
    }
  });
  if (current || lines.length) {
    lines.push(normalizeText(current));
  }
  return lines.filter((line) => line.length > 0);
}

async function buildContactDoc() {
  if (!fs.existsSync(HTML_PATH)) {
    throw new Error(`Missing source HTML: ${HTML_PATH}`);
  }
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const doc = parse(html);
  const body = findFirst(doc, (node) => node.tagName === "body");

  const hero = findByClass(body, "contact-hero");
  const heroTitle = normalizeText(textContent(firstTag(hero, "h1")));
  const heroDesc = normalizeText(
    textContent(findByClass(hero, "contact-hero__description"))
  );
  const heroCta = findFirst(
    hero,
    (node) => node.tagName === "a" && hasClass(node, "btn--primary")
  );
  const heroCtaLabel = normalizeText(textContent(heroCta));
  const heroCtaHref = getAttr(heroCta, "href") || null;

  const methods = findByClass(body, "contact-methods");
  const cards = findAllByClass(methods, "contact-method");
  const locations = cards.map((card) => {
    const heading = normalizeText(textContent(firstTag(card, "h3")));
    const paragraph = firstTag(card, "p");
    const lines = extractParagraphLines(paragraph);
    return {
      _key: key(),
      name: heading || undefined,
      line1: lines[0] || "",
      line2: lines[1] || "",
      line3: lines[2] || "",
    };
  });

  const faqSection = findByClass(body, "faq-section");
  const faqTitle = normalizeText(textContent(findByClass(faqSection, "faq-title")));
  const faqItems = findAllByClass(faqSection, "accordion__item").map((item) => {
    const question = normalizeText(textContent(firstTag(item, "h3")));
    const answer = normalizeText(textContent(firstTag(item, "p")));
    return {
      _key: key(),
      question: question || undefined,
      answer: answer || undefined,
    };
  });

  return {
    _id: "contactPage",
    _type: "contactPage",
    hero: {
      title: heroTitle || undefined,
      description: heroDesc || undefined,
      cta: {
        label: heroCtaLabel || undefined,
        href: heroCtaHref || undefined,
      },
    },
    locations,
    faq: {
      title: faqTitle || undefined,
      items: faqItems,
    },
  };
}

async function run() {
  const doc = await buildContactDoc();
  await client.createOrReplace(doc);
  console.log("Contact Page seeded in Sanity.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
