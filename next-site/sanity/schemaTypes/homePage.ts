import { defineField, defineType } from "sanity";

const colorRegex =
  /^#([0-9a-fA-F]{3,8})$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$|^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$|^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$|^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|1|0?\.\d+)\s*\)$/;

const validateColor = (Rule: any) =>
  Rule.custom((value: string | undefined) => {
    if (!value) return true;
    return colorRegex.test(value.trim())
      ? true
      : "Use hex, rgb(), rgba(), hsl(), or hsla()";
  });

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

const productField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({
        name: "pill",
        title: "Pill",
        type: "string",
        validation: (Rule) => Rule.max(40),
      }),
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
        validation: (Rule) => Rule.max(200),
      }),
      ctaField("primaryCta", "Primary CTA"),
      ctaField("secondaryCta", "Secondary CTA"),
    ],
  });

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (Rule) => Rule.max(40),
        }),
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
        ctaField("primaryCta", "Primary CTA"),
        ctaField("secondaryCta", "Secondary CTA"),
      ],
    }),
    defineField({
      name: "noise",
      title: "Noise Headlines",
      type: "object",
      fields: [
        defineField({
          name: "text1",
          title: "Text 1",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "text2",
          title: "Text 2",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
        defineField({
          name: "text3",
          title: "Text 3",
          type: "string",
          validation: (Rule) => Rule.max(80),
        }),
      ],
    }),
    defineField({
      name: "products",
      title: "Products",
      type: "object",
      fields: [
        productField("leda", "Leda"),
        productField("ledaWork", "Leda Work"),
        productField("coren", "Coren"),
      ],
    }),
    defineField({
      name: "obsolete",
      title: "Obsolete Section",
      type: "object",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          validation: (Rule) => Rule.max(40),
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (Rule) => Rule.max(120),
        }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          validation: (Rule) => Rule.max(2),
          of: [
            defineField({
              name: "item",
              type: "object",
              fields: [
                defineField({
                  name: "number",
                  title: "Number",
                  type: "string",
                  validation: (Rule) => Rule.max(16),
                }),
                defineField({
                  name: "line",
                  title: "Line",
                  type: "string",
                  validation: (Rule) => Rule.max(140),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "about",
      title: "About Section",
      type: "object",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          validation: (Rule) => Rule.max(40),
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (Rule) => Rule.max(120),
        }),
        defineField({
          name: "body",
          title: "Body",
          type: "text",
          rows: 3,
          validation: (Rule) => Rule.max(240),
        }),
        defineField({
          name: "stats",
          title: "Stats",
          type: "array",
          validation: (Rule) => Rule.max(3),
          of: [
            defineField({
              name: "stat",
              type: "object",
              fields: [
                defineField({
                  name: "number",
                  title: "Number",
                  type: "string",
                  validation: (Rule) => Rule.max(16),
                }),
                defineField({
                  name: "label",
                  title: "Label",
                  type: "string",
                  validation: (Rule) => Rule.max(80),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "theme",
      title: "Theme Colors",
      type: "object",
      fields: [
        defineField({ name: "coral", title: "Coral", type: "string", validation: validateColor }),
        defineField({ name: "coralDark", title: "Coral Dark", type: "string", validation: validateColor }),
        defineField({ name: "coralLight", title: "Coral Light", type: "string", validation: validateColor }),
        defineField({ name: "mint", title: "Mint", type: "string", validation: validateColor }),
        defineField({ name: "mintDark", title: "Mint Dark", type: "string", validation: validateColor }),
        defineField({ name: "mintLight", title: "Mint Light", type: "string", validation: validateColor }),
        defineField({ name: "sky", title: "Sky", type: "string", validation: validateColor }),
        defineField({ name: "skyDark", title: "Sky Dark", type: "string", validation: validateColor }),
        defineField({ name: "skyLight", title: "Sky Light", type: "string", validation: validateColor }),
        defineField({ name: "textPrimary", title: "Text Primary", type: "string", validation: validateColor }),
        defineField({ name: "textSecondary", title: "Text Secondary", type: "string", validation: validateColor }),
        defineField({ name: "textTertiary", title: "Text Tertiary", type: "string", validation: validateColor }),
        defineField({ name: "textDisabled", title: "Text Disabled", type: "string", validation: validateColor }),
        defineField({ name: "bgWhite", title: "Background White", type: "string", validation: validateColor }),
        defineField({ name: "bgSubtle", title: "Background Subtle", type: "string", validation: validateColor }),
        defineField({ name: "surface", title: "Surface", type: "string", validation: validateColor }),
        defineField({ name: "borderDefault", title: "Border Default", type: "string", validation: validateColor }),
        defineField({ name: "borderLight", title: "Border Light", type: "string", validation: validateColor }),
      ],
    }),
  ],
});
