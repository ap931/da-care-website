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
      defineField({
        name: "label",
        title: "Label",
        type: "string",
        validation: (Rule) => Rule.max(80),
      }),
      defineField({
        name: "href",
        title: "Link",
        type: "string",
        validation: validateHref,
      }),
    ],
  });

const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: false },
    fields: [
      defineField({
        name: "alt",
        title: "Alt Text",
        type: "string",
        validation: (Rule) => Rule.max(160),
      }),
    ],
  });

export default defineType({
  name: "ledaBusinessPage",
  title: "Leda Business Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "badge", title: "Badge", type: "string" }),
        defineField({ name: "titlePrefix", title: "Title Prefix", type: "string" }),
        defineField({ name: "titleAccent", title: "Title Accent", type: "string" }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "text",
          rows: 3,
        }),
        ctaField("primaryCta", "Primary CTA"),
        ctaField("secondaryCta", "Secondary CTA"),
        defineField({
          name: "trust",
          title: "Trust Items",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [
                defineField({
                  name: "text",
                  title: "Text",
                  type: "string",
                  validation: (Rule) => Rule.max(60),
                }),
              ],
            }),
          ],
        }),
        imageField("image", "Hero Image"),
      ],
    }),
    defineField({
      name: "dividers",
      title: "Divider Labels",
      type: "object",
      fields: [
        defineField({ name: "features", title: "Features", type: "string" }),
        defineField({ name: "problem", title: "The Problem", type: "string" }),
        defineField({ name: "howItWorks", title: "How It Works", type: "string" }),
        defineField({ name: "why", title: "Why Leda Business", type: "string" }),
        defineField({ name: "ecosystem", title: "Ecosystem", type: "string" }),
        defineField({ name: "pricing", title: "Pricing", type: "string" }),
      ],
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.min(6).max(6),
          of: [
            defineField({
              name: "item",
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
      name: "problem",
      title: "The Problem",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
        defineField({
          name: "cards",
          title: "Cards",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "card",
              type: "object",
              fields: [
                defineField({ name: "tag", title: "Tag", type: "string" }),
                defineField({ name: "value", title: "Value", type: "string" }),
                defineField({ name: "description", title: "Description", type: "string" }),
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
          validation: (Rule) => Rule.min(4).max(4),
          of: [
            defineField({
              name: "step",
              type: "object",
              fields: [
                defineField({ name: "index", title: "Index", type: "string" }),
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
              ],
            }),
          ],
        }),
        imageField("image", "Editorial Image"),
      ],
    }),
    defineField({
      name: "why",
      title: "Why Leda Business",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
        defineField({
          name: "cards",
          title: "Cards",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "card",
              type: "object",
              fields: [
                defineField({ name: "ghost", title: "Ghost Text", type: "string" }),
                defineField({ name: "icon", title: "Icon", type: "string" }),
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "ecosystem",
      title: "Ecosystem",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
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
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "tag", title: "Tag", type: "string" }),
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
        defineField({ name: "pill", title: "Pill", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
        defineField({
          name: "cards",
          title: "Cards",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "card",
              type: "object",
              fields: [
                defineField({ name: "badge", title: "Badge", type: "string" }),
                defineField({ name: "tier", title: "Tier", type: "string" }),
                defineField({ name: "price", title: "Price", type: "string" }),
                defineField({ name: "note", title: "Note", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
                defineField({
                  name: "features",
                  title: "Features",
                  type: "array",
                  validation: (Rule) => Rule.min(2).max(2),
                  of: [
                    defineField({
                      name: "feature",
                      type: "object",
                      fields: [
                        defineField({
                          name: "text",
                          title: "Text",
                          type: "string",
                          validation: (Rule) => Rule.max(80),
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
        defineField({ name: "footnote", title: "Footnote", type: "string" }),
      ],
    }),
  ],
});
