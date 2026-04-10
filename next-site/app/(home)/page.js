import { StaticPage } from "@/app/_lib/static-page";
import { applyHomePageCms } from "@/app/_lib/cms/homepage";
import { applySiteSettingsCms } from "@/app/_lib/cms/site-settings";
import { getHomePage } from "@/app/_lib/sanity/homepage";
import { getSiteSettings } from "@/app/_lib/sanity/site-settings";

export const revalidate = 3600;

export default async function Page() {
  const [data, siteSettings] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
  ]);
  return (
    <StaticPage
      file="index.html"
      transform={(html) =>
        applyHomePageCms(applySiteSettingsCms(html, siteSettings), data)
      }
    />
  );
}
