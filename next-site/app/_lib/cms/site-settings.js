import "server-only";

import { updateHtml } from "./dom";

function setIfString(value, setter) {
  if (typeof value === "string" && value.trim()) {
    setter(value.trim());
  }
}

function normalizeImageUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }
  return null;
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

function applyBrand(helpers, brand) {
  if (!brand) return;
  const logoUrl = normalizeImageUrl(brand.logoUrl);
  if (!logoUrl) return;

  const logoAlt =
    typeof brand.logoAlt === "string" && brand.logoAlt.trim()
      ? brand.logoAlt.trim()
      : null;

  const headerLogo = helpers.findByClass("navbar__logo-image");
  const footerLogo = helpers.findByClass("footer__logo-image");

  if (headerLogo) helpers.setAttr(headerLogo, "src", logoUrl);
  if (footerLogo) helpers.setAttr(footerLogo, "src", logoUrl);

  if (logoAlt) {
    if (headerLogo) helpers.setAttr(headerLogo, "alt", logoAlt);
    if (footerLogo) helpers.setAttr(footerLogo, "alt", logoAlt);
  }
}

function applyLinkList(helpers, links, items, options = {}) {
  if (!Array.isArray(items) || !links.length) return;
  const max = Math.min(items.length, links.length);
  for (let i = 0; i < max; i += 1) {
    const item = items[i];
    const link = links[i];
    if (!item || !link) continue;
    setIfString(item.label, (val) => helpers.setText(link, val));
    const href = helpers.normalizeUrl(item.href);
    if (href) helpers.setAttr(link, "href", href);

    if (typeof item.newTab === "boolean") {
      if (item.newTab) {
        helpers.setAttr(link, "target", "_blank");
        helpers.setAttr(link, "rel", "noopener noreferrer");
      } else {
        helpers.removeAttr(link, "target");
        helpers.removeAttr(link, "rel");
      }
    }

    if (options.useLabelAsAria && typeof item.label === "string") {
      helpers.setAttr(link, "aria-label", item.label.trim());
    }
  }
}

function applyHeaderNav(helpers, navigation) {
  const header = findFirstWithin(helpers.body, (node) => node.tagName === "header");
  if (!header) return;
  const links = findAllWithin(header, (node) =>
    helpers.hasClass(node, "navbar__menu-link")
  );
  applyLinkList(helpers, links, navigation);
}

function applyFooterNav(helpers, footerNavigation, footerLegal) {
  const footer = findFirstWithin(helpers.body, (node) => node.tagName === "footer");
  if (!footer) return;
  const linkGroups = findAllWithin(footer, (node) =>
    helpers.hasClass(node, "footer__links")
  );

  if (linkGroups[0]) {
    const links = findAllWithin(linkGroups[0], (node) => node.tagName === "a");
    applyLinkList(helpers, links, footerNavigation);
  }

  if (linkGroups[1]) {
    const links = findAllWithin(linkGroups[1], (node) => node.tagName === "a");
    applyLinkList(helpers, links, footerLegal);
  }
}

function applySocialLinks(helpers, socialLinks) {
  const footer = findFirstWithin(helpers.body, (node) => node.tagName === "footer");
  if (!footer) return;
  const socialWrap = findFirstWithin(footer, (node) =>
    helpers.hasClass(node, "footer__social")
  );
  if (!socialWrap) return;
  const links = findAllWithin(socialWrap, (node) =>
    helpers.hasClass(node, "social-icon")
  );
  applyLinkList(helpers, links, socialLinks, { useLabelAsAria: true });
}

export function applySiteSettingsCms(html, data) {
  if (!data) return html;
  return updateHtml(html, (helpers) => {
    applyBrand(helpers, data.brand);
    applyHeaderNav(helpers, data.navigation);
    applyFooterNav(helpers, data.footerNavigation, data.footerLegal);
    applySocialLinks(helpers, data.socialLinks);
  });
}
