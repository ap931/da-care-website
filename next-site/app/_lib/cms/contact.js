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

function setParagraphLines(node, lines) {
  if (!node) return;
  const cleanLines = Array.isArray(lines)
    ? lines.map((line) => (line == null ? "" : String(line).trim()))
    : [];
  const childNodes = [];
  cleanLines.forEach((line, index) => {
    childNodes.push({ nodeName: "#text", value: line });
    if (index < cleanLines.length - 1) {
      childNodes.push({
        nodeName: "br",
        tagName: "br",
        attrs: [],
        namespaceURI: "http://www.w3.org/1999/xhtml",
      });
    }
  });
  node.childNodes = childNodes;
}

function applyHero(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("contact-hero");
  if (!section) return;

  const heading = findFirstWithin(section, (node) => node.tagName === "h1");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const desc = findWithin(section, helpers, "contact-hero__description");
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
}

function applyLocations(helpers, data) {
  const section = helpers.findByClass("contact-methods");
  if (!section || !Array.isArray(data)) return;
  const cards = findAllWithin(section, (node) =>
    helpers.hasClass(node, "contact-method")
  );
  cards.forEach((card, index) => {
    const location = data[index];
    if (!location) return;
    const heading = findFirstWithin(card, (node) => node.tagName === "h3");
    setIfString(location.name, (val) => helpers.setText(heading, val));
    const paragraph = findFirstWithin(card, (node) => node.tagName === "p");
    setParagraphLines(paragraph, [
      location.line1,
      location.line2,
      location.line3,
    ]);
  });
}

function applyFaq(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("faq-section");
  if (!section) return;
  const title = findWithin(section, helpers, "faq-title");
  setIfString(data.title, (val) => helpers.setText(title, val));

  const items = findAllWithin(section, (node) =>
    helpers.hasClass(node, "accordion__item")
  );
  const dataItems = Array.isArray(data.items) ? data.items : [];
  items.forEach((item, index) => {
    const entry = dataItems[index];
    if (!entry) return;
    const question = findFirstWithin(item, (node) => node.tagName === "h3");
    setIfString(entry.question, (val) => helpers.setText(question, val));
    const answer = findFirstWithin(item, (node) => node.tagName === "p");
    setIfString(entry.answer, (val) => helpers.setText(answer, val));
  });
}

export function applyContactPageCms(html, data) {
  if (!data) return html;
  return updateHtml(html, (helpers) => {
    applyHero(helpers, data.hero);
    applyLocations(helpers, data.locations);
    applyFaq(helpers, data.faq);
  });
}
