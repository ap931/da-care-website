import "server-only";

import { updateHtml } from "./dom";

function setIfString(value, setter) {
  if (typeof value === "string" && value.trim()) {
    setter(value.trim());
  }
}

function findFirstWithin(root, predicate) {
  if (!root) return null;
  if (predicate(root)) return root;
  for (const child of root.childNodes || []) {
    const found = findFirstWithin(child, predicate);
    if (found) return found;
  }
  return null;
}

function findAllWithin(root, predicate, results = []) {
  if (!root) return results;
  if (predicate(root)) results.push(root);
  for (const child of root.childNodes || []) {
    findAllWithin(child, predicate, results);
  }
  return results;
}

function findWithin(root, helpers, className) {
  return findFirstWithin(root, (node) => helpers.hasClass(node, className));
}

function setLeadingText(node, text, ensureTrailingSpace = false) {
  if (!node || typeof text !== "string" || !text.trim()) return;
  const trimmed = text.trim();
  const value = ensureTrailingSpace ? `${trimmed} ` : trimmed;
  const children = node.childNodes || [];
  const firstText = children.find((child) => child.nodeName === "#text");
  if (firstText) {
    firstText.value = value;
    return;
  }
  node.childNodes = [{ nodeName: "#text", value }, ...children];
}

function applyHero(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("lb-hero");
  if (!section) return;

  const badge = findWithin(section, helpers, "lb-hero__badge");
  setIfString(data.badge, (val) => helpers.setText(badge, val));

  const titleNode = findWithin(section, helpers, "lb-hero__title");
  const accent = findWithin(section, helpers, "lb-hero__accent");
  setIfString(data.titleAccent, (val) => helpers.setText(accent, val));
  setIfString(data.titlePrefix, (val) => setLeadingText(titleNode, val, true));

  const subtitle = findWithin(section, helpers, "lb-hero__subtitle");
  setIfString(data.subtitle, (val) => helpers.setText(subtitle, val));

  const actions = findWithin(section, helpers, "lb-hero__actions");
  if (actions) {
    const links = (actions.childNodes || []).filter(
      (node) => node.tagName === "a"
    );
    const primary = links[0];
    const secondary = links[1];
    if (data.primaryCta) {
      setIfString(data.primaryCta.label, (val) => helpers.setText(primary, val));
      const href = helpers.normalizeUrl(data.primaryCta.href);
      if (href) helpers.setAttr(primary, "href", href);
    }
    if (data.secondaryCta) {
      setIfString(data.secondaryCta.label, (val) =>
        helpers.setText(secondary, val)
      );
      const href = helpers.normalizeUrl(data.secondaryCta.href);
      if (href) helpers.setAttr(secondary, "href", href);
    }
  }

  const trust = findWithin(section, helpers, "lb-hero__trust");
  if (trust && Array.isArray(data.trust)) {
    const spans = (trust.childNodes || []).filter((node) => node.tagName === "span");
    data.trust.forEach((item, index) => {
      const span = spans[index];
      if (!span) return;
      setIfString(item?.text, (val) => helpers.setText(span, val));
    });
  }

  const image = findWithin(section, helpers, "lb-hero__image");
  if (image && data.image) {
    if (data.image.url) helpers.setAttr(image, "src", data.image.url);
    if (data.image.alt) helpers.setAttr(image, "alt", data.image.alt);
  }
}

function applyDividers(helpers, data) {
  if (!data) return;
  const labels = helpers.findAllByClass("lb-divider__label") || [];
  const values = [
    data.features,
    data.problem,
    data.howItWorks,
    data.why,
    data.ecosystem,
    data.pricing,
  ];
  values.forEach((value, index) => {
    setIfString(value, (val) => helpers.setText(labels[index], val));
  });
}

function applyFeatures(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("lb-features");
  if (!section) return;

  const label = findWithin(section, helpers, "lb-section__label");
  setIfString(data.label, (val) => helpers.setText(label, val));

  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const intro = findWithin(section, helpers, "lb-section__header-right");
  setIfString(data.intro, (val) => helpers.setText(intro, val));

  const cards = findAllWithin(section, (node) =>
    helpers.hasClass(node, "lb-feature-card")
  );
  const items = Array.isArray(data.items) ? data.items : [];
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;
    const icon = findWithin(card, helpers, "lb-feature-card__icon");
    const title = findFirstWithin(card, (node) => node.tagName === "h3");
    const body = findFirstWithin(card, (node) => node.tagName === "p");
    setIfString(item.icon, (val) => helpers.setText(icon, val));
    setIfString(item.title, (val) => helpers.setText(title, val));
    setIfString(item.body, (val) => helpers.setText(body, val));
  });
}

function applyProblem(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("lb-image-cards");
  if (!section) return;

  const label = findWithin(section, helpers, "lb-section__label");
  setIfString(data.label, (val) => helpers.setText(label, val));

  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const intro = findFirstWithin(section, (node) => node.tagName === "p");
  setIfString(data.intro, (val) => helpers.setText(intro, val));

  const cards = findAllWithin(section, (node) =>
    helpers.hasClass(node, "lb-image-card")
  );
  const items = Array.isArray(data.cards) ? data.cards : [];
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;
    const tag = findWithin(card, helpers, "lb-image-card__tag");
    const icon = findWithin(card, helpers, "lb-image-card__icon");
    const title = findFirstWithin(card, (node) => node.tagName === "h3");
    const body = findFirstWithin(card, (node) => node.tagName === "p");
    setIfString(item.tag, (val) => helpers.setText(tag, val));
    setIfString(item.value, (val) => {
      helpers.setText(icon, val);
      helpers.setText(title, val);
    });
    setIfString(item.description, (val) => helpers.setText(body, val));
  });
}

function applyHowItWorks(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("lb-editorial");
  if (!section) return;

  const label = findWithin(section, helpers, "lb-section__label");
  setIfString(data.label, (val) => helpers.setText(label, val));

  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const intro = findFirstWithin(section, (node) => node.tagName === "p");
  setIfString(data.intro, (val) => helpers.setText(intro, val));

  const items = findAllWithin(section, (node) =>
    helpers.hasClass(node, "lb-editorial__item")
  );
  const steps = Array.isArray(data.steps) ? data.steps : [];
  items.forEach((item, index) => {
    const step = steps[index];
    if (!step) return;
    const indexNode = findWithin(item, helpers, "lb-editorial__index");
    const title = findWithin(item, helpers, "lb-editorial__title");
    const body = findFirstWithin(item, (node) => node.tagName === "p");
    setIfString(step.index, (val) => helpers.setText(indexNode, val));
    setIfString(step.title, (val) => helpers.setText(title, val));
    setIfString(step.body, (val) => helpers.setText(body, val));
  });

  const image = findWithin(section, helpers, "lb-editorial__visual-image");
  if (image && data.image) {
    if (data.image.url) helpers.setAttr(image, "src", data.image.url);
    if (data.image.alt) helpers.setAttr(image, "alt", data.image.alt);
  }
}

function applyWhy(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("lb-showcase");
  if (!section) return;

  const label = findWithin(section, helpers, "lb-section__label");
  setIfString(data.label, (val) => helpers.setText(label, val));

  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const intro = findFirstWithin(section, (node) => node.tagName === "p");
  setIfString(data.intro, (val) => helpers.setText(intro, val));

  const cards = findAllWithin(section, (node) =>
    helpers.hasClass(node, "lb-showcase-card")
  );
  const items = Array.isArray(data.cards) ? data.cards : [];
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;
    const ghost = findWithin(card, helpers, "lb-showcase-card__ghost");
    const icon = findWithin(card, helpers, "lb-showcase-card__icon");
    const title = findFirstWithin(card, (node) => node.tagName === "h3");
    const labelNode = findWithin(card, helpers, "lb-showcase-card__label");
    const body = findFirstWithin(card, (node) => node.tagName === "p");
    setIfString(item.ghost, (val) => helpers.setText(ghost, val));
    setIfString(item.icon, (val) => helpers.setText(icon, val));
    setIfString(item.title, (val) => helpers.setText(title, val));
    setIfString(item.label, (val) => helpers.setText(labelNode, val));
    setIfString(item.body, (val) => helpers.setText(body, val));
  });
}

function applyEcosystem(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("lb-details");
  if (!section) return;

  const label = findWithin(section, helpers, "lb-section__label");
  setIfString(data.label, (val) => helpers.setText(label, val));

  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const intro = findFirstWithin(section, (node) => node.tagName === "p");
  setIfString(data.intro, (val) => helpers.setText(intro, val));

  const rows = findAllWithin(section, (node) =>
    helpers.hasClass(node, "lb-detail__row")
  );
  const items = Array.isArray(data.rows) ? data.rows : [];
  rows.forEach((row, index) => {
    const item = items[index];
    if (!item) return;
    const headingRow = findFirstWithin(row, (node) => node.tagName === "h3");
    const tag = findWithin(row, helpers, "lb-detail__tag");
    const body = findFirstWithin(row, (node) => node.tagName === "p");
    setIfString(item.title, (val) => setLeadingText(headingRow, val, true));
    setIfString(item.tag, (val) => helpers.setText(tag, val));
    setIfString(item.body, (val) => helpers.setText(body, val));
  });
}

function applyPricing(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("lb-pricing");
  if (!section) return;

  const pill = findWithin(section, helpers, "lb-pricing__pill");
  setIfString(data.pill, (val) => helpers.setText(pill, val));

  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const intro = findFirstWithin(section, (node) => node.tagName === "p");
  setIfString(data.intro, (val) => helpers.setText(intro, val));

  const cards = findAllWithin(section, (node) =>
    helpers.hasClass(node, "lb-pricing__card")
  );
  const items = Array.isArray(data.cards) ? data.cards : [];
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;
    const badge = findWithin(card, helpers, "lb-pricing__badge");
    const tier = findWithin(card, helpers, "lb-pricing__tier");
    const price = findWithin(card, helpers, "lb-pricing__price");
    const note = findWithin(card, helpers, "lb-pricing__note");
    const desc = findWithin(card, helpers, "lb-pricing__desc");
    const features = findWithin(card, helpers, "lb-pricing__features");
    const cta = findWithin(card, helpers, "lb-pricing__cta");

    setIfString(item.badge, (val) => helpers.setText(badge, val));
    setIfString(item.tier, (val) => helpers.setText(tier, val));
    setIfString(item.price, (val) => helpers.setText(price, val));
    setIfString(item.note, (val) => helpers.setText(note, val));
    setIfString(item.description, (val) => helpers.setText(desc, val));

    if (features && Array.isArray(item.features)) {
      const lines = findAllWithin(features, (node) => node.tagName === "li");
      item.features.forEach((feat, featIndex) => {
        const line = lines[featIndex];
        if (!line) return;
        setIfString(feat?.text, (val) => helpers.setText(line, val));
      });
    }

    if (item.cta) {
      setIfString(item.cta.label, (val) => helpers.setText(cta, val));
      const href = helpers.normalizeUrl(item.cta.href);
      if (href) helpers.setAttr(cta, "href", href);
    }
  });

  const footnote = findWithin(section, helpers, "lb-pricing__footnote");
  setIfString(data.footnote, (val) => helpers.setText(footnote, val));
}

export function applyLedaBusinessPageCms(html, data) {
  if (!data) return html;
  return updateHtml(html, (helpers) => {
    applyHero(helpers, data.hero);
    applyDividers(helpers, data.dividers);
    applyFeatures(helpers, data.features);
    applyProblem(helpers, data.problem);
    applyHowItWorks(helpers, data.howItWorks);
    applyWhy(helpers, data.why);
    applyEcosystem(helpers, data.ecosystem);
    applyPricing(helpers, data.pricing);
  });
}
