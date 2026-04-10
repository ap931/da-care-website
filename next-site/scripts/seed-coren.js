const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parse } = require("parse5");
const { createClient } = require("@sanity/client");

const ROOT = process.cwd();
const HTML_PATH = path.join(ROOT, "content", "coren.html");
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

function findSectionByLabel(root, label) {
  return findFirst(root, (node) => {
    if (node.tagName !== "section") return false;
    return getAttr(node, "aria-label") === label;
  });
}

function extractChecklistGroups(checklist) {
  const groups = [];
  let current = null;
  for (const child of checklist.childNodes || []) {
    if (child.tagName === "li" && hasClass(child, "coren-checklist__category")) {
      current = {
        _key: key(),
        category: normalizeText(textContent(child)),
        items: [],
      };
      groups.push(current);
    }
    if (child.tagName === "ul" && current) {
      const items = findAll(child, (node) => hasClass(node, "coren-checklist__item"));
      current.items = items.map((li) => ({
        _key: key(),
        text: normalizeText(textContent(li)),
      }));
    }
  }
  return groups;
}

async function buildCorenDoc() {
  if (!fs.existsSync(HTML_PATH)) {
    throw new Error(`Missing source HTML: ${HTML_PATH}`);
  }
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const doc = parse(html);
  const body = findFirst(doc, (node) => node.tagName === "body");

  const hero = findByClass(body, "coren-hero");
  const heroTitle = normalizeText(textContent(firstTag(hero, "h1")));
  const heroSubtitle = normalizeText(textContent(firstTag(hero, "p")));
  const heroActions = findByClass(hero, "coren-hero__actions");
  const heroLinks = findAll(heroActions, (node) => node.tagName === "a");
  const heroTrust = findByClass(hero, "coren-trust-markers");
  const heroTrustItems = findAll(heroTrust, (node) => node.tagName === "span").map(
    (span) => ({
      _key: key(),
      text: normalizeText(textContent(span)),
    })
  );
  const heroCard = findByClass(hero, "coren-hero__card");
  const heroBadge = normalizeText(textContent(findByClass(heroCard, "coren-hero__card-badge")));
  const heroTags = findAllByClass(heroCard, "coren-hero__card-tags")[0];
  const heroTagItems = findAll(heroTags, (node) => node.tagName === "span").map(
    (span) => ({
      _key: key(),
      text: normalizeText(textContent(span)),
    })
  );
  const heroBottom = findByClass(heroCard, "coren-hero__card-bottom");
  const heroCardCta = findFirst(heroBottom, (node) => node.tagName === "a");
  const heroFit = findFirst(heroBottom, (node) => node.tagName === "span");

  const opportunity = findSectionByLabel(body, "The Opportunity");
  const opportunityCards = findAllByClass(opportunity, "coren-opportunity__card").map(
    (card) => ({
      _key: key(),
      title: normalizeText(textContent(firstTag(card, "h3"))),
      icon: normalizeText(textContent(findByClass(card, "coren-icon-circle"))),
      subtitle: normalizeText(textContent(firstTag(card, "h4"))),
      body: normalizeText(textContent(firstTag(card, "p"))),
    })
  );
  const opportunityStats = findAllByClass(opportunity, "coren-stat-card").map((card) => ({
    _key: key(),
    number: normalizeText(textContent(findByClass(card, "coren-stat-card__number"))),
    caption: normalizeText(textContent(findByClass(card, "coren-stat-card__caption"))),
  }));

  const how = findByClass(body, "bg-gradient-subtle");
  const howSection = findByClass(body, "coren-how__header");
  const howContainer = findFirst(body, (node) => node.tagName === "section" && getAttr(node, "id") === "how-it-works");
  const howHeader = findByClass(howContainer, "coren-how__header");
  const howSteps = findAllByClass(howContainer, "coren-step-card").map((step) => ({
    _key: key(),
    icon: normalizeText(textContent(findByClass(step, "coren-icon-circle"))),
    title: normalizeText(textContent(firstTag(step, "h3"))),
    body: normalizeText(textContent(firstTag(step, "p"))),
  }));

  const pricing = findByClass(body, "coren-pricing");
  const pricingLeft = findByClass(pricing, "coren-pricing__left");
  const pricingCard = findByClass(pricing, "coren-pricing-card");
  const pricingSubtitles = findAll(pricingCard, (node) =>
    hasClass(node, "coren-pricing-card__subtitle")
  );
  const pricingChecklist = findByClass(pricingCard, "coren-checklist");

  const faq = findByClass(body, "coren-faq");
  const faqItems = findAllByClass(faq, "coren-faq-item").map((item) => {
    const spans = (item.childNodes || []).filter((node) => node.tagName === "span");
    return {
      _key: key(),
      question: normalizeText(textContent(spans[0])),
    };
  });
  const faqCta = findByClass(faq, "coren-faq-cta");

  const profile = findByClass(body, "coren-profile");
  const profileCard = findByClass(profile, "coren-profile__card");
  const profileHeader = findByClass(profileCard, "coren-profile__card-header");
  const profileMatch = findFirst(profileHeader, (node) => hasClass(node, "coren-pill--small"));
  const profileTags = findByClass(profileCard, "coren-profile__card-tags");
  const profileDetails = findByClass(profileCard, "coren-profile__card-details");
  const profileAvailability = findByClass(profileCard, "coren-profile__card-availability");
  const profileSlots = findByClass(profileCard, "coren-profile__card-slots");
  const profileCardCta = findFirst(profileCard, (node) => node.tagName === "a");

  const profileRight = findByClass(profile, "coren-profile__right");
  const profileChecklist = findByClass(profileRight, "coren-checklist");
  const profileChecklistItems = findAllByClass(profileChecklist, "coren-checklist__item").map(
    (li) => ({
      _key: key(),
      text: normalizeText(textFromTextNodes(li)),
    })
  );
  const profileRightCta = findFirst(profileRight, (node) => node.tagName === "a");

  const matching = findByClass(body, "coren-matching");
  const matchingLeft = findByClass(matching, "coren-matching__left");
  const matchingCard = findByClass(matching, "coren-matching__card");
  const matchingRows = findAllByClass(matchingCard, "coren-breakdown-row").map((row) => ({
    _key: key(),
    label: normalizeText(textContent(findByClass(row, "coren-breakdown-row__label"))),
    points: normalizeText(textContent(findByClass(row, "coren-breakdown-row__points"))),
  }));

  const trust = findByClass(body, "coren-trust");
  const trustContent = findByClass(trust, "coren-trust__content");
  const trustFeatures = findAllByClass(trust, "coren-trust__feature").map((feature) => ({
    _key: key(),
    icon: normalizeText(textContent(findByClass(feature, "coren-icon-circle"))),
    title: normalizeText(textContent(firstTag(feature, "strong"))),
    body: normalizeText(textContent(firstTag(feature, "p"))),
  }));

  const analytics = findByClass(body, "coren-analytics");
  const analyticsHeader = findByClass(analytics, "coren-analytics__header");
  const analyticsStack = findByClass(analytics, "coren-analytics__stack");
  const analyticsMetrics = findAllByClass(analyticsStack, "coren-metric-card").map((metric) => ({
    _key: key(),
    icon: normalizeText(textContent(findByClass(metric, "coren-icon-circle"))),
    number: normalizeText(textContent(findByClass(metric, "coren-metric-card__number"))),
    label: normalizeText(textContent(findByClass(metric, "coren-metric-card__label"))),
    trend: normalizeText(textContent(findByClass(metric, "coren-metric-card__trend"))),
  }));
  const analyticsCta = findByClass(analyticsStack, "coren-cta-card");
  const analyticsMain = findByClass(analytics, "coren-analytics__main-card");
  const analyticsHeadings = findAll(analyticsMain, (node) => node.tagName === "h3");
  const analyticsRows = findAllByClass(analyticsMain, "coren-progress-row");
  const performanceRows = analyticsRows.slice(0, 2).map((row) => {
    const header = findByClass(row, "coren-progress-row__header");
    const spans = (header.childNodes || []).filter((node) => node.tagName === "span");
    return {
      _key: key(),
      label: normalizeText(textContent(spans[0])),
      value: normalizeText(textContent(spans[1])),
    };
  });
  const scoreRows = analyticsRows.slice(2).map((row) => {
    const header = findByClass(row, "coren-progress-row__header");
    const spans = (header.childNodes || []).filter((node) => node.tagName === "span");
    return {
      _key: key(),
      label: normalizeText(textContent(spans[0])),
      value: normalizeText(textContent(spans[1])),
    };
  });

  const finalCta = findByClass(body, "coren-final-cta");
  const finalLink = findFirst(finalCta, (node) => node.tagName === "a");

  return {
    _id: "corenPage",
    _type: "corenPage",
    hero: {
      title: heroTitle || undefined,
      subtitle: heroSubtitle || undefined,
      primaryCta: {
        label: normalizeText(textContent(heroLinks[0])) || undefined,
        href: getAttr(heroLinks[0], "href") || undefined,
      },
      secondaryCta: {
        label: normalizeText(textContent(heroLinks[1])) || undefined,
        href: getAttr(heroLinks[1], "href") || undefined,
      },
      trust: heroTrustItems,
      card: {
        badge: heroBadge || undefined,
        tags: heroTagItems,
        cta: {
          label: normalizeText(textContent(heroCardCta)) || undefined,
          href: getAttr(heroCardCta, "href") || undefined,
        },
        fitLabel: normalizeText(textContent(heroFit)) || undefined,
      },
    },
    opportunity: {
      cards: opportunityCards,
      stats: opportunityStats,
    },
    howItWorks: {
      label: normalizeText(textContent(firstTag(howHeader, "span"))) || undefined,
      title: normalizeText(textContent(firstTag(howHeader, "h2"))) || undefined,
      intro: normalizeText(textContent(firstTag(howHeader, "p"))) || undefined,
      steps: howSteps,
    },
    pricing: {
      title: normalizeText(textContent(firstTag(pricingLeft, "h2"))) || undefined,
      subtitle: normalizeText(textContent(firstTag(pricingLeft, "p"))) || undefined,
      card: {
        title: normalizeText(textContent(firstTag(pricingCard, "h3"))) || undefined,
        subtitle: normalizeText(textContent(pricingSubtitles[0])) || undefined,
        price: normalizeText(textContent(findByClass(pricingCard, "coren-pricing-card__price"))) || undefined,
        label: normalizeText(textContent(findByClass(pricingCard, "coren-pricing-card__label"))) || undefined,
        featuresLabel: normalizeText(textContent(pricingSubtitles[1])) || undefined,
        groups: extractChecklistGroups(pricingChecklist),
        cta: {
          label: normalizeText(textContent(findFirst(pricingCard, (node) => node.tagName === "a"))) || undefined,
          href: getAttr(findFirst(pricingCard, (node) => node.tagName === "a"), "href") || undefined,
        },
      },
    },
    faq: {
      title: normalizeText(textContent(firstTag(faq, "h2"))) || undefined,
      items: faqItems,
      ctaText: normalizeText(textContent(faqCta)) || undefined,
    },
    profile: {
      card: {
        matchLabel: normalizeText(textContent(profileMatch)) || undefined,
        tags: findAll(profileTags, (node) => node.tagName === "span").map((span) => ({
          _key: key(),
          text: normalizeText(textContent(span)),
        })),
        details: findAll(profileDetails, (node) => node.tagName === "span").map((span) => ({
          _key: key(),
          text: normalizeText(textContent(span)),
        })),
        availabilityLabel: normalizeText(textContent(findFirst(profileAvailability, (node) => node.tagName === "span"))) || undefined,
        slots: findAll(profileSlots, (node) => node.tagName === "span").map((span) => ({
          _key: key(),
          text: normalizeText(textContent(span)),
        })),
        cta: {
          label: normalizeText(textContent(profileCardCta)) || undefined,
          href: getAttr(profileCardCta, "href") || undefined,
        },
      },
      content: {
        label: normalizeText(textContent(firstTag(profileRight, "span"))) || undefined,
        title: normalizeText(textContent(firstTag(profileRight, "h2"))) || undefined,
        body: normalizeText(textContent(firstTag(profileRight, "p"))) || undefined,
        checklist: profileChecklistItems,
        cta: {
          label: normalizeText(textContent(profileRightCta)) || undefined,
          href: getAttr(profileRightCta, "href") || undefined,
        },
      },
    },
    matching: {
      label: normalizeText(textContent(firstTag(matchingLeft, "span"))) || undefined,
      title: normalizeText(textContent(firstTag(matchingLeft, "h2"))) || undefined,
      body: normalizeText(textContent(firstTag(matchingLeft, "p"))) || undefined,
      cta: {
        label: normalizeText(textContent(firstTag(matchingLeft, "a"))) || undefined,
        href: getAttr(firstTag(matchingLeft, "a"), "href") || undefined,
      },
      card: {
        title: normalizeText(textContent(firstTag(matchingCard, "h3"))) || undefined,
        score: normalizeText(textContent(findByClass(matchingCard, "coren-doughnut"))) || undefined,
        rows: matchingRows,
      },
    },
    trust: {
      illustration: normalizeText(textContent(findByClass(trust, "coren-trust__illustration"))) || undefined,
      label: normalizeText(textContent(firstTag(trustContent, "span"))) || undefined,
      title: normalizeText(textContent(firstTag(trustContent, "h2"))) || undefined,
      body: normalizeText(textContent(firstTag(trustContent, "p"))) || undefined,
      features: trustFeatures,
    },
    analytics: {
      label: normalizeText(textContent(firstTag(analyticsHeader, "span"))) || undefined,
      title: normalizeText(textContent(firstTag(analyticsHeader, "h2"))) || undefined,
      body: normalizeText(textContent(firstTag(analyticsHeader, "p"))) || undefined,
      metrics: analyticsMetrics,
      cta: {
        text: normalizeText(textContent(firstTag(analyticsCta, "p"))) || undefined,
        link: {
          label: normalizeText(textContent(firstTag(analyticsCta, "a"))) || undefined,
          href: getAttr(firstTag(analyticsCta, "a"), "href") || undefined,
        },
      },
      performance: {
        title: normalizeText(textContent(analyticsHeadings[0])) || undefined,
        rows: performanceRows,
      },
      score: {
        title: normalizeText(textContent(analyticsHeadings[1])) || undefined,
        rows: scoreRows,
      },
    },
    finalCta: {
      title: normalizeText(textContent(firstTag(finalCta, "h2"))) || undefined,
      body: normalizeText(textContent(firstTag(finalCta, "p"))) || undefined,
      cta: {
        label: normalizeText(textContent(finalLink)) || undefined,
        href: getAttr(finalLink, "href") || undefined,
      },
    },
  };
}

async function run() {
  const doc = await buildCorenDoc();
  await client.createOrReplace(doc);
  console.log("Coren Page seeded in Sanity.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
