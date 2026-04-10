export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content="Read our latest article on da.care" />
        <title>Article — da.care</title>

        <meta property="og:title" content="Article — da.care" />
        <meta
          property="og:description"
          content="Read our latest article on da.care"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />

        <link rel="icon" type="image/png" href="/images/favicon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <link rel="stylesheet" href="/css/reset.css" />
        <link rel="stylesheet" href="/css/variables.css" />
        <link rel="stylesheet" href="/css/global.css" />
        <link rel="stylesheet" href="/css/components.css" />
        <link rel="stylesheet" href="/css/pages/article.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
