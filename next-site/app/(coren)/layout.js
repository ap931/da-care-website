export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="description"
          content="Join Coren as a verified provider. Get AI-matched with the right clients, build your profile in minutes, and grow your practice — completely free."
        />
        <title>For Providers — Coren</title>

        <meta property="og:title" content="For Providers — Coren" />
        <meta
          property="og:description"
          content="Your next client is searching. Make sure they find you. Free, verified profiles for independent providers."
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

        <link rel="stylesheet" href="/css/reset.css" />
        <link rel="stylesheet" href="/css/variables.css" />
        <link rel="stylesheet" href="/css/global.css" />
        <link rel="stylesheet" href="/css/components.css" />
        <link rel="stylesheet" href="/css/pages/coren.css" />
      </head>
      <body className="coren-page">{children}</body>
    </html>
  );
}
