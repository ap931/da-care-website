export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="description"
          content="Leda - Advanced automotive solutions for the future."
        />
        <title>Leda — da.care</title>

        <meta property="og:title" content="Leda — da.care" />
        <meta
          property="og:description"
          content="Leda - Advanced automotive solutions for the future."
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
        <link rel="stylesheet" href="/css/pages/leda.css" />
      </head>
      <body className="leda-page">{children}</body>
    </html>
  );
}
