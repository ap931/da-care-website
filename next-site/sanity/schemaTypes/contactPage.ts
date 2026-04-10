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

export default defineType({
  name: "contactPage",
  title: "Contact Page",
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
      ],
    }),
    defineField({
      name: "locations",
      title: "Locations",
      type: "array",
      validation: (Rule) => Rule.min(3).max(3),
      of: [
        defineField({
          name: "location",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (Rule) => Rule.max(80),
            }),
            defineField({
              name: "line1",
              title: "Address Line 1",
              type: "string",
              validation: (Rule) => Rule.max(120),
            }),
            defineField({
              name: "line2",
              title: "Address Line 2",
              type: "string",
              validation: (Rule) => Rule.max(120),
            }),
            defineField({
              name: "line3",
              title: "Address Line 3",
              type: "string",
              validation: (Rule) => Rule.max(120),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.min(5).max(5),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [
                defineField({
                  name: "question",
                  title: "Question",
                  type: "string",
                  validation: (Rule) => Rule.max(120),
                }),
                defineField({
                  name: "answer",
                  title: "Answer",
                  type: "text",
                  rows: 4,
                  validation: (Rule) => Rule.max(800),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});
