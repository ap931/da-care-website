import { StaticPage } from "@/app/_lib/static-page";
import { applyLedaPageCms } from "@/app/_lib/cms/leda";
import { applySiteSettingsCms } from "@/app/_lib/cms/site-settings";
import { getLedaPage } from "@/app/_lib/sanity/leda";
import { getSiteSettings } from "@/app/_lib/sanity/site-settings";

export const revalidate = 3600;

export default async function Page() {
  const [siteSettings, ledaPage] = await Promise.all([
    getSiteSettings(),
    getLedaPage(),
  ]);
  return (
    <StaticPage
      file="leda.html"
      transform={(html) =>
        applyLedaPageCms(applySiteSettingsCms(html, siteSettings), ledaPage)
      }
    />
  );
}
