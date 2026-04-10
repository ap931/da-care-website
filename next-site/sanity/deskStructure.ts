import type { StructureResolver } from "sanity/desk";

export const singletonActions = new Set(["publish", "discardChanges", "restore"]);
export const singletonTypes = new Set([
  "homePage",
  "siteSettings",
  "aboutPage",
  "contactPage",
  "ledaBusinessPage",
  "corenPage",
  "ledaPage",
]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
      S.listItem()
        .title("Contact Page")
        .id("contactPage")
        .child(S.document().schemaType("contactPage").documentId("contactPage")),
      S.listItem()
        .title("Leda Business Page")
        .id("ledaBusinessPage")
        .child(
          S.document().schemaType("ledaBusinessPage").documentId("ledaBusinessPage")
        ),
      S.listItem()
        .title("Coren Page")
        .id("corenPage")
        .child(S.document().schemaType("corenPage").documentId("corenPage")),
      S.listItem()
        .title("Leda Page")
        .id("ledaPage")
        .child(S.document().schemaType("ledaPage").documentId("ledaPage")),
      S.documentTypeListItem("article").title("Articles"),
      S.listItem()
        .title("About Page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Home Page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
    ]);
