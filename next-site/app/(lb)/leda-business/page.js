import { StaticPage } from "@/app/_lib/static-page";
import { applyLedaBusinessPageCms } from "@/app/_lib/cms/leda-business";
import { applySiteSettingsCms } from "@/app/_lib/cms/site-settings";
import { getLedaBusinessPage } from "@/app/_lib/sanity/leda-business";
import { getSiteSettings } from "@/app/_lib/sanity/site-settings";

export const revalidate = 3600;

export default async function Page() {
  const [siteSettings, ledaBusiness] = await Promise.all([
    getSiteSettings(),
    getLedaBusinessPage(),
  ]);
  return (
    <StaticPage
      file="leda-business.html"
      transform={(html) =>
        applyLedaBusinessPageCms(
          applySiteSettingsCms(html, siteSettings),
          ledaBusiness
        )
      }
    />
  );
}
