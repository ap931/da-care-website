const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parse } = require("parse5");
const { createClient } = require("@sanity/client");

const ROOT = process.cwd();
const HTML_PATH = path.join(ROOT, "content", "leda.html");
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

function getImagePath(src) {
  if (!src) return null;
  const trimmed = src.trim();
  if (trimmed.startsWith("/")) {
    return path.join(ROOT, "public", trimmed.replace(/^\//, ""));
  }
  return path.join(ROOT, "public", trimmed);
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

async function buildLedaDoc() {
  if (!fs.existsSync(HTML_PATH)) {
    throw new Error(`Missing source HTML: ${HTML_PATH}`);
  }
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const doc = parse(html);
  const body = findFirst(doc, (node) => node.tagName === "body");

  const hero = findByClass(body, "leda-hero");
  const heroTitle = normalizeText(textContent(firstTag(hero, "h1")));
  const heroDesc = normalizeText(textContent(findByClass(hero, "leda-hero__description")));
  const heroCta = findFirst(hero, (node) => node.tagName === "a");
  const heroBg = findByClass(hero, "leda-hero__bg-image");
  const heroBgSrc = getAttr(heroBg, "src");
  const heroBgAlt = getAttr(heroBg, "alt");

  const splitVideo = findByClass(body, "leda-split-video");
  const splitTitle = normalizeText(textContent(firstTag(splitVideo, "h2")));
  const splitBody = normalizeText(textContent(firstTag(splitVideo, "p")));
  const splitVideoEl = firstTag(splitVideo, "video");
  const splitVideoSrc = getAttr(splitVideoEl, "src");

  const benefitsCarousel = findFirst(body, (node) => getAttr(node, "id") === "carousel-a");
  const benefitCards = findAllByClass(benefitsCarousel, "usp-card").map((card) => {
    const images = findAll(card, (node) => node.tagName === "img");
    const main = images[0];
    const icon = images[1];
    const overlay = findByClass(card, "usp-card__overlay-top");
    return {
      _key: key(),
      image: {
        src: getAttr(main, "src"),
        alt: getAttr(main, "alt"),
      },
      icon: {
        src: getAttr(icon, "src"),
        alt: getAttr(icon, "alt"),
      },
      title: normalizeText(textContent(firstTag(card, "h4"))),
      body: normalizeText(textContent(firstTag(card, "p"))),
      overlay: overlay ? normalizeText(textContent(overlay)) : "",
    };
  });

  const appsSection = findByClass(body, "split-section--2-3");
  const appsImage = findByClass(appsSection, "split-section__image");
  const appsHeading = firstTag(appsSection, "h2");
  const appsSpans = (appsHeading?.childNodes || []).filter((node) => node.tagName === "span");
  const appsBody = normalizeText(textContent(firstTag(appsSection, "p")));
  const appsLabel = normalizeText(textContent(findByClass(appsSection, "split-section__label")));
  const logos = findAllByClass(appsSection, "split-section__logo").map((img) => ({
    _key: key(),
    src: getAttr(img, "src"),
    alt: getAttr(img, "alt"),
  }));

  const modulesCarousel = findFirst(body, (node) => getAttr(node, "id") === "carousel-b");
  const modules = findAllByClass(modulesCarousel, "usp-card").map((card) => {
    const images = findAll(card, (node) => node.tagName === "img");
    return {
      _key: key(),
      image: {
        src: getAttr(images[0], "src"),
        alt: getAttr(images[0], "alt"),
      },
      icon: {
        src: getAttr(images[1], "src"),
        alt: getAttr(images[1], "alt"),
      },
      body: normalizeText(textContent(firstTag(card, "p"))),
    };
  });

  const bento = findByClass(body, "bento-grid");
  const bentoContent = findAllByClass(bento, "bento-content");
  const row1 = bentoContent[0];
  const row2 = bentoContent[1];
  const row3 = bentoContent[2];

  const privacy = findByClass(body, "wide-image-section");
  const privacyHeader = findByClass(privacy, "wide-image-section__header");
  const privacyCard = findByClass(privacy, "privacy-data-card");
  const privacyValues = findAllByClass(privacyCard, "privacy-data-card__value");
  const privacyStations = findAllByClass(privacy, "privacy-station__label");
  const privacyStageLabels = findAllByClass(privacy, "privacy-stage-label");

  const finalCta = findByClass(body, "cta-simple");
  const finalImage = firstTag(finalCta, "img");
  const finalLink = findFirst(finalCta, (node) => node.tagName === "a");

  const heroAssetId = await ensureImageAsset(heroBgSrc);
  const benefitAssets = await Promise.all(
    benefitCards.map(async (item) => ({
      image: await ensureImageAsset(item.image.src),
      icon: await ensureImageAsset(item.icon.src),
    }))
  );
  const appsImageAsset = await ensureImageAsset(getAttr(appsImage, "src"));
  const logoAssets = await Promise.all(
    logos.map((logo) => ensureImageAsset(logo.src))
  );
  const moduleAssets = await Promise.all(
    modules.map(async (item) => ({
      image: await ensureImageAsset(item.image.src),
      icon: await ensureImageAsset(item.icon.src),
    }))
  );
  const finalImageAsset = await ensureImageAsset(getAttr(finalImage, "src"));

  return {
    _id: "ledaPage",
    _type: "ledaPage",
    hero: {
      title: heroTitle || undefined,
      description: heroDesc || undefined,
      cta: {
        label: normalizeText(textContent(heroCta)) || undefined,
        href: getAttr(heroCta, "href") || undefined,
      },
      background: heroAssetId
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: heroAssetId },
            ...(heroBgAlt ? { alt: heroBgAlt } : {}),
          }
        : undefined,
    },
    splitVideo: {
      title: splitTitle || undefined,
      body: splitBody || undefined,
      video: splitVideoSrc || undefined,
    },
    benefits: {
      items: benefitCards.map((item, index) => ({
        _key: key(),
        image: benefitAssets[index].image
          ? {
              _type: "image",
              asset: { _type: "reference", _ref: benefitAssets[index].image },
              ...(item.image.alt ? { alt: item.image.alt } : {}),
            }
          : undefined,
        icon: benefitAssets[index].icon
          ? {
              _type: "image",
              asset: { _type: "reference", _ref: benefitAssets[index].icon },
              ...(item.icon.alt ? { alt: item.icon.alt } : {}),
            }
          : undefined,
        title: item.title || undefined,
        body: item.body || undefined,
        overlay: item.overlay || undefined,
      })),
    },
    apps: {
      image: appsImageAsset
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: appsImageAsset },
            ...(getAttr(appsImage, "alt") ? { alt: getAttr(appsImage, "alt") } : {}),
          }
        : undefined,
      titleLine1: normalizeText(textContent(appsSpans[0])) || undefined,
      titleLine2: normalizeText(textContent(appsSpans[1])) || undefined,
      body: appsBody || undefined,
      label: appsLabel || undefined,
      logos: logoAssets.map((assetId, index) => ({
        _key: key(),
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
        ...(logos[index]?.alt ? { alt: logos[index].alt } : {}),
      })),
    },
    modules: {
      items: modules.map((item, index) => ({
        _key: key(),
        image: moduleAssets[index].image
          ? {
              _type: "image",
              asset: { _type: "reference", _ref: moduleAssets[index].image },
              ...(item.image.alt ? { alt: item.image.alt } : {}),
            }
          : undefined,
        icon: moduleAssets[index].icon
          ? {
              _type: "image",
              asset: { _type: "reference", _ref: moduleAssets[index].icon },
              ...(item.icon.alt ? { alt: item.icon.alt } : {}),
            }
          : undefined,
        body: item.body || undefined,
      })),
    },
    bento: {
      row1Title: normalizeText(textContent(firstTag(row1, "h3"))) || undefined,
      row1Body: normalizeText(textContent(firstTag(row1, "p"))) || undefined,
      row2Title: normalizeText(textContent(firstTag(row2, "h3"))) || undefined,
      row2Body: normalizeText(textContent(firstTag(row2, "p"))) || undefined,
      row3Title: normalizeText(textContent(firstTag(row3, "h3"))) || undefined,
      tickerLabel: normalizeText(textContent(firstTag(row3, "h3"))) || undefined,
    },
    privacy: {
      title: normalizeText(textContent(firstTag(privacyHeader, "h2"))) || undefined,
      body: normalizeText(textContent(firstTag(privacyHeader, "p"))) || undefined,
      card: {
        name: normalizeText(textContent(privacyValues[0])) || undefined,
        id: normalizeText(textContent(privacyValues[1])) || undefined,
        context: normalizeText(textContent(privacyValues[2])) || undefined,
      },
      stations: {
        user: normalizeText(textContent(privacyStations[0])) || undefined,
        security: normalizeText(textContent(privacyStations[1])) || undefined,
        ai: normalizeText(textContent(privacyStations[2])) || undefined,
        encrypt: normalizeText(textContent(firstTag(privacyStageLabels[0], "span"))) || undefined,
        strip: normalizeText(textContent(firstTag(privacyStageLabels[1], "span"))) || undefined,
      },
    },
    finalCta: {
      title: normalizeText(textContent(firstTag(finalCta, "h2"))) || undefined,
      body: normalizeText(textContent(firstTag(finalCta, "p"))) || undefined,
      cta: {
        label: normalizeText(textContent(finalLink)) || undefined,
        href: getAttr(finalLink, "href") || undefined,
      },
      image: finalImageAsset
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: finalImageAsset },
            ...(getAttr(finalImage, "alt") ? { alt: getAttr(finalImage, "alt") } : {}),
          }
        : undefined,
    },
  };
}

async function run() {
  const doc = await buildLedaDoc();
  await client.createOrReplace(doc);
  console.log("Leda Page seeded in Sanity.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
