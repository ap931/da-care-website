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

function applyHero(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("leda-hero");
  if (!section) return;

  const heading = findFirstWithin(section, (node) => node.tagName === "h1");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const desc = findWithin(section, helpers, "leda-hero__description");
  setIfString(data.description, (val) => helpers.setText(desc, val));

  const cta = findFirstWithin(
    section,
    (node) => node.tagName === "a" && helpers.hasClass(node, "btn--primary")
  );
  if (data.cta) {
    setIfString(data.cta.label, (val) => helpers.setText(cta, val));
    const href = helpers.normalizeUrl(data.cta.href);
    if (href) helpers.setAttr(cta, "href", href);
  }

  const bg = findWithin(section, helpers, "leda-hero__bg-image");
  if (bg && data.background) {
    if (data.background.url) helpers.setAttr(bg, "src", data.background.url);
    if (data.background.alt) helpers.setAttr(bg, "alt", data.background.alt);
  }
}

function applySplitVideo(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("leda-split-video");
  if (!section) return;
  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  const body = findFirstWithin(section, (node) => node.tagName === "p");
  setIfString(data.title, (val) => helpers.setText(heading, val));
  setIfString(data.body, (val) => helpers.setText(body, val));
  const video = findFirstWithin(section, (node) => node.tagName === "video");
  if (video && data.video) helpers.setAttr(video, "src", data.video);
}

function applyBenefits(helpers, data) {
  if (!data) return;
  const section = helpers.findById("carousel-a");
  if (!section) return;
  const cards = findAllWithin(section, (node) => helpers.hasClass(node, "usp-card"));
  const items = Array.isArray(data.items) ? data.items : [];
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;
    const images = findAllWithin(card, (node) => node.tagName === "img");
    const mainImage = images[0];
    const iconImage = images[1];
    const title = findFirstWithin(card, (node) => node.tagName === "h4");
    const body = findFirstWithin(card, (node) => node.tagName === "p");
    if (mainImage && item.image) {
      if (item.image.url) helpers.setAttr(mainImage, "src", item.image.url);
      if (item.image.alt) helpers.setAttr(mainImage, "alt", item.image.alt);
    }
    if (iconImage && item.icon) {
      if (item.icon.url) helpers.setAttr(iconImage, "src", item.icon.url);
      if (item.icon.alt) helpers.setAttr(iconImage, "alt", item.icon.alt);
    }
    setIfString(item.title, (val) => helpers.setText(title, val));
    setIfString(item.body, (val) => helpers.setText(body, val));
    if (item.overlay) {
      const overlay = findWithin(card, helpers, "usp-card__overlay-top");
      setIfString(item.overlay, (val) => helpers.setText(overlay, val));
    }
  });
}

function applyApps(helpers, data) {
  if (!data) return;
  const split = helpers.findByClass("split-section--2-3");
  if (!split) return;
  const heroImage = findWithin(split, helpers, "split-section__image");
  if (heroImage && data.image) {
    if (data.image.url) helpers.setAttr(heroImage, "src", data.image.url);
    if (data.image.alt) helpers.setAttr(heroImage, "alt", data.image.alt);
  }
  const heading = findFirstWithin(split, (node) => node.tagName === "h2");
  if (heading) {
    const spans = (heading.childNodes || []).filter((node) => node.tagName === "span");
    setIfString(data.titleLine1, (val) => helpers.setText(spans[0], val));
    setIfString(data.titleLine2, (val) => helpers.setText(spans[1], val));
  }
  const body = findFirstWithin(split, (node) => node.tagName === "p");
  setIfString(data.body, (val) => helpers.setText(body, val));

  const label = findWithin(split, helpers, "split-section__label");
  setIfString(data.label, (val) => helpers.setText(label, val));

  const logos = findAllWithin(split, (node) => helpers.hasClass(node, "split-section__logo"));
  const items = Array.isArray(data.logos) ? data.logos : [];
  logos.forEach((logo, index) => {
    const item = items[index];
    if (!item) return;
    if (item.url) helpers.setAttr(logo, "src", item.url);
    if (item.alt) helpers.setAttr(logo, "alt", item.alt);
  });
}

function applyModules(helpers, data) {
  if (!data) return;
  const section = helpers.findById("carousel-b");
  if (!section) return;
  const cards = findAllWithin(section, (node) => helpers.hasClass(node, "usp-card"));
  const items = Array.isArray(data.items) ? data.items : [];
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;
    const images = findAllWithin(card, (node) => node.tagName === "img");
    const mainImage = images[0];
    const iconImage = images[1];
    const body = findFirstWithin(card, (node) => node.tagName === "p");
    if (mainImage && item.image) {
      if (item.image.url) helpers.setAttr(mainImage, "src", item.image.url);
      if (item.image.alt) helpers.setAttr(mainImage, "alt", item.image.alt);
    }
    if (iconImage && item.icon) {
      if (item.icon.url) helpers.setAttr(iconImage, "src", item.icon.url);
      if (item.icon.alt) helpers.setAttr(iconImage, "alt", item.icon.alt);
    }
    setIfString(item.body, (val) => helpers.setText(body, val));
  });
}

function applyBento(helpers, data) {
  if (!data) return;
  const grid = helpers.findByClass("bento-grid");
  if (!grid) return;
  const contentBlocks = findAllWithin(grid, (node) =>
    helpers.hasClass(node, "bento-content")
  );
  const block1 = contentBlocks[0];
  const block2 = contentBlocks[1];
  const block3 = contentBlocks[2];
  setIfString(data.row1Title, (val) =>
    helpers.setText(findFirstWithin(block1, (n) => n.tagName === "h3"), val)
  );
  setIfString(data.row1Body, (val) =>
    helpers.setText(findFirstWithin(block1, (n) => n.tagName === "p"), val)
  );
  setIfString(data.row2Title, (val) =>
    helpers.setText(findFirstWithin(block2, (n) => n.tagName === "h3"), val)
  );
  setIfString(data.row2Body, (val) =>
    helpers.setText(findFirstWithin(block2, (n) => n.tagName === "p"), val)
  );
  setIfString(data.row3Title, (val) =>
    helpers.setText(findFirstWithin(block3, (n) => n.tagName === "h3"), val)
  );
  setIfString(data.tickerLabel, (val) =>
    helpers.setText(findFirstWithin(block3, (n) => n.tagName === "h3"), val)
  );
}

function applyPrivacy(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("wide-image-section");
  if (!section) return;
  const header = findWithin(section, helpers, "wide-image-section__header");
  if (header) {
    const title = findFirstWithin(header, (node) => node.tagName === "h2");
    const body = findFirstWithin(header, (node) => node.tagName === "p");
    setIfString(data.title, (val) => helpers.setText(title, val));
    setIfString(data.body, (val) => helpers.setText(body, val));
  }

  if (data.card) {
    const card = helpers.findById("privacy-data-card");
    if (card) {
      const fields = findAllWithin(card, (node) =>
        helpers.hasClass(node, "privacy-data-card__value")
      );
      setIfString(data.card.name, (val) => helpers.setText(fields[0], val));
      setIfString(data.card.id, (val) => helpers.setText(fields[1], val));
      setIfString(data.card.context, (val) => helpers.setText(fields[2], val));
    }
  }

  if (data.stations) {
    const labels = findAllWithin(section, (node) =>
      helpers.hasClass(node, "privacy-station__label")
    );
    setIfString(data.stations.user, (val) => helpers.setText(labels[0], val));
    setIfString(data.stations.security, (val) => helpers.setText(labels[1], val));
    setIfString(data.stations.ai, (val) => helpers.setText(labels[2], val));
    const stageLabels = findAllWithin(section, (node) =>
      helpers.hasClass(node, "privacy-stage-label")
    );
    const encrypt = findFirstWithin(stageLabels[0], (node) => node.tagName === "span");
    const strip = findFirstWithin(stageLabels[1], (node) => node.tagName === "span");
    setIfString(data.stations.encrypt, (val) => helpers.setText(encrypt, val));
    setIfString(data.stations.strip, (val) => helpers.setText(strip, val));
  }
}

function applyFinalCta(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("cta-simple");
  if (!section) return;
  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  const body = findFirstWithin(section, (node) => node.tagName === "p");
  const link = findFirstWithin(section, (node) => node.tagName === "a");
  setIfString(data.title, (val) => helpers.setText(heading, val));
  setIfString(data.body, (val) => helpers.setText(body, val));
  if (data.cta) {
    setIfString(data.cta.label, (val) => helpers.setText(link, val));
    const href = helpers.normalizeUrl(data.cta.href);
    if (href) helpers.setAttr(link, "href", href);
  }
  const image = findFirstWithin(section, (node) => node.tagName === "img");
  if (image && data.image) {
    if (data.image.url) helpers.setAttr(image, "src", data.image.url);
    if (data.image.alt) helpers.setAttr(image, "alt", data.image.alt);
  }
}

export function applyLedaPageCms(html, data) {
  if (!data) return html;
  return updateHtml(html, (helpers) => {
    applyHero(helpers, data.hero);
    applySplitVideo(helpers, data.splitVideo);
    applyBenefits(helpers, data.benefits);
    applyApps(helpers, data.apps);
    applyModules(helpers, data.modules);
    applyBento(helpers, data.bento);
    applyPrivacy(helpers, data.privacy);
    applyFinalCta(helpers, data.finalCta);
  });
}
