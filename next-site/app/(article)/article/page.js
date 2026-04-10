import { StaticPage } from "@/app/_lib/static-page";
import { applyArticleCms } from "@/app/_lib/cms/article";
import { applySiteSettingsCms } from "@/app/_lib/cms/site-settings";
import { getArticles } from "@/app/_lib/sanity/articles";
import { getSiteSettings } from "@/app/_lib/sanity/site-settings";

export const revalidate = 3600;

export default async function Page({ searchParams }) {
  const [siteSettings, articles] = await Promise.all([
    getSiteSettings(),
    getArticles(),
  ]);
  const list = Array.isArray(articles) ? articles : [];
  const id = typeof searchParams?.id === "string" ? searchParams.id : null;
  const index = id ? list.findIndex((item) => item.id === id) : 0;
  const safeIndex = index >= 0 ? index : 0;
  const article = list[safeIndex] || null;
  const prev = safeIndex > 0 ? list[safeIndex - 1] : null;
  const next = safeIndex < list.length - 1 ? list[safeIndex + 1] : null;
  const availableIds = list.map((item) => item.id).filter(Boolean);
  return (
    <StaticPage
      file="article.html"
      transform={(html) =>
        applyArticleCms(applySiteSettingsCms(html, siteSettings), {
          article,
          prev,
          next,
          articleId: id,
          availableIds,
        })
      }
    />
  );
}
