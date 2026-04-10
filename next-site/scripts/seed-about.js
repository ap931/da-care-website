const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("parse5");
const { createClient } = require("@sanity/client");

const ROOT = process.cwd();
const HTML_PATH = path.join(ROOT, "content", "about.html");
const ENV_FILES = [
  path.join(ROOT, ".env.local"),
  path.join(ROOT, ".env"),
];

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

function normalizePrefix(value) {
  const collapsed = value.replace(/\s+/g, " ");
  return collapsed.replace(/^\s+/, "");
}

function findByClass(root, className) {
  return findFirst(root, (node) => hasClass(node, className));
}

function findAllByClass(root, className) {
  return findAll(root, (node) => hasClass(node, className));
}

function findWithin(root, className) {
  return findFirst(root, (node) => hasClass(node, className));
}

function getImagePath(src) {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed.startsWith("/")) return null;
  return path.join(ROOT, "public", trimmed.replace(/^\//, ""));
}

async function ensureImageAsset(src) {
  if (!src) return null;
  const filePath = getImagePath(src);
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn(`Image not found: ${src}`);
    return null;
  }
  const filename = path.basename(filePath);
  const existing = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $name][0]{_id}',
    { name: filename }
  );
  if (existing && existing._id) return existing._id;
  const stream = fs.createReadStream(filePath);
  const asset = await client.assets.upload("image", stream, { filename });
  return asset._id;
}

function firstTag(root, tagName) {
  return findFirst(root, (node) => node.tagName === tagName);
}

function allTags(root, tagName) {
  return findAll(root, (node) => node.tagName === tagName);
}

async function buildAboutDoc() {
  if (!fs.existsSync(HTML_PATH)) {
    throw new Error(`Missing source HTML: ${HTML_PATH}`);
  }
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const doc = parse(html);
  const body = findFirst(doc, (node) => node.tagName === "body");

  const heroSection = findByClass(body, "about-hero");
  const heroTitle = normalizeText(textContent(firstTag(heroSection, "h1")));
  const heroDescNode = findWithin(heroSection, "about-hero__description");
  const heroDescription = normalizeText(textContent(heroDescNode));
  const heroCta = findFirst(
    heroSection,
    (node) => node.tagName === "a" && hasClass(node, "btn--primary")
  );
  const heroCtaLabel = normalizeText(textContent(heroCta));
  const heroCtaHref = getAttr(heroCta, "href") || null;
  const heroBg = findWithin(heroSection, "about-hero__bg-image");
  const heroBgSrc = getAttr(heroBg, "src");
  const heroBgAlt = getAttr(heroBg, "alt");

  const longForm = findByClass(body, "long-form-section");
  const wrappers = findAllByClass(longForm, "content-wrapper");
  const firstWrapper = wrappers[0];
  const secondWrapper = wrappers[1];

  const introBlock = findWithin(firstWrapper, "intro-block");
  const manifestoTitle = normalizeText(textContent(firstTag(introBlock, "h2")));
  const manifestoBody = normalizeText(textContent(firstTag(introBlock, "p")));

  const sectionTitleBlock = findWithin(firstWrapper, "section-title-block");
  const valuesTitle = normalizeText(textContent(firstTag(sectionTitleBlock, "h2")));
  const listBlock = findWithin(firstWrapper, "list-block");
  const infoItems = findAllByClass(listBlock, "info-item");
  const valuesItems = infoItems.map((item) => {
    const term = normalizeText(textContent(firstTag(item, "dt")));
    const definition = normalizeText(textContent(firstTag(item, "dd")));
    return { term, definition };
  });

  const textBlocksFirst = findAllByClass(firstWrapper, "text-block");
  const originBlock = textBlocksFirst[0];
  const originTitle = normalizeText(textContent(firstTag(originBlock, "h2")));
  const originParagraphs = allTags(originBlock, "p").map((p) =>
    normalizeText(textContent(p))
  );

  const breakoutImage = findByClass(longForm, "breakout-image");
  const breakoutSrc = getAttr(breakoutImage, "src");
  const breakoutAlt = getAttr(breakoutImage, "alt");

  const textBlocksSecond = findAllByClass(secondWrapper, "text-block");
  const workingBlock = textBlocksSecond[0];
  const workingTitle = normalizeText(textContent(firstTag(workingBlock, "h2")));
  const workingHeads = allTags(workingBlock, "h4");
  const workingParas = allTags(workingBlock, "p");
  const workingItems = workingHeads.map((head, index) => ({
    title: normalizeText(textContent(head)),
    body: normalizeText(textContent(workingParas[index])),
  }));

  const teamBlock = textBlocksSecond[1];
  const teamTitle = normalizeText(textContent(firstTag(teamBlock, "h2")));
  const teamParas = allTags(teamBlock, "p");
  const teamParagraph1 = normalizeText(textContent(teamParas[0]));
  const teamLink = findFirst(teamParas[1], (node) => node.tagName === "a");
  const teamLinkLabel = normalizeText(textContent(teamLink));
  const teamLinkHref = getAttr(teamLink, "href") || null;
  const prefixText = teamParas[1]
    ? normalizePrefix(
        (teamParas[1].childNodes || [])
          .filter((child) => child.nodeName === "#text")
          .map((child) => child.value || "")
          .join("")
      )
    : "";

  const heroAssetId = await ensureImageAsset(heroBgSrc);
  const breakoutAssetId = await ensureImageAsset(breakoutSrc);

  return {
    _id: "aboutPage",
    _type: "aboutPage",
    hero: {
      title: heroTitle || undefined,
      description: heroDescription || undefined,
      cta: {
        label: heroCtaLabel || undefined,
        href: heroCtaHref || undefined,
      },
      background: heroAssetId
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: heroAssetId },
            ...(heroBgAlt ? { alt: heroBgAlt } : {}),
          }
        : undefined,
    },
    manifesto: {
      title: manifestoTitle || undefined,
      body: manifestoBody || undefined,
    },
    values: {
      title: valuesTitle || undefined,
      items: valuesItems,
    },
    origin: {
      title: originTitle || undefined,
      paragraphs: originParagraphs,
    },
    breakoutImage: breakoutAssetId
      ? {
          _type: "image",
          asset: { _type: "reference", _ref: breakoutAssetId },
          ...(breakoutAlt ? { alt: breakoutAlt } : {}),
        }
      : undefined,
    working: {
      title: workingTitle || undefined,
      items: workingItems,
    },
    teamSpirit: {
      title: teamTitle || undefined,
      paragraph1: teamParagraph1 || undefined,
      linkPrefix: prefixText || undefined,
      linkLabel: teamLinkLabel || undefined,
      linkHref: teamLinkHref || undefined,
    },
  };
}

async function run() {
  const doc = await buildAboutDoc();
  await client.createOrReplace(doc);
  console.log("About Page seeded in Sanity.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
