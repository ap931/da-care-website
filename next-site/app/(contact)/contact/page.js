import { StaticPage } from "@/app/_lib/static-page";
import { applyContactPageCms } from "@/app/_lib/cms/contact";
import { applySiteSettingsCms } from "@/app/_lib/cms/site-settings";
import { getContactPage } from "@/app/_lib/sanity/contact";
import { getSiteSettings } from "@/app/_lib/sanity/site-settings";

export const revalidate = 3600;

export default async function Page() {
  const [siteSettings, contactPage] = await Promise.all([
    getSiteSettings(),
    getContactPage(),
  ]);
  return (
    <StaticPage
      file="contact.html"
      transform={(html) =>
        applyContactPageCms(applySiteSettingsCms(html, siteSettings), contactPage)
      }
    />
  );
}
