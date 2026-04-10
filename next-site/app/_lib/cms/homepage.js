import "server-only";

import { updateHtml } from "./dom";

function setIfString(value, setter) {
  if (typeof value === "string" && value.trim()) {
    setter(value.trim());
  }
}

function applyHero(helpers, hero) {
  if (!hero) return;
  const heroSection = helpers.findByClass("hero");
  if (!heroSection) return;

  const eyebrow = helpers.findByClass("hero-eyebrow");
  setIfString(hero.eyebrow, (val) => helpers.setText(eyebrow, val));

  const heading = heroSection.childNodes?.find((node) => node.tagName === "h1");
  setIfString(hero.title, (val) => helpers.setText(heading, val));

  const desc = helpers.findByClass("hero-desc");
  setIfString(hero.description, (val) => helpers.setText(desc, val));

  const buttonRow = helpers.findByClass("btn-row");
  if (buttonRow) {
    const buttons = (buttonRow.childNodes || []).filter(
      (node) => node.tagName === "a"
    );
    const primary =
      buttons.find((node) => helpers.hasClass(node, "btn--primary")) ||
      buttons.find((node) => helpers.hasClass(node, "btn-p"));
    const secondary =
      buttons.find((node) => helpers.hasClass(node, "btn--secondary")) ||
      buttons.find((node) => helpers.hasClass(node, "btn-s"));

    if (hero.primaryCta) {
      setIfString(hero.primaryCta.label, (val) =>
        helpers.setText(primary, val)
      );
      const href = helpers.normalizeUrl(hero.primaryCta.href);
      if (href) helpers.setAttr(primary, "href", href);
    }

    if (hero.secondaryCta) {
      setIfString(hero.secondaryCta.label, (val) =>
        helpers.setText(secondary, val)
      );
      const href = helpers.normalizeUrl(hero.secondaryCta.href);
      if (href) helpers.setAttr(secondary, "href", href);
    }
  }
}

function applyNoise(helpers, noise) {
  if (!noise) return;
  const text1 = helpers.findById("noiseText1");
  const text2 = helpers.findById("noiseText2");
  const text3 = helpers.findById("noiseText3");
  setIfString(noise.text1, (val) => helpers.setText(text1, val));
  setIfString(noise.text2, (val) => helpers.setText(text2, val));
  setIfString(noise.text3, (val) => helpers.setText(text3, val));
}

function applyProductSection(sectionNode, helpers, data) {
  if (!sectionNode || !data) return;
  const pill = findWithin(sectionNode, helpers, "product-pill");
  const title = findWithin(sectionNode, helpers, "product-title");
  const desc = findWithin(sectionNode, helpers, "product-desc");
  setIfString(data.pill, (val) => helpers.setText(pill, val));
  setIfString(data.title, (val) => helpers.setText(title, val));
  setIfString(data.description, (val) => helpers.setText(desc, val));

  const actions = findWithin(sectionNode, helpers, "product-actions");
  if (actions) {
    const links = (actions.childNodes || []).filter(
      (node) => node.tagName === "a"
    );
    const primary =
      links.find((node) => helpers.hasClass(node, "btn--primary")) ||
      links.find((node) => helpers.hasClass(node, "product-btn-solid"));
    const secondary =
      links.find((node) => helpers.hasClass(node, "btn--secondary")) ||
      links.find((node) => helpers.hasClass(node, "product-btn-outline"));

    if (data.primaryCta) {
      setIfString(data.primaryCta.label, (val) =>
        helpers.setText(primary, val)
      );
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
}

function findWithin(root, helpers, className) {
  return findFirstWithin(root, (node) => helpers.hasClass(node, className));
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

function applyProducts(helpers, products) {
  if (!products) return;
  const section1 = helpers.findById("section1");
  const section2 = helpers.findById("section2");
  const section3 = helpers.findById("section3");

  applyProductSection(section1, helpers, products.leda);
  applyProductSection(section2, helpers, products.ledaWork);
  applyProductSection(section3, helpers, products.coren);
}

function applyObsolete(helpers, obsolete) {
  if (!obsolete) return;
  const section = helpers.findByClass("obsolete");
  if (!section) return;

  const label = findWithin(section, helpers, "label");
  setIfString(obsolete.label, (val) => helpers.setText(label, val));

  const heading = findWithin(section, helpers, "obsolete-header");
  const headingText = findFirstWithin(
    heading,
    (node) => node.tagName === "h2"
  );
  setIfString(obsolete.heading, (val) => helpers.setText(headingText, val));

  const items = findAllWithin(section, (node) => helpers.hasClass(node, "ob-item"));
  const dataItems = Array.isArray(obsolete.items) ? obsolete.items : [];

  items.forEach((item, index) => {
    const data = dataItems[index];
    if (!data) return;
    const number = findWithin(item, helpers, "ob-number");
    const line = findWithin(item, helpers, "ob-line");
    setIfString(data.number, (val) => helpers.setText(number, val));
    setIfString(data.line, (val) => helpers.setText(line, val));
  });
}

function findAllWithin(root, predicate, results = []) {
  if (!root) return results;
  if (predicate(root)) results.push(root);
  for (const child of root.childNodes || []) {
    findAllWithin(child, predicate, results);
  }
  return results;
}

function applyAbout(helpers, about) {
  if (!about) return;
  const section = helpers.findByClass("about");
  if (!section) return;

  const label = findWithin(section, helpers, "label");
  setIfString(about.label, (val) => helpers.setText(label, val));

  const heading = findWithin(section, helpers, "about-h");
  setIfString(about.heading, (val) => helpers.setText(heading, val));

  const bodyText = findWithin(section, helpers, "about-p");
  setIfString(about.body, (val) => helpers.setText(bodyText, val));

  const stats = findAllWithin(section, (node) =>
    helpers.hasClass(node, "about-num-cell")
  );
  const dataStats = Array.isArray(about.stats) ? about.stats : [];

  stats.forEach((stat, index) => {
    const data = dataStats[index];
    if (!data) return;
    const number = findWithin(stat, helpers, "an-number");
    const labelNode = findWithin(stat, helpers, "an-label");
    setIfString(data.number, (val) => helpers.setText(number, val));
    setIfString(data.label, (val) => helpers.setText(labelNode, val));
  });
}

export function applyHomePageCms(html, data) {
  if (!data) return html;
  return updateHtml(html, (helpers) => {
    applyHero(helpers, data.hero);
    applyNoise(helpers, data.noise);
    applyProducts(helpers, data.products);
    applyObsolete(helpers, data.obsolete);
    applyAbout(helpers, data.about);
  });
}
