# Design System Rules

> **This document is the single source of truth for all visual and structural decisions.**
> Every color, size, spacing value, font, animation, and accessibility requirement must follow these rules. Do not introduce arbitrary values.

---

## 1. COLOR SYSTEM

### Primary Coral

Use as the primary accent for CTAs, highlights, and interactive elements.

| Token          | Hex       | Usage                                    |
| -------------- | --------- | ---------------------------------------- |
| `coral`        | `#F69B75` | Default buttons, links, active states    |
| `coral-dark`   | `#B46D50` | Hover / pressed states                   |
| `coral-light`  | `#F5CFBF` | Subtle backgrounds, badges, tags         |

### Primary Mint

Secondary palette for success states and complementary accents.

| Token          | Hex       | Usage                                    |
| -------------- | --------- | ---------------------------------------- |
| `mint`         | `#BACB99` | Secondary buttons, icons, highlights     |
| `mint-dark`    | `#919F76` | Hover / pressed states                   |
| `mint-light`   | `#C4CCB6` | Subtle backgrounds, cards, section fills |

### Primary Sky

Tertiary palette for informational elements and trust indicators.

| Token          | Hex       | Usage                                    |
| -------------- | --------- | ---------------------------------------- |
| `sky`          | `#A9E2FF` | Info banners, tooltips, selected states  |
| `sky-dark`     | `#57B1DE` | Hover / pressed states                   |
| `sky-light`    | `#DBF3FF` | Subtle backgrounds, info cards           |

### Text

| Token            | Hex       | Usage                              |
| ---------------- | --------- | ---------------------------------- |
| `text-primary`   | `#1B1C1C` | Headings, primary body text        |
| `text-secondary` | `#525355` | Subheadings, secondary descriptions|
| `text-tertiary`  | `#898A8D` | Captions, helper text, timestamps  |
| `text-disabled`  | `#B8B9BB` | Disabled labels, placeholders      |

### Backgrounds

| Token       | Hex       | Usage                                   |
| ----------- | --------- | --------------------------------------- |
| `bg-white`  | `#FFFFFF` | Primary page background, cards          |
| `bg-subtle` | `#F9FAFB` | Alternating sections, sidebar, inputs   |

### Borders

| Token            | Hex       | Usage                              |
| ---------------- | --------- | ---------------------------------- |
| `border-default` | `#E5E7EB` | Card borders, dividers, inputs     |
| `border-light`   | `#F3F4F6` | Subtle separators, inner dividers  |

### Gradient

Use sparingly — hero sections, feature highlights, or decorative accents only.

| Direction | Stops                                  |
| --------- | -------------------------------------- |
| Default   | `#DBEBFB` → `#C8D2B4` → `#F59A74`    |

```css
background: linear-gradient(135deg, #DBEBFB 0%, #C8D2B4 50%, #F59A74 100%);
```

### Color Rules

1. **No arbitrary colors.** Every color must map to a token above.
2. **Semantic usage.** Coral = primary actions, Mint = secondary/success, Sky = informational. Do not mix roles.
3. **Dark variants** → hover, active, pressed states only.
4. **Light variants** → subtle fills and tinted backgrounds only, never for text.
5. **Gradient** → decorative only. Never behind body text.
6. **Never rely on color alone** to convey information (use icons, labels, or patterns as well).

---

## 2. SPACING SYSTEM — 4px Grid

All spacing values must be multiples of 4px. No arbitrary pixel values allowed.

### Spacing Scale

| Token       | Value   | rem      | Common Usage                                |
| ----------- | ------- | -------- | ------------------------------------------- |
| `space-0`   | `0px`   | `0`      | Reset                                       |
| `space-0.5` | `2px`   | `0.125`  | Hairline gaps (icon-to-text micro-adjust)    |
| `space-1`   | `4px`   | `0.25`   | Tight inline spacing, icon padding           |
| `space-2`   | `8px`   | `0.5`    | Inline element gaps, compact padding          |
| `space-3`   | `12px`  | `0.75`   | Input padding, small card padding             |
| `space-4`   | `16px`  | `1`      | Default element padding, paragraph spacing    |
| `space-5`   | `20px`  | `1.25`   | Card padding, form group spacing              |
| `space-6`   | `24px`  | `1.5`    | Section inner padding                         |
| `space-8`   | `32px`  | `2`      | Between content blocks                        |
| `space-10`  | `40px`  | `2.5`    | Between sections (mobile)                     |
| `space-12`  | `48px`  | `3`      | Section gaps (mobile)                         |
| `space-16`  | `64px`  | `4`      | Section gaps (desktop)                        |
| `space-20`  | `80px`  | `5`      | Large section breaks (desktop)                |
| `space-24`  | `96px`  | `6`      | Hero/footer vertical padding (desktop)        |
| `space-32`  | `128px` | `8`      | Page-level vertical padding (desktop)         |

### Responsive Spacing

Spacing should scale down on smaller viewports. Use `clamp()` for fluid spacing:

```css
/* Example: section padding */
padding: clamp(2rem, 5vw, 6rem);

/* Example: content gap */
gap: clamp(1rem, 3vw, 2rem);
```

**Breakpoints:**

| Name   | Min-width | Usage              |
| ------ | --------- | ------------------ |
| `sm`   | `640px`   | Large phones       |
| `md`   | `768px`   | Tablets            |
| `lg`   | `1024px`  | Small desktops     |
| `xl`   | `1280px`  | Standard desktops  |
| `2xl`  | `1536px`  | Large desktops     |

### Corner Radius (Responsive)

All radii must use these tokens. Radii should scale down on mobile.

| Token         | Desktop  | Mobile (< 768px) | Usage                              |
| ------------- | -------- | ----------------- | ---------------------------------- |
| `radius-sm`   | `4px`    | `4px`             | Small chips, badges                |
| `radius-md`   | `8px`    | `6px`             | Buttons, inputs                    |
| `radius-lg`   | `12px`   | `8px`             | Cards, modals                      |
| `radius-xl`   | `16px`   | `12px`            | Large cards, image containers      |
| `radius-2xl`  | `24px`   | `16px`            | Feature cards, hero elements       |
| `radius-full` | `9999px` | `9999px`          | Pills, avatars, circular elements  |

Use `clamp()` for fluid radii:

```css
border-radius: clamp(0.5rem, 1.5vw, 1.5rem);
```

### Padding & Margin Rules

1. **All padding and margin values must snap to the 4px grid.**
2. **Use `clamp()` or responsive utilities** for all padding and margins that differ between mobile and desktop.
3. **Container padding:** `clamp(1rem, 5vw, 3rem)` on the sides.
4. **Max content width:** `1280px` centered with auto margins.
5. **Consistent internal padding** within component types (all cards use the same padding, all buttons use the same padding, etc.).

---

## 3. TYPOGRAPHY — Golden Ratio Scale

### Fonts

| Role                 | Font Family          | Weight(s)          | Fallback Stack                          |
| -------------------- | -------------------- | ------------------- | --------------------------------------- |
| **H1 only**          | `Playfair Display`   | 700 (Bold)          | `Georgia, 'Times New Roman', serif`     |
| **Everything else**  | `SF Pro Display`     | 400, 500, 600, 700  | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |

**Loading strategy:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" />
```

### Golden Ratio Type Scale

Scale factor: **φ^(1/3) ≈ 1.175** (derived from the golden ratio, using cube-root steps to keep sizes practical with the larger base)
Base size: **1.5rem (24px)**

All font sizes must be **responsive** using `clamp()`.

| Element    | Desktop     | Mobile min  | Clamp (responsive)                              | Font            | Weight | Line-Height | Letter-Spacing |
| ---------- | ----------- | ----------- | ------------------------------------------------ | --------------- | ------ | ----------- | -------------- |
| **H1**     | `4.5rem`    | `2.75rem`   | `clamp(2.75rem, 5vw + 1.25rem, 4.5rem)`         | Playfair Display| 700    | 1.1         | `-0.02em`      |
| **H2**     | `3.375rem`  | `2.25rem`   | `clamp(2.25rem, 3.5vw + 1rem, 3.375rem)`        | SF Pro          | 700    | 1.15        | `-0.015em`     |
| **H3**     | `2.85rem`   | `1.875rem`  | `clamp(1.875rem, 2.5vw + 0.875rem, 2.85rem)`    | SF Pro          | 600    | 1.2         | `-0.01em`      |
| **H4**     | `2.427rem`  | `1.625rem`  | `clamp(1.625rem, 2vw + 0.75rem, 2.427rem)`      | SF Pro          | 600    | 1.25        | `-0.005em`     |
| **H5**     | `2.075rem`  | `1.5rem`    | `clamp(1.5rem, 1.5vw + 0.625rem, 2.075rem)`     | SF Pro          | 500    | 1.3         | `0`            |
| **H6**     | `1.75rem`   | `1.375rem`  | `clamp(1.375rem, 1vw + 0.5rem, 1.75rem)`        | SF Pro          | 500    | 1.35        | `0.005em`      |
| **Body**   | `1.5rem`    | `1.25rem`   | `clamp(1.25rem, 1vw + 1rem, 1.5rem)`            | SF Pro          | 400    | 1.7         | `0`            |
| **Body-sm**| `1.25rem`   | `1.063rem`  | `clamp(1.063rem, 0.5vw + 0.875rem, 1.25rem)`    | SF Pro          | 400    | 1.6         | `0.005em`      |
| **Caption**| `1rem`      | `0.875rem`  | `clamp(0.875rem, 0.5vw + 0.75rem, 1rem)`        | SF Pro          | 400    | 1.5         | `0.01em`       |

**Desktop pixel reference (hierarchy check):**
H1: 72px → H2: 54px → H3: 45.6px → H4: 38.8px → H5: 33.2px → H6: 28px → Body: 24px → Body-sm: 20px → Caption: 16px ✓

**Mobile pixel reference (hierarchy check):**
H1: 44px → H2: 36px → H3: 30px → H4: 26px → H5: 24px → H6: 22px → Body: 20px → Body-sm: 17px → Caption: 14px ✓

### CSS Implementation

```css
:root {
  /* Golden Ratio Derived Scale (base: 1.5rem, step: φ^(1/3) ≈ 1.175) */
  --font-h1: clamp(2.75rem, 5vw + 1.25rem, 4.5rem);
  --font-h2: clamp(2.25rem, 3.5vw + 1rem, 3.375rem);
  --font-h3: clamp(1.875rem, 2.5vw + 0.875rem, 2.85rem);
  --font-h4: clamp(1.625rem, 2vw + 0.75rem, 2.427rem);
  --font-h5: clamp(1.5rem, 1.5vw + 0.625rem, 2.075rem);
  --font-h6: clamp(1.375rem, 1vw + 0.5rem, 1.75rem);
  --font-body: clamp(1.25rem, 1vw + 1rem, 1.5rem);
  --font-body-sm: clamp(1.063rem, 0.5vw + 0.875rem, 1.25rem);
  --font-caption: clamp(0.875rem, 0.5vw + 0.75rem, 1rem);

  /* Font Families */
  --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-sans: 'SF Pro Display', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h1 {
  font-family: var(--font-display);
  font-size: var(--font-h1);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

h2 { font-size: var(--font-h2); font-weight: 700; line-height: 1.15; letter-spacing: -0.015em; }
h3 { font-size: var(--font-h3); font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; }
h4 { font-size: var(--font-h4); font-weight: 600; line-height: 1.25; letter-spacing: -0.005em; }
h5 { font-size: var(--font-h5); font-weight: 500; line-height: 1.3; }
h6 { font-size: var(--font-h6); font-weight: 500; line-height: 1.35; letter-spacing: 0.005em; }

h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  color: var(--text-primary);
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-body);
  font-weight: 400;
  line-height: 1.7;
  color: var(--text-primary);
}
```

### Typography Rules

1. **Only one H1 per page.** It must be the main page title.
2. **Never skip heading levels.** Go H1 → H2 → H3 → H4, etc.
3. **Playfair Display is exclusively for H1.** All other text uses SF Pro.
4. **All font sizes must be responsive** using `clamp()`.
5. **Maximum line length:** `65–75ch` for body text readability.
6. **Paragraph spacing:** Use `space-4` (1rem) between paragraphs.
7. **Heading margin:** Each heading should have more space above it (`space-8` to `space-12`) than below it (`space-3` to `space-4`) to visually associate with its content.
8. **Senior-friendly readability:** Body text is intentionally set larger (20px mobile – 24px desktop) with generous line-height (1.7) for comfortable reading. Every heading level must remain visually larger than the body to preserve clear hierarchy. The smallest text on the site (captions) must never go below 14px.

### Heading Hierarchy (Correct vs. Wrong)

```html
<!-- ✅ CORRECT -->
<h1>Main Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
    <h3>Subsection Title</h3>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
      <h4>Sub-subsection Title</h4>

<!-- ❌ WRONG — Don't skip levels -->
<h1>Title</h1>
  <h3>Section</h3>  <!-- Skipped H2! -->

<!-- ❌ WRONG — Multiple H1s -->
<h1>Title</h1>
<h1>Another Title</h1>  <!-- Only one H1 per page! -->
```

---

## 4. ANIMATIONS

### Philosophy

- **Purposeful** — every animation must guide attention or provide feedback.
- **Subtle** — never distracting or gratuitous.
- **Performant** — target 60fps. Only animate `transform` and `opacity`.
- **Respect user preferences** — always honor `prefers-reduced-motion`.

### Easing

| Token               | Value                           | Usage                     |
| -------------------- | ------------------------------- | ------------------------- |
| `ease-smooth`        | `cubic-bezier(0.16, 1, 0.3, 1)`| Default for all animations |
| `ease-in`            | `cubic-bezier(0.4, 0, 1, 1)`   | Elements exiting           |
| `ease-out`           | `cubic-bezier(0, 0, 0.2, 1)`   | Elements entering          |

**Never use `linear` easing** for UI animations.

### Duration Scale

| Token             | Value    | Usage                                    |
| ----------------- | -------- | ---------------------------------------- |
| `duration-fast`   | `100ms`  | Micro-interactions (toggle, check)       |
| `duration-normal` | `200ms`  | Button hovers, state changes             |
| `duration-medium` | `300ms`  | Modals, dropdowns, tooltips              |
| `duration-slow`   | `500ms`  | Page transitions, large element entrances|
| `duration-slower` | `700ms`  | Hero animations, staggered reveals       |

### Allowed Properties

**Only animate these properties for 60fps performance:**

```
✅ transform (translate, scale, rotate)
✅ opacity
✅ clip-path
✅ filter (sparingly)

❌ width / height (causes layout thrashing)
❌ top / left / right / bottom (use transform instead)
❌ margin / padding (causes layout reflow)
❌ border-radius (paint-heavy)
❌ box-shadow (paint-heavy — pre-render with pseudo-elements)
```

### Reduced Motion

**This is mandatory. Every animation must have a reduced-motion fallback.**

```css
/* Default: animations enabled */
.element {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Reduced motion: instant or no animation */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Common Animation Patterns

```css
/* Fade in + slide up (page entry) */
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
.stagger > * {
  transition-delay: calc(var(--index) * 80ms);
}

/* Button hover */
.button {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.button:hover {
  transform: translateY(-1px);
}
.button:active {
  transform: translateY(0) scale(0.98);
}
```

### Animation Rules

1. **Never animate layout properties** (width, height, margin, padding, top, left).
2. **Always include `will-change`** on heavily animated elements, but remove it after the animation completes.
3. **Stagger delay max: 80ms per item**, capped at 8 items (640ms total).
4. **No animation should exceed 700ms** unless it's a loading/skeleton state.
5. **Entrance animations only** — avoid exit animations unless essential for context (e.g., modals).
6. **No auto-playing infinite animations** except subtle loading indicators.

---

## 5. ACCESSIBILITY REQUIREMENTS

### Color & Contrast

```
□ Body text: 4.5:1 contrast ratio minimum
□ Large text (≥ 24px or ≥ 18.67px bold): 3:1 contrast ratio minimum
□ UI components and graphical objects: 3:1 contrast ratio minimum
□ Never rely on color alone to convey information
□ Test all color combinations against WCAG 2.1 AA
```

### Keyboard Navigation

```
□ All interactive elements are focusable via Tab
□ Logical tab order follows visual reading order
□ Visible, high-contrast focus indicators on all focusable elements
□ No keyboard traps — user can always Tab away
□ "Skip to main content" link as the first focusable element
□ Escape key closes modals, dropdowns, and overlays
□ Arrow keys navigate within composite widgets (tabs, menus)
```

### Focus Indicator Style

```css
:focus-visible {
  outline: 2px solid #57B1DE;
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove default focus for mouse users, keep for keyboard */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Readers

```
□ All meaningful images have descriptive alt text
□ Decorative images use alt=""
□ Buttons have descriptive accessible text (never just an icon)
□ Links clearly describe their destination
□ All form inputs have associated <label> elements
□ ARIA labels used where native semantics are insufficient
□ Proper heading hierarchy (H1 → H2 → H3, no skipping)
□ Live regions (aria-live) for dynamic content updates
□ Landmark roles used: <header>, <nav>, <main>, <footer>
```

### Touch & Motor

```
□ Touch targets: 48×48px minimum (44×44px absolute minimum)
□ Adequate spacing between adjacent touch targets (≥ 8px)
□ No time limits on interactions (or provide adjustable timers)
□ No hover-only interactions on mobile — always provide tap alternative
□ Drag interactions have keyboard/button alternatives
```

### Testing Checklist

```
□ Navigate entire site using only keyboard
□ Test with screen reader (VoiceOver, NVDA, or JAWS)
□ Verify at 200% browser zoom
□ Test with forced-colors/high-contrast mode
□ Validate with axe DevTools or Lighthouse accessibility audit
□ Test prefers-reduced-motion behavior
□ Test prefers-color-scheme behavior
```

---

## 6. SEO & HTML BEST PRACTICES

### Required Files

Every deployment must include these files:

```
□ sitemap.xml        — Auto-generated, submitted to search engines
□ robots.txt         — Proper crawl directives
□ favicon.png        — Minimum 32×32, ideally provide multiple sizes
□ og-image.png       — Exactly 1200×630px for social sharing
```

### Meta Requirements

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Unique, descriptive, 150-160 chars" />
  <title>Page Title — Brand Name</title>

  <!-- Open Graph -->
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Page description" />
  <meta property="og:image" content="/og-image.png" />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

### Image Requirements

```
□ All images have alt text (descriptive for meaningful, alt="" for decorative)
□ All images have explicit width and height attributes (prevents CLS)
□ Use modern formats (WebP with JPEG/PNG fallback)
□ Lazy-load below-the-fold images: loading="lazy"
□ Eager-load above-the-fold images: loading="eager" fetchpriority="high"
```

### Common Mistakes to Avoid

```
❌ Missing meta descriptions
❌ Multiple H1 tags
❌ Images without alt text
❌ Images without explicit dimensions (width/height)
❌ No sitemap.xml
❌ JS-only content (not crawlable)
❌ Poor color contrast
❌ No focus states on interactive elements
❌ Skipping heading levels
❌ Not testing on mobile devices
```

---

## 7. JAVASCRIPT BEST PRACTICES

### Critical Content Rule

**Never hide critical content behind JavaScript.**

```
✅ DO:
  - Render page content in HTML (server-side or static)
  - Use JS for enhancements (animations, interactions)
  - Add <noscript> fallbacks for dynamic content
  - Use semantic HTML elements

❌ DON'T:
  - Load text content via JS only
  - Require JS for navigation to work
  - Hide critical SEO content behind JS
  - Use JS for things CSS can handle
```

### Noscript Fallback

```html
<noscript>
  <div class="noscript-fallback">
    <p>JavaScript is required for some interactive features.</p>
    <ul>
      <li><a href="/page-1">Page 1</a></li>
      <li><a href="/page-2">Page 2</a></li>
    </ul>
  </div>
</noscript>
```

### Script Loading Strategy

```html
<!-- Critical JS (rare) — blocks rendering, use sparingly -->
<script src="/js/critical.js"></script>

<!-- Deferred JS (most common) — runs after HTML is parsed -->
<script src="/js/main.js" defer></script>

<!-- Async JS (independent) — downloads in parallel, executes when ready -->
<script src="/js/analytics.js" async></script>

<!-- Module JS -->
<script type="module" src="/js/app.js"></script>
```

### Performance Rules

1. **Bundle size budget:** Aim for < 200KB gzipped for initial JS.
2. **Code-split** route-level and heavy components.
3. **Defer third-party scripts** (analytics, chat widgets, embeds).
4. **No layout-triggering JS** in the critical path.
5. **Debounce** scroll and resize event listeners.
6. **Use `IntersectionObserver`** for scroll-triggered animations and lazy loading.

---

## 8. RESPONSIVE DESIGN RULES

### Core Principles

1. **Mobile-first.** Write base styles for mobile, then layer up with `min-width` media queries.
2. **Fluid everything.** Use `clamp()` for font sizes, spacing, padding, and border-radius.
3. **No horizontal scroll.** Test at 320px minimum width.
4. **Touch-friendly.** All interactive elements ≥ 48×48px on mobile.

### Responsive Values Summary

| Property         | Mobile (< 768px)                    | Desktop (≥ 1024px)                  |
| ---------------- | ----------------------------------- | ----------------------------------- |
| Container padding| `1rem`                              | `3rem`                              |
| Section gap      | `2.5rem – 3rem`                     | `4rem – 6rem`                       |
| H1 size          | `~2.75rem (44px)`                   | `4.5rem (72px)`                     |
| H2 size          | `~2.25rem (36px)`                   | `3.375rem (54px)`                   |
| Body size        | `~1.25rem (20px)`                   | `1.5rem (24px)`                     |
| Card radius      | `8px`                               | `12px`                              |
| Card padding     | `1rem`                              | `1.5rem`                            |
| Button radius    | `6px`                               | `8px`                               |
| Button padding   | `0.75rem 1.25rem`                   | `0.75rem 1.5rem`                    |

### Responsive CSS Pattern

```css
:root {
  /* Fluid spacing */
  --section-padding: clamp(2rem, 5vw, 6rem);
  --container-padding: clamp(1rem, 5vw, 3rem);
  --card-padding: clamp(1rem, 2.5vw, 1.5rem);
  --card-radius: clamp(0.5rem, 1.5vw, 0.75rem);

  /* Fluid typography (golden ratio derived, base: 1.5rem) */
  --font-h1: clamp(2.75rem, 5vw + 1.25rem, 4.5rem);
  --font-h2: clamp(2.25rem, 3.5vw + 1rem, 3.375rem);
  --font-h3: clamp(1.875rem, 2.5vw + 0.875rem, 2.85rem);
  --font-h4: clamp(1.625rem, 2vw + 0.75rem, 2.427rem);
  --font-body: clamp(1.25rem, 1vw + 1rem, 1.5rem);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: var(--container-padding);
}
```

---

## Quick Reference Card

```
COLORS      → Only use defined tokens. No arbitrary hex values.
SPACING     → 4px grid. All values are multiples of 4.
TYPOGRAPHY  → Golden ratio derived (φ^(1/3) step). Base: 1.5rem (24px). Playfair = H1 only. SF Pro = everything else.
RADIUS      → Use tokens. Responsive with clamp().
ANIMATIONS  → transform + opacity only. 60fps. Respect prefers-reduced-motion.
A11Y        → 4.5:1 contrast. Keyboard nav. Focus states. Alt text. 48px targets.
SEO         → One H1. Meta descriptions. sitemap.xml. No JS-only content.
RESPONSIVE  → Mobile-first. clamp() for all fluid values. Test at 320px.
```
