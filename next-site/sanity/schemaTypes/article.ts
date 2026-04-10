import { defineField, defineType } from "sanity";

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
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "slug",
      title: "ID",
      description: "Used in the URL query parameter (?id=...)",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "string",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "readTime",
      title: "Read Time",
      type: "string",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(600),
    }),
    imageField("image", "Hero Image"),
    imageField("thumbnail", "Thumbnail"),
    defineField({
      name: "content",
      title: "Content Blocks",
      type: "array",
      of: [
        defineField({
          name: "contentBlock",
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Paragraph", value: "p" },
                  { title: "Heading", value: "h2" },
                  { title: "Image", value: "img" },
                ],
              },
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 4,
            }),
            imageField("image", "Image"),
          ],
        }),
      ],
    }),
  ],
});
