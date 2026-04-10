# Project Structure & Conventions

> **Stack:** Plain HTML / CSS (Custom Properties) / Vanilla JS
> **Deployment:** Vercel (static site)
> **No build tools.** No bundlers, no frameworks, no preprocessors. Just clean, standard web technologies.

---

## Folder Structure

```
/
├── index.html                  ← Home Page
├── leda.html                   ← Leda Page
├── coren.html                  ← Coren Page
├── about.html                  ← About Page
├── contact.html                ← Contact Page
│
├── css/
│   ├── variables.css           ← All design tokens (colors, spacing, typography, animation)
│   ├── reset.css               ← CSS reset / normalize
│   ├── global.css              ← Base styles (body, headings, links, buttons, containers)
│   ├── components.css          ← Shared components (navbar, footer, cards, accordion, carousel)
│   └── pages/
│       ├── home.css            ← Home page-specific layout styles
│       ├── leda.css            ← Leda page-specific layout styles
│       ├── coren.css           ← Coren page-specific layout styles
│       ├── about.css           ← About page-specific layout styles
│       └── contact.css         ← Contact page-specific layout styles
│
├── js/
│   ├── main.js                 ← Shared JS (navbar toggle, scroll animations, reduced-motion)
│   ├── accordion.js            ← Accordion component logic
│   └── carousel.js             ← Carousel/slider component logic
│
├── images/                     ← All image assets (placeholder initially)
│   ├── logo.svg
│   ├── og-image.png            ← 1200×630 social sharing image
│   └── favicon.png
│
├── sitemap.xml                 ← Auto-generated or manual
├── robots.txt                  ← Crawl directives
└── vercel.json                 ← Vercel config (optional, for clean URLs)
```

---

## CSS Architecture

### Load Order

Every HTML page must load stylesheets in this exact order:

```html
<link rel="stylesheet" href="/css/reset.css" />
<link rel="stylesheet" href="/css/variables.css" />
<link rel="stylesheet" href="/css/global.css" />
<link rel="stylesheet" href="/css/components.css" />
<link rel="stylesheet" href="/css/pages/{page-name}.css" />
```

### variables.css

This file contains ALL design tokens and nothing else. No element styles.

```css
:root {
  /* ── Colors ── */
  --coral: #F69B75;
  --coral-dark: #B46D50;
  --coral-light: #F5CFBF;

  --mint: #BACB99;
  --mint-dark: #919F76;
  --mint-light: #C4CCB6;

  --sky: #A9E2FF;
  --sky-dark: #57B1DE;
  --sky-light: #DBF3FF;

  --text-primary: #1B1C1C;
  --text-secondary: #525355;
  --text-tertiary: #898A8D;
  --text-disabled: #B8B9BB;

  --bg-white: #FFFFFF;
  --bg-subtle: #F9FAFB;

  --border-default: #E5E7EB;
  --border-light: #F3F4F6;

  --gradient: linear-gradient(135deg, #DBEBFB 0%, #C8D2B4 50%, #F59A74 100%);

  /* ── Typography (Golden Ratio Derived, base: 1.5rem, step: φ^(1/3) ≈ 1.175) ── */
  --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-sans: 'SF Pro Display', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  --font-h1: clamp(2.75rem, 5vw + 1.25rem, 4.5rem);
  --font-h2: clamp(2.25rem, 3.5vw + 1rem, 3.375rem);
  --font-h3: clamp(1.875rem, 2.5vw + 0.875rem, 2.85rem);
  --font-h4: clamp(1.625rem, 2vw + 0.75rem, 2.427rem);
  --font-h5: clamp(1.5rem, 1.5vw + 0.625rem, 2.075rem);
  --font-h6: clamp(1.375rem, 1vw + 0.5rem, 1.75rem);
  --font-body: clamp(1.25rem, 1vw + 1rem, 1.5rem);
  --font-body-sm: clamp(1.063rem, 0.5vw + 0.875rem, 1.25rem);
  --font-caption: clamp(0.875rem, 0.5vw + 0.75rem, 1rem);

  /* ── Spacing (4px grid) ── */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */

  /* ── Fluid Spacing ── */
  --section-padding: clamp(2rem, 5vw, 6rem);
  --container-padding: clamp(1rem, 5vw, 3rem);
  --card-padding: clamp(1rem, 2.5vw, 1.5rem);
  --card-radius: clamp(0.5rem, 1.5vw, 0.75rem);

  /* ── Border Radius ── */
  --radius-sm: 4px;
  --radius-md: clamp(6px, 1vw, 8px);
  --radius-lg: clamp(8px, 1.5vw, 12px);
  --radius-xl: clamp(12px, 2vw, 16px);
  --radius-2xl: clamp(16px, 2.5vw, 24px);
  --radius-full: 9999px;

  /* ── Animation ── */
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;

  /* ── Layout ── */
  --max-width: 1280px;
  --content-width: 650px;
}
```

### reset.css

Use a minimal modern reset:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

input, button, textarea, select {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

ul, ol {
  list-style: none;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Naming Convention

Use **BEM-like flat classes**. Keep it simple — no deep nesting.

```
.section              → Full-width section wrapper
.container            → Max-width centered container
.hero                 → Hero section
.hero__title          → Element within hero
.hero__description
.hero__actions        → Button group
.card                 → Card component
.card__image
.card__title
.card__button
.navbar               → Navbar component
.footer               → Footer component
.accordion            → Accordion component
.accordion__item
.accordion__item--active
.carousel             → Carousel component
.carousel__track
.carousel__card
.carousel__nav
```

**Rules:**
1. No IDs for styling — only classes.
2. No inline styles — ever.
3. Max one level of nesting in selectors (`.parent .child` is OK, `.a .b .c` is not).
4. Component-specific styles go in `components.css`, page-specific layouts go in `pages/{page}.css`.

---

## HTML Conventions

### Page Template

Every page must follow this template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="[Unique page description, 150-160 chars]" />
  <title>[Page Title] — [Brand Name]</title>

  <!-- Open Graph -->
  <meta property="og:title" content="[Page Title]" />
  <meta property="og:description" content="[Page description]" />
  <meta property="og:image" content="/images/og-image.png" />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/images/favicon.png" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" />

  <!-- Stylesheets (load order matters) -->
  <link rel="stylesheet" href="/css/reset.css" />
  <link rel="stylesheet" href="/css/variables.css" />
  <link rel="stylesheet" href="/css/global.css" />
  <link rel="stylesheet" href="/css/components.css" />
  <link rel="stylesheet" href="/css/pages/[page-name].css" />
</head>
<body>

  <!-- Skip Link (Accessibility) -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Navbar -->
  <header class="navbar" role="banner">
    <!-- ... -->
  </header>

  <!-- Main Content -->
  <main id="main-content">
    <section class="section hero">
      <!-- ... -->
    </section>

    <section class="section">
      <!-- ... -->
    </section>

    <!-- More sections... -->
  </main>

  <!-- Footer -->
  <footer class="footer" role="contentinfo">
    <!-- ... -->
  </footer>

  <!-- Scripts (deferred) -->
  <script src="/js/main.js" defer></script>
  <!-- Page-specific scripts only if needed -->

  <!-- Noscript Fallback -->
  <noscript>
    <div class="noscript-fallback">
      <p>JavaScript enhances this site with animations and interactive features. The core content is fully accessible without it.</p>
    </div>
  </noscript>

</body>
</html>
```

### Semantic HTML Rules

1. **One `<h1>` per page.** Always inside the hero section.
2. **Never skip heading levels.** H1 → H2 → H3 → H4.
3. **Use landmarks:** `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
4. **Every `<section>` should have an aria-label** or contain a heading.
5. **All images must have `alt` text** (descriptive) or `alt=""` (decorative).
6. **All images must have `width` and `height`** attributes to prevent layout shift.
7. **Use `<button>` for actions, `<a>` for navigation.** Never use `<div>` as a button.
8. **All form inputs need `<label>` elements.**
9. **Lazy-load below-the-fold images:** `loading="lazy"`.
10. **Eager-load hero images:** `loading="eager" fetchpriority="high"`.

---

## JavaScript Conventions

1. **All scripts use `defer`** — never block rendering.
2. **No JS for critical content.** HTML must be readable with JS disabled.
3. **JS is for enhancements only:** animations, accordions, carousels, scroll triggers.
4. **Use `IntersectionObserver`** for scroll-triggered animations.
5. **Debounce** scroll and resize listeners.
6. **Respect `prefers-reduced-motion`:**

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

7. **No external JS libraries.** Vanilla JS only.

---

## Vercel Deployment

### vercel.json

Use this for clean URLs (removes `.html` extensions):

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

This means:
- `/about.html` → accessible as `/about`
- `/contact.html` → accessible as `/contact`
- Links in your HTML should use `/about`, `/leda`, etc. (without `.html`).

### Required Files Checklist

Before deploying, ensure these exist:

```
□ index.html          (Home page)
□ leda.html           (Leda page)
□ coren.html          (Coren page)
□ about.html          (About page)
□ contact.html        (Contact page)
□ sitemap.xml         (All page URLs)
□ robots.txt          (Allow all crawlers + sitemap reference)
□ images/favicon.png  (32×32 minimum)
□ images/og-image.png (1200×630)
□ vercel.json         (Clean URLs config)
```

### robots.txt

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

---

## Build Order

Follow this exact order when building. Complete each step before moving to the next.

### Phase 1 — Skeleton

1. Create folder structure.
2. Write `variables.css` with all design tokens.
3. Write `reset.css`.
4. Write `global.css` with base element styles (body, headings, paragraphs, links, buttons, containers).
5. Build the **Navbar** component (HTML + CSS).
6. Build the **Footer** component (HTML + CSS).
7. Create `index.html` with just the Navbar + a placeholder `<main>` + Footer. Verify it renders correctly.

### Phase 2 — Home Page Layout

8. Build each Home Page section one at a time, top to bottom:
   - Hero (split layout)
   - Cards Grid
   - Centered CTA with Avatars
   - Simple Centered CTA
9. Use placeholder gray boxes for images (`background: var(--border-default)`).
10. Test responsive behavior — all columns collapse to single column on mobile.

### Phase 3 — Remaining Pages

11. Build **Leda Page** (most complex — has carousels and bento grid).
12. Build **Coren Page** (has accordion and sticky sidebar).
13. Build **About Page** (long-form content, simplest layout).
14. Build **Contact Page** (accordion + contact methods).

### Phase 4 — Interactivity

15. Write `accordion.js` — one item open at a time, animate with CSS transitions.
16. Write `carousel.js` — horizontal scroll with snap, prev/next buttons, touch/swipe support.
17. Write scroll-triggered entrance animations in `main.js` using IntersectionObserver.

### Phase 5 — Polish

18. Add all meta tags, OG tags, and `<title>` to every page.
19. Create `sitemap.xml` and `robots.txt`.
20. Accessibility audit — keyboard navigation, focus states, contrast, alt text.
21. Test at 320px, 768px, 1024px, 1280px, 1536px widths.
22. Test `prefers-reduced-motion` behavior.
23. Run Lighthouse audit — aim for 90+ on all categories.
24. Deploy to Vercel.
