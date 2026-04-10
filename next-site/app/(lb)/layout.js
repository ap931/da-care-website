export default function RootLayout({ children }) {
  return (
    <html lang="en" className="lb-page">
      <head>
        <meta
          name="description"
          content="Leda Business — the AI-powered daily planner that connects your work apps into one calm, intelligent dashboard. End app-switching fatigue."
        />
        <title>Leda Business — AI-Powered Daily Planner | da.care</title>

        <meta
          property="og:title"
          content="Leda Business — AI-Powered Daily Planner | da.care"
        />
        <meta
          property="og:description"
          content="One intelligent dashboard for all your work. AI-prioritised tasks, smart rescheduling, and universal focus mode."
        />
        <meta property="og:image" content="/images/LB/Prototype v0.1.png" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Leda Business — AI-Powered Daily Planner | da.care"
        />
        <meta
          name="twitter:description"
          content="One intelligent dashboard for all your work. AI-prioritised tasks, smart rescheduling, and universal focus mode."
        />
        <meta name="twitter:image" content="/images/LB/Prototype v0.1.png" />

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
        <link rel="stylesheet" href="/css/pages/leda-business.css" />
      </head>
      <body className="lb-page">{children}</body>
    </html>
  );
}
