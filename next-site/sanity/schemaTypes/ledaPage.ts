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

const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: false },
    fields: [
      defineField({ name: "alt", title: "Alt Text", type: "string" }),
    ],
  });

export default defineType({
  name: "ledaPage",
  title: "Leda Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
        ctaField("cta", "CTA"),
        imageField("background", "Background Image"),
      ],
    }),
    defineField({
      name: "splitVideo",
      title: "Split Video",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({ name: "video", title: "Video URL", type: "string" }),
      ],
    }),
    defineField({
      name: "benefits",
      title: "Benefits Carousel",
      type: "object",
      fields: [
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.min(4).max(4),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [
                imageField("image", "Image"),
                imageField("icon", "Icon"),
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
                defineField({ name: "overlay", title: "Overlay Label", type: "string" }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "apps",
      title: "Apps Section",
      type: "object",
      fields: [
        imageField("image", "Image"),
        defineField({ name: "titleLine1", title: "Title Line 1", type: "string" }),
        defineField({ name: "titleLine2", title: "Title Line 2", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({
          name: "logos",
          title: "Logos",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [imageField("logo", "Logo")],
        }),
      ],
    }),
    defineField({
      name: "modules",
      title: "Modules Carousel",
      type: "object",
      fields: [
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.min(3).max(3),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [
                imageField("image", "Image"),
                imageField("icon", "Icon"),
                defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "bento",
      title: "Bento Grid",
      type: "object",
      fields: [
        defineField({ name: "row1Title", title: "Row 1 Title", type: "string" }),
        defineField({ name: "row1Body", title: "Row 1 Body", type: "string" }),
        defineField({ name: "row2Title", title: "Row 2 Title", type: "string" }),
        defineField({ name: "row2Body", title: "Row 2 Body", type: "string" }),
        defineField({ name: "row3Title", title: "Row 3 Title", type: "string" }),
        defineField({ name: "tickerLabel", title: "Ticker Label", type: "string" }),
      ],
    }),
    defineField({
      name: "privacy",
      title: "Privacy Section",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({
          name: "card",
          title: "Data Card",
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "id", title: "ID", type: "string" }),
            defineField({ name: "context", title: "Context", type: "string" }),
          ],
        }),
        defineField({
          name: "stations",
          title: "Stations",
          type: "object",
          fields: [
            defineField({ name: "user", title: "User Label", type: "string" }),
            defineField({ name: "encrypt", title: "Encrypt Label", type: "string" }),
            defineField({ name: "security", title: "Security Label", type: "string" }),
            defineField({ name: "strip", title: "Strip Label", type: "string" }),
            defineField({ name: "ai", title: "AI Label", type: "string" }),
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
        imageField("image", "Image"),
      ],
    }),
  ],
});
