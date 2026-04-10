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

const navItem = (name: string, title: string) =>
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
      defineField({
        name: "newTab",
        title: "Open in New Tab",
        type: "boolean",
        initialValue: false,
      }),
    ],
  });

const socialItem = defineField({
  name: "social",
  title: "Social Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: validateHref,
    }),
    defineField({
      name: "newTab",
      title: "Open in New Tab",
      type: "boolean",
      initialValue: true,
    }),
  ],
});

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "brand",
      title: "Brand",
      type: "object",
      fields: [
        defineField({
          name: "logo",
          title: "Logo",
          type: "image",
          options: { hotspot: false },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (Rule) => Rule.max(80),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "navigation",
      title: "Header Navigation",
      type: "array",
      of: [navItem("navItem", "Nav Item")],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: "footerNavigation",
      title: "Footer Navigation",
      type: "array",
      of: [navItem("footerNavItem", "Footer Nav Item")],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: "footerLegal",
      title: "Footer Legal",
      type: "array",
      of: [navItem("footerLegalItem", "Footer Legal Item")],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [socialItem],
      validation: (Rule) => Rule.max(6),
    }),
  ],
});
