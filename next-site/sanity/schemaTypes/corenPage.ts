import { defineField, defineType } from "sanity";

const validateHref = (Rule: any) =>
  Rule.custom((value: string | undefined) => {
    if (!value) return true;
    const trimmed = value.trim();
    if (
      trimmed.startsWith("/") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:")
    ) {
      return true;
    }
    return "Use a relative URL (/path), hash (#id), or absolute URL (https://)";
  });

const ctaField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "label", title: "Label", type: "string" }),
      defineField({ name: "href", title: "Link", type: "string", validation: validateHref }),
    ],
  });

const textArray = (name: string, title: string, min: number, max: number) =>
  defineField({
    name,
    title,
    type: "array",
    validation: (Rule) => Rule.min(min).max(max),
    of: [
      defineField({
        name: "item",
        type: "object",
        fields: [defineField({ name: "text", title: "Text", type: "string" })],
      }),
    ],
  });

export default defineType({
  name: "corenPage",
  title: "Coren Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "subtitle", title: "Subtitle", type: "text", rows: 3 }),
        ctaField("primaryCta", "Primary CTA"),
        ctaField("secondaryCta", "Secondary CTA"),
        textArray("trust", "Trust Markers", 3, 3),
        defineField({
          name: "card",
          title: "Hero Card",
          type: "object",
          fields: [
            defineField({ name: "badge", title: "Badge", type: "string" }),
            textArray("tags", "Tags", 3, 3),
            ctaField("cta", "Card CTA"),
            defineField({ name: "fitLabel", title: "Fit Label", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "opportunity",
      title: "Opportunity",
      type: "object",
      fields: [
        defineField({
          name: "cards",
          title: "Cards",
          type: "array",
          validation: (Rule) => Rule.min(2).max(2),
          of: [
            defineField({
              name: "card",
              type: "object",
              fields: [
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "icon", title: "Icon", type: "string" }),
                defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
                defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
              ],
            }),
          ],
        }),
        defineField({
          name: "stats",
          title: "Stats",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "stat",
              type: "object",
              fields: [
                defineField({ name: "number", title: "Number", type: "string" }),
                defineField({ name: "caption", title: "Caption", type: "string" }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "howItWorks",
      title: "How It Works",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
        defineField({
          name: "steps",
          title: "Steps",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "step",
              type: "object",
              fields: [
                defineField({ name: "icon", title: "Icon", type: "string" }),
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
        defineField({
          name: "card",
          title: "Pricing Card",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
            defineField({ name: "price", title: "Price", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "featuresLabel", title: "Features Label", type: "string" }),
            defineField({
              name: "groups",
              title: "Feature Groups",
              type: "array",
              validation: (Rule) => Rule.min(4).max(4),
              of: [
                defineField({
                  name: "group",
                  type: "object",
                  fields: [
                    defineField({ name: "category", title: "Category", type: "string" }),
                    defineField({
                      name: "items",
                      title: "Items",
                      type: "array",
                      of: [
                        defineField({
                          name: "item",
                          type: "object",
                          fields: [defineField({ name: "text", title: "Text", type: "string" })],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            ctaField("cta", "CTA"),
          ],
        }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.min(4).max(4),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [defineField({ name: "question", title: "Question", type: "string" })],
            }),
          ],
        }),
        defineField({ name: "ctaText", title: "CTA Text", type: "string" }),
      ],
    }),
    defineField({
      name: "profile",
      title: "Profile Preview",
      type: "object",
      fields: [
        defineField({
          name: "card",
          title: "Profile Card",
          type: "object",
          fields: [
            defineField({ name: "matchLabel", title: "Match Label", type: "string" }),
            textArray("tags", "Tags", 3, 3),
            textArray("details", "Details", 3, 3),
            defineField({ name: "availabilityLabel", title: "Availability Label", type: "string" }),
            textArray("slots", "Slots", 3, 3),
            ctaField("cta", "Card CTA"),
          ],
        }),
        defineField({
          name: "content",
          title: "Content",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
            textArray("checklist", "Checklist", 4, 4),
            ctaField("cta", "CTA"),
          ],
        }),
      ],
    }),
    defineField({
      name: "matching",
      title: "Smart Matching",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        ctaField("cta", "CTA"),
        defineField({
          name: "card",
          title: "Match Card",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "score", title: "Score", type: "string" }),
            defineField({
              name: "rows",
              title: "Rows",
              type: "array",
              validation: (Rule) => Rule.min(7).max(7),
              of: [
                defineField({
                  name: "row",
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string" }),
                    defineField({ name: "points", title: "Points", type: "string" }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "trust",
      title: "Trust & Verification",
      type: "object",
      fields: [
        defineField({ name: "illustration", title: "Illustration", type: "string" }),
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({
          name: "features",
          title: "Features",
          type: "array",
          validation: (Rule) => Rule.min(4).max(4),
          of: [
            defineField({
              name: "feature",
              type: "object",
              fields: [
                defineField({ name: "icon", title: "Icon", type: "string" }),
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "analytics",
      title: "Analytics",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({
          name: "metrics",
          title: "Metrics",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "metric",
              type: "object",
              fields: [
                defineField({ name: "icon", title: "Icon", type: "string" }),
                defineField({ name: "number", title: "Number", type: "string" }),
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "trend", title: "Trend", type: "string" }),
              ],
            }),
          ],
        }),
        defineField({
          name: "cta",
          title: "CTA",
          type: "object",
          fields: [
            defineField({ name: "text", title: "Text", type: "string" }),
            ctaField("link", "Link"),
          ],
        }),
        defineField({
          name: "performance",
          title: "Performance",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "rows",
              title: "Rows",
              type: "array",
              validation: (Rule) => Rule.min(2).max(2),
              of: [
                defineField({
                  name: "row",
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string" }),
                    defineField({ name: "value", title: "Value", type: "string" }),
                  ],
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "score",
          title: "Score Breakdown",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "rows",
              title: "Rows",
              type: "array",
              validation: (Rule) => Rule.min(4).max(4),
              of: [
                defineField({
                  name: "row",
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string" }),
                    defineField({ name: "value", title: "Value", type: "string" }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "finalCta",
      title: "Final CTA",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        ctaField("cta", "CTA"),
      ],
    }),
  ],
});
