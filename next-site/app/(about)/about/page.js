import { StaticPage } from "@/app/_lib/static-page";
import { applyAboutPageCms } from "@/app/_lib/cms/about";
import { applySiteSettingsCms } from "@/app/_lib/cms/site-settings";
import { getAboutPage } from "@/app/_lib/sanity/about";
import { getSiteSettings } from "@/app/_lib/sanity/site-settings";

export const revalidate = 3600;

export default async function Page() {
  const [siteSettings, aboutPage] = await Promise.all([
    getSiteSettings(),
    getAboutPage(),
  ]);
  return (
    <StaticPage
      file="about.html"
      transform={(html) =>
        applyAboutPageCms(applySiteSettingsCms(html, siteSettings), aboutPage)
      }
    />
  );
}
