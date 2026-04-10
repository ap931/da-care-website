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

function findSectionByLabel(helpers, label) {
  return findFirstWithin(helpers.body, (node) => {
    if (node.tagName !== "section") return false;
    return helpers.getAttr(node, "aria-label") === label;
  });
}

function setTextAfterFirstSpan(node, text) {
  if (!node || typeof text !== "string") return;
  const children = node.childNodes || [];
  const spanIndex = children.findIndex((child) => child.tagName === "span");
  if (spanIndex === -1) {
    node.childNodes = [{ nodeName: "#text", value: text.trim() }];
    return;
  }
  const after = children.slice(spanIndex + 1);
  const textNode = after.find((child) => child.nodeName === "#text");
  if (textNode) {
    textNode.value = text.trim();
  } else {
    node.childNodes = [
      ...children.slice(0, spanIndex + 1),
      { nodeName: "#text", value: text.trim() },
      ...after,
    ];
  }
}

function applyHero(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-hero");
  if (!section) return;

  const heading = findFirstWithin(section, (node) => node.tagName === "h1");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const subtitle = findFirstWithin(section, (node) => node.tagName === "p");
  setIfString(data.subtitle, (val) => helpers.setText(subtitle, val));

  const actions = findWithin(section, helpers, "coren-hero__actions");
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

  const trust = findWithin(section, helpers, "coren-trust-markers");
  if (trust && Array.isArray(data.trust)) {
    const spans = (trust.childNodes || []).filter((node) => node.tagName === "span");
    data.trust.forEach((item, index) => {
      const span = spans[index];
      if (!span) return;
      setIfString(item?.text, (val) => helpers.setText(span, val));
    });
  }

  if (data.card) {
    const card = findWithin(section, helpers, "coren-hero__card");
    if (card) {
      const badge = findWithin(card, helpers, "coren-hero__card-badge");
      setIfString(data.card.badge, (val) => helpers.setText(badge, val));

      const tags = findWithin(card, helpers, "coren-hero__card-tags");
      if (tags && Array.isArray(data.card.tags)) {
        const spans = (tags.childNodes || []).filter((node) => node.tagName === "span");
        data.card.tags.forEach((item, index) => {
          const span = spans[index];
          if (!span) return;
          setIfString(item?.text, (val) => helpers.setText(span, val));
        });
      }

      const bottom = findWithin(card, helpers, "coren-hero__card-bottom");
      if (bottom) {
        const link = findFirstWithin(bottom, (node) => node.tagName === "a");
        if (data.card.cta) {
          setIfString(data.card.cta.label, (val) => helpers.setText(link, val));
          const href = helpers.normalizeUrl(data.card.cta.href);
          if (href) helpers.setAttr(link, "href", href);
        }
        const fit = findFirstWithin(bottom, (node) => node.tagName === "span");
        setIfString(data.card.fitLabel, (val) => helpers.setText(fit, val));
      }
    }
  }
}

function applyOpportunity(helpers, data) {
  if (!data) return;
  const section = findSectionByLabel(helpers, "The Opportunity");
  if (!section) return;

  const cards = findAllWithin(section, (node) =>
    helpers.hasClass(node, "coren-opportunity__card")
  );
  const cardData = Array.isArray(data.cards) ? data.cards : [];
  cards.forEach((card, index) => {
    const item = cardData[index];
    if (!item) return;
    const title = findFirstWithin(card, (node) => node.tagName === "h3");
    const icon = findWithin(card, helpers, "coren-icon-circle");
    const subtitle = findFirstWithin(card, (node) => node.tagName === "h4");
    const body = findFirstWithin(card, (node) => node.tagName === "p");
    setIfString(item.title, (val) => helpers.setText(title, val));
    setIfString(item.icon, (val) => helpers.setText(icon, val));
    setIfString(item.subtitle, (val) => helpers.setText(subtitle, val));
    setIfString(item.body, (val) => helpers.setText(body, val));
  });

  const stats = findAllWithin(section, (node) =>
    helpers.hasClass(node, "coren-stat-card")
  );
  const statData = Array.isArray(data.stats) ? data.stats : [];
  stats.forEach((card, index) => {
    const stat = statData[index];
    if (!stat) return;
    const number = findWithin(card, helpers, "coren-stat-card__number");
    const caption = findWithin(card, helpers, "coren-stat-card__caption");
    setIfString(stat.number, (val) => helpers.setText(number, val));
    setIfString(stat.caption, (val) => helpers.setText(caption, val));
  });
}

function applyHowItWorks(helpers, data) {
  if (!data) return;
  const section = helpers.findById("how-it-works");
  if (!section) return;

  const header = findWithin(section, helpers, "coren-how__header");
  if (header) {
    const label = findFirstWithin(header, (node) => node.tagName === "span");
    const title = findFirstWithin(header, (node) => node.tagName === "h2");
    const intro = findFirstWithin(header, (node) => node.tagName === "p");
    setIfString(data.label, (val) => helpers.setText(label, val));
    setIfString(data.title, (val) => helpers.setText(title, val));
    setIfString(data.intro, (val) => helpers.setText(intro, val));
  }

  const steps = findAllWithin(section, (node) =>
    helpers.hasClass(node, "coren-step-card")
  );
  const stepData = Array.isArray(data.steps) ? data.steps : [];
  steps.forEach((step, index) => {
    const item = stepData[index];
    if (!item) return;
    const icon = findWithin(step, helpers, "coren-icon-circle");
    const title = findFirstWithin(step, (node) => node.tagName === "h3");
    const body = findFirstWithin(step, (node) => node.tagName === "p");
    setIfString(item.icon, (val) => helpers.setText(icon, val));
    setIfString(item.title, (val) => helpers.setText(title, val));
    setIfString(item.body, (val) => helpers.setText(body, val));
  });
}

function applyPricing(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-pricing");
  if (!section) return;

  const left = findWithin(section, helpers, "coren-pricing__left");
  const heading = findFirstWithin(left, (node) => node.tagName === "h2");
  const intro = findFirstWithin(left, (node) => node.tagName === "p");
  setIfString(data.title, (val) => helpers.setText(heading, val));
  setIfString(data.subtitle, (val) => helpers.setText(intro, val));

  const card = findWithin(section, helpers, "coren-pricing-card");
  if (!card || !data.card) return;
  const cardTitle = findFirstWithin(card, (node) => node.tagName === "h3");
  const subtitles = findAllWithin(card, (node) =>
    helpers.hasClass(node, "coren-pricing-card__subtitle")
  );
  const price = findWithin(card, helpers, "coren-pricing-card__price");
  const label = findWithin(card, helpers, "coren-pricing-card__label");
  setIfString(data.card.title, (val) => helpers.setText(cardTitle, val));
  setIfString(data.card.subtitle, (val) => helpers.setText(subtitles[0], val));
  setIfString(data.card.featuresLabel, (val) => helpers.setText(subtitles[1], val));
  setIfString(data.card.price, (val) => helpers.setText(price, val));
  setIfString(data.card.label, (val) => helpers.setText(label, val));

  const checklist = findWithin(card, helpers, "coren-checklist");
  if (checklist && Array.isArray(data.card.groups)) {
    let groupIndex = 0;
    let currentGroup = data.card.groups[groupIndex];
    for (const child of checklist.childNodes || []) {
      if (child.tagName === "li" && helpers.hasClass(child, "coren-checklist__category")) {
        currentGroup = data.card.groups[groupIndex];
        groupIndex += 1;
        if (currentGroup) {
          setIfString(currentGroup.category, (val) => helpers.setText(child, val));
        }
      }
      if (child.tagName === "ul" && currentGroup) {
        const items = findAllWithin(child, (node) =>
          helpers.hasClass(node, "coren-checklist__item")
        );
        currentGroup.items?.forEach((item, index) => {
          const li = items[index];
          if (!li) return;
          setIfString(item?.text, (val) => helpers.setText(li, val));
        });
      }
    }
  }

  const cta = findFirstWithin(card, (node) => node.tagName === "a");
  if (data.card.cta) {
    setIfString(data.card.cta.label, (val) => helpers.setText(cta, val));
    const href = helpers.normalizeUrl(data.card.cta.href);
    if (href) helpers.setAttr(cta, "href", href);
  }
}

function applyFaq(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-faq");
  if (!section) return;

  const heading = findFirstWithin(section, (node) => node.tagName === "h2");
  setIfString(data.title, (val) => helpers.setText(heading, val));

  const items = findAllWithin(section, (node) =>
    helpers.hasClass(node, "coren-faq-item")
  );
  const itemData = Array.isArray(data.items) ? data.items : [];
  items.forEach((item, index) => {
    const entry = itemData[index];
    if (!entry) return;
    const spans = (item.childNodes || []).filter((node) => node.tagName === "span");
    const question = spans[0];
    setIfString(entry.question, (val) => helpers.setText(question, val));
  });

  const cta = findWithin(section, helpers, "coren-faq-cta");
  setIfString(data.ctaText, (val) => helpers.setText(cta, val));
}

function applyProfile(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-profile");
  if (!section) return;

  const card = findWithin(section, helpers, "coren-profile__card");
  if (card && data.card) {
    const header = findWithin(card, helpers, "coren-profile__card-header");
    const match = header
      ? findFirstWithin(header, (node) => helpers.hasClass(node, "coren-pill--small"))
      : null;
    setIfString(data.card.matchLabel, (val) => helpers.setText(match, val));

    const tags = findWithin(card, helpers, "coren-profile__card-tags");
    if (tags && Array.isArray(data.card.tags)) {
      const spans = (tags.childNodes || []).filter((node) => node.tagName === "span");
      data.card.tags.forEach((item, index) => {
        const span = spans[index];
        if (!span) return;
        setIfString(item?.text, (val) => helpers.setText(span, val));
      });
    }

    const details = findWithin(card, helpers, "coren-profile__card-details");
    if (details && Array.isArray(data.card.details)) {
      const spans = (details.childNodes || []).filter((node) => node.tagName === "span");
      data.card.details.forEach((item, index) => {
        const span = spans[index];
        if (!span) return;
        setIfString(item?.text, (val) => helpers.setText(span, val));
      });
    }

    const availability = findWithin(card, helpers, "coren-profile__card-availability");
    if (availability) {
      const label = findFirstWithin(availability, (node) => node.tagName === "span");
      setIfString(data.card.availabilityLabel, (val) => helpers.setText(label, val));
      const slots = findWithin(availability, helpers, "coren-profile__card-slots");
      if (slots && Array.isArray(data.card.slots)) {
        const spans = (slots.childNodes || []).filter((node) => node.tagName === "span");
        data.card.slots.forEach((item, index) => {
          const span = spans[index];
          if (!span) return;
          setIfString(item?.text, (val) => helpers.setText(span, val));
        });
      }
    }

    const cta = findFirstWithin(card, (node) => node.tagName === "a");
    if (data.card.cta) {
      setIfString(data.card.cta.label, (val) => helpers.setText(cta, val));
      const href = helpers.normalizeUrl(data.card.cta.href);
      if (href) helpers.setAttr(cta, "href", href);
    }
  }

  if (data.content) {
    const right = findWithin(section, helpers, "coren-profile__right");
    if (right) {
      const label = findFirstWithin(right, (node) => node.tagName === "span");
      const title = findFirstWithin(right, (node) => node.tagName === "h2");
      const body = findFirstWithin(right, (node) => node.tagName === "p");
      setIfString(data.content.label, (val) => helpers.setText(label, val));
      setIfString(data.content.title, (val) => helpers.setText(title, val));
      setIfString(data.content.body, (val) => helpers.setText(body, val));

      const checklist = findWithin(right, helpers, "coren-checklist");
      if (checklist && Array.isArray(data.content.checklist)) {
        const items = findAllWithin(checklist, (node) =>
          helpers.hasClass(node, "coren-checklist__item")
        );
        data.content.checklist.forEach((item, index) => {
          const li = items[index];
          if (!li) return;
          setTextAfterFirstSpan(li, item?.text || "");
        });
      }

      const cta = findFirstWithin(right, (node) => node.tagName === "a");
      if (data.content.cta) {
        setIfString(data.content.cta.label, (val) => helpers.setText(cta, val));
        const href = helpers.normalizeUrl(data.content.cta.href);
        if (href) helpers.setAttr(cta, "href", href);
      }
    }
  }
}

function applyMatching(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-matching");
  if (!section) return;

  const left = findWithin(section, helpers, "coren-matching__left");
  if (left) {
    const label = findFirstWithin(left, (node) => node.tagName === "span");
    const title = findFirstWithin(left, (node) => node.tagName === "h2");
    const body = findFirstWithin(left, (node) => node.tagName === "p");
    const cta = findFirstWithin(left, (node) => node.tagName === "a");
    setIfString(data.label, (val) => helpers.setText(label, val));
    setIfString(data.title, (val) => helpers.setText(title, val));
    setIfString(data.body, (val) => helpers.setText(body, val));
    if (data.cta) {
      setIfString(data.cta.label, (val) => helpers.setText(cta, val));
      const href = helpers.normalizeUrl(data.cta.href);
      if (href) helpers.setAttr(cta, "href", href);
    }
  }

  if (data.card) {
    const card = findWithin(section, helpers, "coren-matching__card");
    if (card) {
      const title = findFirstWithin(card, (node) => node.tagName === "h3");
      const score = findWithin(card, helpers, "coren-doughnut");
      setIfString(data.card.title, (val) => helpers.setText(title, val));
      setIfString(data.card.score, (val) => helpers.setText(score, val));
      const rows = findAllWithin(card, (node) =>
        helpers.hasClass(node, "coren-breakdown-row")
      );
      const rowData = Array.isArray(data.card.rows) ? data.card.rows : [];
      rows.forEach((row, index) => {
        const entry = rowData[index];
        if (!entry) return;
        const label = findWithin(row, helpers, "coren-breakdown-row__label");
        const points = findWithin(row, helpers, "coren-breakdown-row__points");
        setIfString(entry.label, (val) => helpers.setText(label, val));
        setIfString(entry.points, (val) => helpers.setText(points, val));
      });
    }
  }
}

function applyTrust(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-trust");
  if (!section) return;

  const illustration = findWithin(section, helpers, "coren-trust__illustration");
  setIfString(data.illustration, (val) => helpers.setText(illustration, val));

  const content = findWithin(section, helpers, "coren-trust__content");
  if (content) {
    const label = findFirstWithin(content, (node) => node.tagName === "span");
    const title = findFirstWithin(content, (node) => node.tagName === "h2");
    const body = findFirstWithin(content, (node) => node.tagName === "p");
    setIfString(data.label, (val) => helpers.setText(label, val));
    setIfString(data.title, (val) => helpers.setText(title, val));
    setIfString(data.body, (val) => helpers.setText(body, val));
  }

  const features = findAllWithin(section, (node) =>
    helpers.hasClass(node, "coren-trust__feature")
  );
  const featureData = Array.isArray(data.features) ? data.features : [];
  features.forEach((feature, index) => {
    const item = featureData[index];
    if (!item) return;
    const icon = findWithin(feature, helpers, "coren-icon-circle");
    const title = findFirstWithin(feature, (node) => node.tagName === "strong");
    const body = findFirstWithin(feature, (node) => node.tagName === "p");
    setIfString(item.icon, (val) => helpers.setText(icon, val));
    setIfString(item.title, (val) => helpers.setText(title, val));
    setIfString(item.body, (val) => helpers.setText(body, val));
  });
}

function applyAnalytics(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-analytics");
  if (!section) return;

  const header = findWithin(section, helpers, "coren-analytics__header");
  if (header) {
    const label = findFirstWithin(header, (node) => node.tagName === "span");
    const title = findFirstWithin(header, (node) => node.tagName === "h2");
    const body = findFirstWithin(header, (node) => node.tagName === "p");
    setIfString(data.label, (val) => helpers.setText(label, val));
    setIfString(data.title, (val) => helpers.setText(title, val));
    setIfString(data.body, (val) => helpers.setText(body, val));
  }

  const stack = findWithin(section, helpers, "coren-analytics__stack");
  if (stack) {
    const metrics = findAllWithin(stack, (node) =>
      helpers.hasClass(node, "coren-metric-card")
    );
    const metricData = Array.isArray(data.metrics) ? data.metrics : [];
    metrics.forEach((metric, index) => {
      const item = metricData[index];
      if (!item) return;
      const icon = findWithin(metric, helpers, "coren-icon-circle");
      const number = findWithin(metric, helpers, "coren-metric-card__number");
      const label = findWithin(metric, helpers, "coren-metric-card__label");
      const trend = findWithin(metric, helpers, "coren-metric-card__trend");
      setIfString(item.icon, (val) => helpers.setText(icon, val));
      setIfString(item.number, (val) => helpers.setText(number, val));
      setIfString(item.label, (val) => helpers.setText(label, val));
      setIfString(item.trend, (val) => helpers.setText(trend, val));
    });

    const ctaCard = findWithin(stack, helpers, "coren-cta-card");
    if (ctaCard && data.cta) {
      const text = findFirstWithin(ctaCard, (node) => node.tagName === "p");
      const link = findFirstWithin(ctaCard, (node) => node.tagName === "a");
      setIfString(data.cta.text, (val) => helpers.setText(text, val));
      if (data.cta.link) {
        setIfString(data.cta.link.label, (val) => helpers.setText(link, val));
        const href = helpers.normalizeUrl(data.cta.link.href);
        if (href) helpers.setAttr(link, "href", href);
      }
    }
  }

  const main = findWithin(section, helpers, "coren-analytics__main-card");
  if (main) {
    const headings = findAllWithin(main, (node) => node.tagName === "h3");
    setIfString(data.performance?.title, (val) => helpers.setText(headings[0], val));
    setIfString(data.score?.title, (val) => helpers.setText(headings[1], val));

    const rows = findAllWithin(main, (node) =>
      helpers.hasClass(node, "coren-progress-row")
    );
    const perfRows = Array.isArray(data.performance?.rows)
      ? data.performance.rows
      : [];
    const scoreRows = Array.isArray(data.score?.rows) ? data.score.rows : [];
    rows.forEach((row, index) => {
      const entry = index < perfRows.length ? perfRows[index] : scoreRows[index - perfRows.length];
      if (!entry) return;
      const header = findWithin(row, helpers, "coren-progress-row__header");
      if (!header) return;
      const spans = (header.childNodes || []).filter((node) => node.tagName === "span");
      setIfString(entry.label, (val) => helpers.setText(spans[0], val));
      setIfString(entry.value, (val) => helpers.setText(spans[1], val));
    });
  }
}

function applyFinalCta(helpers, data) {
  if (!data) return;
  const section = helpers.findByClass("coren-final-cta");
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
}

export function applyCorenPageCms(html, data) {
  if (!data) return html;
  return updateHtml(html, (helpers) => {
    applyHero(helpers, data.hero);
    applyOpportunity(helpers, data.opportunity);
    applyHowItWorks(helpers, data.howItWorks);
    applyPricing(helpers, data.pricing);
    applyFaq(helpers, data.faq);
    applyProfile(helpers, data.profile);
    applyMatching(helpers, data.matching);
    applyTrust(helpers, data.trust);
    applyAnalytics(helpers, data.analytics);
    applyFinalCta(helpers, data.finalCta);
  });
}
