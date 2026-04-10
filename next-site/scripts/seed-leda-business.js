const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parse } = require("parse5");
const { createClient } = require("@sanity/client");

const ROOT = process.cwd();
const HTML_PATH = path.join(ROOT, "content", "leda-business.html");
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

function textFromTextNodes(node) {
  if (!node) return "";
  return (node.childNodes || [])
    .filter((child) => child.nodeName === "#text")
    .map((child) => child.value || "")
    .join("");
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

async function buildLedaBusinessDoc() {
  if (!fs.existsSync(HTML_PATH)) {
    throw new Error(`Missing source HTML: ${HTML_PATH}`);
  }
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const doc = parse(html);
  const body = findFirst(doc, (node) => node.tagName === "body");

  const hero = findByClass(body, "lb-hero");
  const heroBadge = normalizeText(textContent(findByClass(hero, "lb-hero__badge")));
  const heroTitleNode = findByClass(hero, "lb-hero__title");
  const heroTitlePrefix = normalizeText(textFromTextNodes(heroTitleNode));
  const heroTitleAccent = normalizeText(
    textContent(findByClass(hero, "lb-hero__accent"))
  );
  const heroSubtitle = normalizeText(
    textContent(findByClass(hero, "lb-hero__subtitle"))
  );
  const heroActions = findByClass(hero, "lb-hero__actions");
  const heroLinks = findAll(heroActions, (node) => node.tagName === "a");
  const heroPrimary = heroLinks[0];
  const heroSecondary = heroLinks[1];
  const heroPrimaryLabel = normalizeText(textContent(heroPrimary));
  const heroPrimaryHref = getAttr(heroPrimary, "href") || null;
  const heroSecondaryLabel = normalizeText(textContent(heroSecondary));
  const heroSecondaryHref = getAttr(heroSecondary, "href") || null;
  const trust = findByClass(hero, "lb-hero__trust");
  const trustItems = findAll(trust, (node) => node.tagName === "span").map(
    (span) => ({
      _key: key(),
      text: normalizeText(textContent(span)),
    })
  );
  const heroImage = findByClass(hero, "lb-hero__image");
  const heroImageSrc = getAttr(heroImage, "src");
  const heroImageAlt = getAttr(heroImage, "alt");

  const dividerLabels = findAllByClass(body, "lb-divider__label").map((node) =>
    normalizeText(textContent(node))
  );

  const features = findByClass(body, "lb-features");
  const featuresLabel = normalizeText(
    textContent(findByClass(features, "lb-section__label"))
  );
  const featuresTitle = normalizeText(textContent(firstTag(features, "h2")));
  const featuresIntro = normalizeText(
    textContent(findByClass(features, "lb-section__header-right"))
  );
  const featureCards = findAllByClass(features, "lb-feature-card").map((card) => ({
    _key: key(),
    icon: normalizeText(textContent(findByClass(card, "lb-feature-card__icon"))),
    title: normalizeText(textContent(firstTag(card, "h3"))),
    body: normalizeText(textContent(firstTag(card, "p"))),
  }));

  const problem = findByClass(body, "lb-image-cards");
  const problemLabel = normalizeText(
    textContent(findByClass(problem, "lb-section__label"))
  );
  const problemTitle = normalizeText(textContent(firstTag(problem, "h2")));
  const problemIntro = normalizeText(textContent(firstTag(problem, "p")));
  const problemCards = findAllByClass(problem, "lb-image-card").map((card) => ({
    _key: key(),
    tag: normalizeText(textContent(findByClass(card, "lb-image-card__tag"))),
    value: normalizeText(textContent(findByClass(card, "lb-image-card__icon"))),
    description: normalizeText(textContent(firstTag(card, "p"))),
  }));

  const how = findByClass(body, "lb-editorial");
  const howLabel = normalizeText(textContent(findByClass(how, "lb-section__label")));
  const howTitle = normalizeText(textContent(firstTag(how, "h2")));
  const howIntro = normalizeText(textContent(firstTag(how, "p")));
  const howSteps = findAllByClass(how, "lb-editorial__item").map((item) => ({
    _key: key(),
    index: normalizeText(textContent(findByClass(item, "lb-editorial__index"))),
    title: normalizeText(textContent(findByClass(item, "lb-editorial__title"))),
    body: normalizeText(textContent(firstTag(item, "p"))),
  }));
  const howImage = findByClass(how, "lb-editorial__visual-image");
  const howImageSrc = getAttr(howImage, "src");
  const howImageAlt = getAttr(howImage, "alt");

  const why = findByClass(body, "lb-showcase");
  const whyLabel = normalizeText(textContent(findByClass(why, "lb-section__label")));
  const whyTitle = normalizeText(textContent(firstTag(why, "h2")));
  const whyIntro = normalizeText(textContent(firstTag(why, "p")));
  const whyCards = findAllByClass(why, "lb-showcase-card").map((card) => ({
    _key: key(),
    ghost: normalizeText(textContent(findByClass(card, "lb-showcase-card__ghost"))),
    icon: normalizeText(textContent(findByClass(card, "lb-showcase-card__icon"))),
    title: normalizeText(textContent(firstTag(card, "h3"))),
    label: normalizeText(textContent(findByClass(card, "lb-showcase-card__label"))),
    body: normalizeText(textContent(firstTag(card, "p"))),
  }));

  const ecosystem = findByClass(body, "lb-details");
  const ecosystemLabel = normalizeText(
    textContent(findByClass(ecosystem, "lb-section__label"))
  );
  const ecosystemTitle = normalizeText(textContent(firstTag(ecosystem, "h2")));
  const ecosystemIntro = normalizeText(textContent(firstTag(ecosystem, "p")));
  const ecosystemRows = findAllByClass(ecosystem, "lb-detail__row").map((row) => {
    const heading = firstTag(row, "h3");
    return {
      _key: key(),
      title: normalizeText(textFromTextNodes(heading)),
      tag: normalizeText(textContent(findByClass(row, "lb-detail__tag"))),
      body: normalizeText(textContent(firstTag(row, "p"))),
    };
  });

  const pricing = findByClass(body, "lb-pricing");
  const pricingPill = normalizeText(
    textContent(findByClass(pricing, "lb-pricing__pill"))
  );
  const pricingTitle = normalizeText(textContent(firstTag(pricing, "h2")));
  const pricingIntro = normalizeText(textContent(firstTag(pricing, "p")));
  const pricingCards = findAllByClass(pricing, "lb-pricing__card").map((card) => {
    const features = findByClass(card, "lb-pricing__features");
    const featureItems = findAll(features, (node) => node.tagName === "li").map(
      (li) => ({
        _key: key(),
        text: normalizeText(textContent(li)),
      })
    );
    const cta = findByClass(card, "lb-pricing__cta");
    return {
      _key: key(),
      badge: normalizeText(textContent(findByClass(card, "lb-pricing__badge"))),
      tier: normalizeText(textContent(findByClass(card, "lb-pricing__tier"))),
      price: normalizeText(textContent(findByClass(card, "lb-pricing__price"))),
      note: normalizeText(textContent(findByClass(card, "lb-pricing__note"))),
      description: normalizeText(textContent(findByClass(card, "lb-pricing__desc"))),
      features: featureItems,
      cta: {
        label: normalizeText(textContent(cta)),
        href: getAttr(cta, "href") || null,
      },
    };
  });
  const pricingFootnote = normalizeText(
    textContent(findByClass(pricing, "lb-pricing__footnote"))
  );

  const heroAssetId = await ensureImageAsset(heroImageSrc);
  const howAssetId = await ensureImageAsset(howImageSrc);

  return {
    _id: "ledaBusinessPage",
    _type: "ledaBusinessPage",
    hero: {
      badge: heroBadge || undefined,
      titlePrefix: heroTitlePrefix || undefined,
      titleAccent: heroTitleAccent || undefined,
      subtitle: heroSubtitle || undefined,
      primaryCta: {
        label: heroPrimaryLabel || undefined,
        href: heroPrimaryHref || undefined,
      },
      secondaryCta: {
        label: heroSecondaryLabel || undefined,
        href: heroSecondaryHref || undefined,
      },
      trust: trustItems,
      image: heroAssetId
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: heroAssetId },
            ...(heroImageAlt ? { alt: heroImageAlt } : {}),
          }
        : undefined,
    },
    dividers: {
      features: dividerLabels[0],
      problem: dividerLabels[1],
      howItWorks: dividerLabels[2],
      why: dividerLabels[3],
      ecosystem: dividerLabels[4],
      pricing: dividerLabels[5],
    },
    features: {
      label: featuresLabel || undefined,
      title: featuresTitle || undefined,
      intro: featuresIntro || undefined,
      items: featureCards,
    },
    problem: {
      label: problemLabel || undefined,
      title: problemTitle || undefined,
      intro: problemIntro || undefined,
      cards: problemCards,
    },
    howItWorks: {
      label: howLabel || undefined,
      title: howTitle || undefined,
      intro: howIntro || undefined,
      steps: howSteps,
      image: howAssetId
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: howAssetId },
            ...(howImageAlt ? { alt: howImageAlt } : {}),
          }
        : undefined,
    },
    why: {
      label: whyLabel || undefined,
      title: whyTitle || undefined,
      intro: whyIntro || undefined,
      cards: whyCards,
    },
    ecosystem: {
      label: ecosystemLabel || undefined,
      title: ecosystemTitle || undefined,
      intro: ecosystemIntro || undefined,
      rows: ecosystemRows,
    },
    pricing: {
      pill: pricingPill || undefined,
      title: pricingTitle || undefined,
      intro: pricingIntro || undefined,
      cards: pricingCards,
      footnote: pricingFootnote || undefined,
    },
  };
}

async function run() {
  const doc = await buildLedaBusinessDoc();
  await client.createOrReplace(doc);
  console.log("Leda Business Page seeded in Sanity.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
