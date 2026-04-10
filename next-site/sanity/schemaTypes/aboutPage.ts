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
        validation: (Rule) => Rule.max(60),
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
        validation: (Rule) => Rule.max(120),
      }),
    ],
  });

export default defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
          validation: (Rule) => Rule.max(240),
        }),
        ctaField("cta", "CTA"),
        imageField("background", "Background Image"),
      ],
    }),
    defineField({
      name: "manifesto",
      title: "Manifesto",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "body",
          title: "Body",
          type: "text",
          rows: 4,
          validation: (Rule) => Rule.max(600),
        }),
      ],
    }),
    defineField({
      name: "values",
      title: "Values",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Section Title",
          type: "string",
          validation: (Rule) => Rule.max(120),
        }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.max(7),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [
                defineField({
                  name: "term",
                  title: "Term",
                  type: "string",
                  validation: (Rule) => Rule.max(40),
                }),
                defineField({
                  name: "definition",
                  title: "Definition",
                  type: "string",
                  validation: (Rule) => Rule.max(200),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "origin",
      title: "Origin Story",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "array",
          validation: (Rule) => Rule.max(2),
          of: [defineField({ name: "paragraph", type: "text", rows: 4 })],
        }),
      ],
    }),
    imageField("breakoutImage", "Breakout Image"),
    defineField({
      name: "working",
      title: "Working With Us",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (Rule) => Rule.max(120),
        }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.max(3),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [
                defineField({
                  name: "title",
                  title: "Title",
                  type: "string",
                  validation: (Rule) => Rule.max(80),
                }),
                defineField({
                  name: "body",
                  title: "Body",
                  type: "text",
                  rows: 4,
                  validation: (Rule) => Rule.max(500),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "teamSpirit",
      title: "Team Spirit",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "paragraph1",
          title: "Paragraph 1",
          type: "text",
          rows: 4,
          validation: (Rule) => Rule.max(500),
        }),
        defineField({
          name: "linkPrefix",
          title: "Paragraph 2 (Text Before Link)",
          description: "Include the trailing space before the link text.",
          type: "string",
          validation: (Rule) => Rule.max(200),
        }),
        defineField({
          name: "linkLabel",
          title: "Link Label",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "linkHref",
          title: "Link URL",
          type: "string",
          validation: validateHref,
        }),
      ],
    }),
  ],
});
