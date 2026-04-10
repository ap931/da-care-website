import { StaticPage } from "@/app/_lib/static-page";
import { applyCorenPageCms } from "@/app/_lib/cms/coren";
import { applySiteSettingsCms } from "@/app/_lib/cms/site-settings";
import { getCorenPage } from "@/app/_lib/sanity/coren";
import { getSiteSettings } from "@/app/_lib/sanity/site-settings";

export const revalidate = 3600;

export default async function Page() {
  const [siteSettings, corenPage] = await Promise.all([
    getSiteSettings(),
    getCorenPage(),
  ]);
  return (
    <StaticPage
      file="coren.html"
      transform={(html) =>
        applyCorenPageCms(applySiteSettingsCms(html, siteSettings), corenPage)
      }
    />
  );
}
