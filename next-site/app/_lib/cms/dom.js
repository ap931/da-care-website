import "server-only";

import { parse, serialize } from "parse5";

function getAttr(node, name) {
  const attr = (node.attrs || []).find((item) => item.name === name);
  return attr ? attr.value : null;
}

function setAttr(node, name, value) {
  if (!node || value == null) return;
  if (!node.attrs) node.attrs = [];
  const attr = node.attrs.find((item) => item.name === name);
  if (attr) {
    attr.value = value;
  } else {
    node.attrs.push({ name, value });
  }
}

function removeAttr(node, name) {
  if (!node || !node.attrs) return;
  node.attrs = node.attrs.filter((item) => item.name !== name);
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

function findById(root, id) {
  return findFirst(root, (node) => getAttr(node, "id") === id);
}

function findByClass(root, className) {
  return findFirst(root, (node) => hasClass(node, className));
}

function findAllByClass(root, className) {
  return findAll(root, (node) => hasClass(node, className));
}

function setText(node, text) {
  if (!node || text == null) return;
  const value = String(text);
  node.childNodes = [{ nodeName: "#text", value }];
}

function getBodyNode(document) {
  return findFirst(document, (node) => node.tagName === "body");
}

function normalizeUrl(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  return null;
}

export function updateHtml(html, updater) {
  if (typeof html !== "string") return html;
  const document = parse(html);
  const body = getBodyNode(document);
  if (!body) return html;
  updater({
    body,
    findById: (id) => findById(body, id),
    findByClass: (className) => findByClass(body, className),
    findAllByClass: (className) => findAllByClass(body, className),
    setText,
    setAttr,
    removeAttr,
    getAttr,
    hasClass,
    normalizeUrl,
  });
  return serialize(document);
}
