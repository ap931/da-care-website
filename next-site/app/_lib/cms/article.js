import "server-only";

import { updateHtml } from "./dom";

const HTML_NS = "http://www.w3.org/1999/xhtml";

function textNode(value) {
  return { nodeName: "#text", value };
}

function el(tagName, attrs = {}, children = []) {
  return {
    nodeName: tagName,
    tagName,
    namespaceURI: HTML_NS,
    attrs: Object.entries(attrs).map(([name, value]) => ({
      name,
      value: value ?? "",
    })),
    childNodes: children,
  };
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
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

function buildNotFound(articleId, available) {
  const debug = `Debug ID: ${articleId || "None"} \n Available: ${available.join(", ")}`;
  return el("div", { style: "text-align: center; padding: 4rem;" }, [
    el("h2", {}, [textNode("Article not found")]),
    el("p", { style: "color: grey;" }, [
      textNode(debug),
    ]),
    el("p", {}, [
      el("a", { href: "/" }, [textNode("Return home")]),
    ]),
  ]);
}

function buildHeader(article) {
  return el("header", { class: "article-header" }, [
    el("h1", { class: "article-title" }, [textNode(article.title || "")]),
    el("div", { class: "article-meta" }, [
      el("span", {}, [textNode(article.date || "")]),
      textNode(" • "),
      el("span", {}, [textNode(article.readTime || "")]),
    ]),
    el(
      "img",
      {
        src: article.image?.url || "",
        alt: article.image?.alt || article.title || "",
        class: "article-banner",
        loading: "lazy",
      },
      []
    ),
    el("p", { class: "article-intro" }, [textNode(article.excerpt || "")]),
  ]);
}

function buildBody(article) {
  const blocks = Array.isArray(article.content) ? article.content : [];
  const children = blocks.map((block) => {
    if (block.type === "h2") {
      return el("h2", {}, [textNode(block.text || "")]);
    }
    if (block.type === "img") {
      return el(
        "img",
        {
          src: block.image?.url || "",
          alt: block.image?.alt || article.title || "",
          loading: "lazy",
        },
        []
      );
    }
    return el("p", {}, [textNode(block.text || "")]);
  });
  return el("div", { class: "article-body" }, children);
}

function buildPagination(prev, next) {
  const children = [];
  if (prev) {
    children.push(
      el("a", { href: `/article?id=${prev.id}`, class: "btn btn--secondary" }, [
        textNode("« Previous"),
      ])
    );
  } else {
    children.push(el("div", {}, []));
  }
  if (next) {
    children.push(
      el("a", { href: `/article?id=${next.id}`, class: "btn btn--secondary" }, [
        textNode("Next »"),
      ])
    );
  }
  return el("div", { class: "article-pagination" }, children);
}

export function applyArticleCms(html, data) {
  if (!data) return html;
  const { article, prev, next, articleId, availableIds } = data;
  return updateHtml(html, (helpers) => {
    const container = helpers.findById("article-content");
    if (!container) return;
    if (!article) {
      container.childNodes = [buildNotFound(articleId, availableIds || [])];
      return;
    }
    const safePrev = prev && normalizeUrl(`/article?id=${prev.id}`) ? prev : null;
    const safeNext = next && normalizeUrl(`/article?id=${next.id}`) ? next : null;
    container.childNodes = [
      buildHeader(article),
      buildBody(article),
      buildPagination(safePrev, safeNext),
    ];
  });
}
