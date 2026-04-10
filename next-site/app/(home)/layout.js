import { buildThemeStyle } from "@/app/_lib/cms/theme";
import { getHomePage } from "@/app/_lib/sanity/homepage";

export const revalidate = 3600;

export default async function RootLayout({ children }) {
  const data = await getHomePage();
  const themeStyle = buildThemeStyle(data?.theme);
  return (
    <html lang="en">
      <head>
        <meta
          name="description"
          content="Welcome to da.care - Premium auto care services."
        />
        <title>Home — da.care</title>

        <meta property="og:title" content="Home — da.care" />
        <meta
          property="og:description"
          content="Welcome to da.care - Premium auto care services."
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />

        <link rel="icon" type="image/png" href="/images/favicon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <link rel="stylesheet" href="/css/reset.css" />
        <link rel="stylesheet" href="/css/variables.css" />
        <link rel="stylesheet" href="/css/global.css" />
        <link rel="stylesheet" href="/css/components.css" />
        <link rel="stylesheet" href="/css/pages/homepage.css" />
        {themeStyle ? (
          <style id="cms-theme" dangerouslySetInnerHTML={{ __html: themeStyle }} />
        ) : null}
      </head>
      <body className="homepage">{children}</body>
    </html>
  );
}
