import "server-only";

import { updateHtml } from "./dom";

function setIfString(value, setter) {
  if (typeof value === "string" && value.trim()) {
    setter(value.trim());
  }
}

function setIfText(value, setter) {
  if (typeof value === "string" && value.trim()) {
    setter(value);
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
  const section = helpers.findByClass("about-hero");
  if (!section) return;

  const heading = findFirstWithin(section, (node) => node.tagName === "h1");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const desc = findWithin(section, helpers, "about-hero__description");
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

  const bg = findWithin(section, helpers, "about-hero__bg-image");
  if (bg && data.background) {
    if (data.background.url) helpers.setAttr(bg, "src", data.background.url);
    if (data.background.alt) helpers.setAttr(bg, "alt", data.background.alt);
  }
}

function applyManifesto(helpers, wrapper, data) {
  if (!wrapper || !data) return;
  const block = findWithin(wrapper, helpers, "intro-block");
  if (!block) return;
  const heading = findFirstWithin(block, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));
  const body = findFirstWithin(block, (node) => node.tagName === "p");
  setIfString(data.body, (val) => helpers.setText(body, val));
}

function applyValues(helpers, wrapper, data) {
  if (!wrapper || !data) return;
  const titleBlock = findWithin(wrapper, helpers, "section-title-block");
  const titleNode = titleBlock
    ? findFirstWithin(titleBlock, (node) => node.tagName === "h2")
    : null;
  setIfString(data.title, (val) => helpers.setText(titleNode, val));

  const listBlock = findWithin(wrapper, helpers, "list-block");
  if (!listBlock) return;
  const items = findAllWithin(listBlock, (node) =>
    helpers.hasClass(node, "info-item")
  );
  const dataItems = Array.isArray(data.items) ? data.items : [];
  items.forEach((item, index) => {
    const info = dataItems[index];
    if (!info) return;
    const term = findFirstWithin(item, (node) => node.tagName === "dt");
    const def = findFirstWithin(item, (node) => node.tagName === "dd");
    setIfString(info.term, (val) => helpers.setText(term, val));
    setIfString(info.definition, (val) => helpers.setText(def, val));
  });
}

function applyOrigin(helpers, wrapper, data) {
  if (!wrapper || !data) return;
  const blocks = findAllWithin(wrapper, (node) => helpers.hasClass(node, "text-block"));
  const originBlock = blocks[0];
  if (!originBlock) return;
  const heading = findFirstWithin(originBlock, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));
  const paragraphs = findAllWithin(originBlock, (node) => node.tagName === "p");
  const dataParagraphs = Array.isArray(data.paragraphs) ? data.paragraphs : [];
  dataParagraphs.forEach((text, index) => {
    if (!paragraphs[index]) return;
    setIfString(text, (val) => helpers.setText(paragraphs[index], val));
  });
}

function applyBreakoutImage(helpers, data) {
  if (!data) return;
  const image = helpers.findByClass("breakout-image");
  if (!image) return;
  if (data.url) helpers.setAttr(image, "src", data.url);
  if (data.alt) helpers.setAttr(image, "alt", data.alt);
}

function applyWorking(helpers, wrapper, data) {
  if (!wrapper || !data) return;
  const blocks = findAllWithin(wrapper, (node) => helpers.hasClass(node, "text-block"));
  const workingBlock = blocks[0];
  if (!workingBlock) return;

  const heading = findFirstWithin(workingBlock, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const headings = findAllWithin(workingBlock, (node) => node.tagName === "h4");
  const paragraphs = findAllWithin(workingBlock, (node) => node.tagName === "p");
  const items = Array.isArray(data.items) ? data.items : [];
  items.forEach((item, index) => {
    if (!item) return;
    setIfString(item.title, (val) => helpers.setText(headings[index], val));
    setIfString(item.body, (val) => helpers.setText(paragraphs[index], val));
  });
}

function setParagraphPrefix(paragraph, text) {
  if (!paragraph) return;
  const children = paragraph.childNodes || [];
  const firstText = children.find((child) => child.nodeName === "#text");
  if (firstText) {
    firstText.value = text;
    return;
  }
  paragraph.childNodes = [{ nodeName: "#text", value: text }, ...children];
}

function applyTeamSpirit(helpers, wrapper, data) {
  if (!wrapper || !data) return;
  const blocks = findAllWithin(wrapper, (node) => helpers.hasClass(node, "text-block"));
  const teamBlock = blocks[1];
  if (!teamBlock) return;

  const heading = findFirstWithin(teamBlock, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const paragraphs = findAllWithin(teamBlock, (node) => node.tagName === "p");
  setIfString(data.paragraph1, (val) => helpers.setText(paragraphs[0], val));

  const linkParagraph = paragraphs[1];
  if (linkParagraph) {
    const link = findFirstWithin(linkParagraph, (node) => node.tagName === "a");
    setIfString(data.linkLabel, (val) => helpers.setText(link, val));
    const href = helpers.normalizeUrl(data.linkHref);
    if (href) helpers.setAttr(link, "href", href);
    setIfText(data.linkPrefix, (val) => setParagraphPrefix(linkParagraph, val));
  }
}

export function applyAboutPageCms(html, data) {
  if (!data) return html;
  return updateHtml(html, (helpers) => {
    applyHero(helpers, data.hero);
    const longForm = helpers.findByClass("long-form-section");
    const wrappers = findAllWithin(longForm, (node) =>
      helpers.hasClass(node, "content-wrapper")
    );
    const firstWrapper = wrappers[0];
    const secondWrapper = wrappers[1];

    applyManifesto(helpers, firstWrapper, data.manifesto);
    applyValues(helpers, firstWrapper, data.values);
    applyOrigin(helpers, firstWrapper, data.origin);
    applyBreakoutImage(helpers, data.breakoutImage);
    applyWorking(helpers, secondWrapper, data.working);
    applyTeamSpirit(helpers, secondWrapper, data.teamSpirit);
  });
}
