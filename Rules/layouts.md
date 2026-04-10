# Page Layouts

> **This document defines the exact layout structure for every page.**
> Follow these layouts precisely. Do not rearrange sections, add sections, or remove sections.
> Ignore all colors, spacing, and padding here — those come from `design-system.md`.
> Placeholder text ("Lorem ipsum") and images will be replaced with real content later.

---

## Shared Components

### Navbar

Present on every page as the first element. Sticky top.

```
CLOSED STATE:
┌─────────────────────────────────────────────────────────┐
│  [Logo/Image]                           [ Menu  + ]     │
└─────────────────────────────────────────────────────────┘

OPEN STATE (hover on desktop / tap on mobile):
┌─────────────────────────────────────────────────────────┐
│  [Logo/Image]                           [ Menu  × ]     │
│                                         ┌───────────┐   │
│                                         │ Leda      │   │
│                                         │ Coren     │   │
│                                         │ About     │   │
│                                         │ Contact   │   │
│                                         └───────────┘   │
└─────────────────────────────────────────────────────────┘
```

- **Structure:** Full-width bar, content within max-width container.
- **Left:** Logo image.
- **Right:** Menu toggle — a pill-shaped element with the text "Menu" and a "+" icon.
- **No center nav links.** All navigation lives inside the dropdown.
- **Closed state:** Pill shows "Menu +" with subtle background, fully rounded corners (pill shape).
- **Open state:** The "+" icon rotates 45° to become "×" via CSS `transform: rotate(45deg)`. A dropdown card appears below the pill with a white background, rounded corners, and a vertical list of page links (Leda, Coren, About, Contact).
- **Trigger:** Opens on hover (desktop) and click/tap (mobile).
- **Close:** Clicking outside, pressing Escape, or hovering away (desktop).
- **Animation:** Dropdown enters with fade-in + slide-down (300ms, ease-smooth). The "+" to "×" rotation uses the same easing.
- **Accessibility:** The toggle must be a `<button>` with `aria-expanded`. The dropdown is a `<nav>` with a `<ul>` of `<a>` links. Supports Tab, Arrow keys, and Escape to close. Visible focus indicators on all interactive elements.

### Footer

Present on every page as the last element. Identical across all pages.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Logo/Image]                            [Title]        │
│                                          Link           │
│                                          Link           │
│                                          Link           │
│                                          Link           │
│                                          Link           │
│                                          Link           │
│                                                         │
│  [Description text]                      ● ● ●          │
│                                       (Social Icons)    │
└─────────────────────────────────────────────────────────┘
```

- **Structure:** Two-column layout within max-width container.
- **Left column (wide):** Logo image at top, short description text at bottom.
- **Right column (narrow):** Column title, then 6 text links stacked vertically, then 3 circular social media icons in a row at the bottom.

---

### Carousel Component

Both carousels on the Leda page use this identical component. Only the card count differs.

#### Behavior by Breakpoint

**Mobile (< 1024px):**
- One card visible at a time, full viewport width.
- Wrapper has `overflow: hidden` — no visible peek.
- Wrapper breaks out of container padding using negative margins so the card truly fills edge-to-edge.
- Horizontal scroll with `scroll-snap-type: x mandatory` and `scroll-snap-align: center`.
- Swipe/drag to navigate between cards.

**Desktop (≥ 1024px):**
- Cards are ~70% of viewport width (max 900px), so the next card peeks in from the right.
- Wrapper has `overflow: visible` — the peek is visible.
- Negative margin breakout is reset (back to normal container flow).
- `scroll-snap-align: start`.

**Large Desktop (≥ 1440px):**
- Cards are 65vw (max 1000px).

#### Card Structure

```html
<div class="carousel-card">
  <img src="..." alt="..." width="900" height="450" loading="lazy" />
  <h3>Card Title</h3>
  <p>Card description text.</p>
</div>
```

- **Image:** 2:1 aspect ratio (`aspect-ratio: 2 / 1`), `object-fit: cover`, rounded corners (`--radius-lg`).
- **Title:** H3 level.
- **Description:** Body text, secondary text color.

#### Navigation

- Two circular buttons (prev / next) with SVG arrow icons inside.
- Positioned in a footer row below the carousel track, right-aligned.
- Button size: 2.75rem on mobile, 3rem on tablet+.
- Icon size: 1.25rem on mobile, 1.5rem on tablet+.
- Background: subtle/light fill. Hover: slightly darker.
- Fully rounded (`border-radius: var(--radius-full)`).

#### Reference CSS Pattern

The carousel must follow this exact CSS architecture:

```css
/* ── Wrapper ── */
.carousel-wrapper {
  position: relative;
  overflow: hidden;
  /* Break out of container padding on mobile/tablet */
  margin-left: calc(-1 * var(--container-padding));
  margin-right: calc(-1 * var(--container-padding));
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}

@media (min-width: 1024px) {
  .carousel-wrapper {
    overflow: visible;
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }
}

/* ── Track ── */
.carousel-track {
  display: flex;
  gap: var(--space-10);
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: var(--space-4) 0;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

/* ── Cards ── */
.carousel-card {
  flex: 0 0 auto;
  width: calc(100vw - var(--container-padding) * 2);
  scroll-snap-align: center;
}

@media (min-width: 1024px) {
  .carousel-track {
    justify-content: flex-start;
  }
  .carousel-card {
    width: calc(70vw - var(--container-padding));
    max-width: 900px;
    scroll-snap-align: start;
  }
}

@media (min-width: 1440px) {
  .carousel-card {
    width: 65vw;
    max-width: 1000px;
  }
}

/* ── Card Image ── */
.carousel-card img {
  width: 100%;
  max-width: 900px;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  border-radius: var(--radius-lg);
}

/* ── Navigation ── */
.carousel-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: var(--space-10);
  gap: var(--space-4);
}

.carousel-nav button {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--duration-fast) var(--ease-smooth);
}

@media (min-width: 768px) {
  .carousel-nav button {
    width: 3rem;
    height: 3rem;
  }
}

.carousel-nav button svg {
  width: 1.25rem;
  height: 1.25rem;
}

@media (min-width: 768px) {
  .carousel-nav button svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}
```

#### JS Behavior

- Prev/next buttons scroll the track by one card width + gap.
- Use `scrollBy({ left: amount, behavior: 'smooth' })`.
- Respect `prefers-reduced-motion` — use `behavior: 'auto'` if reduced motion is enabled.
- Disable prev button when at the start, disable next button when at the end.
- Touch/swipe scrolling is handled natively by the browser via `overflow-x: scroll` on the track.

---

## Page 1: Home Page

**Route:** `/`
**Total sections:** 5 (Hero → Cards Grid → Centered CTA → Simple CTA → Footer)

---

### Section 1 — Hero (Split Layout)

```
┌─────────────────────────────────────────────────────────┐
│  [Navbar]                                               │
│                                                         │
│                                                         │
│  [Title — H1]                         ┌───────────┐    │
│  [Description text]                   │            │    │
│                                       │   Tall     │    │
│  [Button] [Button]                    │   Image    │    │
│                                       │            │    │
│  ● ● ● ● ●                           │            │    │
│  (5 Avatars)                          └───────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Two-column split — text left, image right.
- **Left column:**
  1. H1 title
  2. Body description text
  3. Two buttons side by side (primary + secondary)
  4. Row of 5 circular avatar images
- **Right column:** Single tall portrait-ratio image (roughly 1:2 aspect ratio).
- **Vertical alignment:** Left content vertically centered against the image.

---

### Section 2 — Articles Grid (CMS-Driven)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│  │  Image   │   │  Image   │   │  Image   │              │
│  ├─────────┤   ├─────────┤   ├─────────┤              │
│  │ Title    │   │ Title    │   │ Title    │              │
│  │ [Button] │   │ [Button] │   │ [Button] │              │
│  └─────────┘   └─────────┘   └─────────┘              │
│                                                         │
│  ┌─────────┐                                            │
│  │  Image   │                                            │
│  ├─────────┤                                            │
│  │ Title    │                                            │
│  │ [Button] │                                            │
│  └─────────┘                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** 3-column grid, with items wrapping.
- **Content is dynamic** — cards are rendered from `content/articles.json`.
- **Each card:**
  1. Landscape cover image (roughly 5:3 ratio)
  2. Article title (H3 level)
  3. "Read more" button — links to `/articles/{slug}`
- **Card count:** Shows all published articles. Grid wraps naturally.
- **Noscript fallback:** The HTML contains hardcoded placeholder cards so content is accessible without JS.
- **Card links:** The entire card should be clickable (wrap in `<a>`), with the button as a visual affordance.

---

### Section 3 — Centered CTA with Avatars

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Title — H2]                          │
│                  [Description text]                      │
│                                                         │
│                  [Button] [Button]                       │
│                                                         │
│                    ● ● ● ● ●                            │
│                   (5 Avatars)                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Single centered column.
- **Content stacked vertically and centered:**
  1. H2 title (centered)
  2. Description text (centered)
  3. Two buttons side by side (centered)
  4. Row of 5 circular avatar images (centered)

---

### Section 4 — Simple Centered CTA

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Title — H2]                          │
│                  [Description text]                      │
│                                                         │
│                      [Button]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Single centered column.
- **Content:**
  1. H2 title (centered)
  2. Description text (centered)
  3. Single button (centered)

---

### Section 5 — Footer

(See Shared Components → Footer)

---
---

## Page 2: Leda Page

**Route:** `/leda`
**Total sections:** 9 (Hero → Text+Image → Carousel A → Image+Text → Carousel B → Bento Grid → Title+Image → CTA → Footer)

---

### Section 1 — Hero (Left-Aligned)

```
┌─────────────────────────────────────────────────────────┐
│  [Navbar]                                               │
│                                                         │
│                                                         │
│  [Title — H1]                                           │
│  [Description text]                                     │
│                                                         │
│  [Button]                                               │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Full-width section, content left-aligned within container.
- **Content:**
  1. H1 title
  2. Description text
  3. Single button
- **No image in this hero.** Full viewport height implied.

---

### Section 2 — Text Left + Image Right

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Title — H2]              ┌──────────────────────┐    │
│  [Description text]        │                      │    │
│                            │     Large Square     │    │
│                            │       Image          │    │
│                            │                      │    │
│                            └──────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Two-column — narrow text left, wide image right.
- **Left column (~1/3 width):** H2 title + description, vertically centered.
- **Right column (~2/3 width):** Large square image.

---

### Section 3 — Carousel (4 Cards)

```
MOBILE (< 1024px): One card at a time, full width, swipe to scroll
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Image (2:1 ratio)                   │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Title                                            │   │
│  │ Description                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                                           ◄  ►         │
│                                        (Nav Arrows)     │
└─────────────────────────────────────────────────────────┘

DESKTOP (≥ 1024px): ~70% width card with next card peeking in
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────────────────────┐  ┌──────────    │
│  │           Image (2:1 ratio)           │  │  Next card   │
│  ├───────────────────────────────────────┤  │  peeking     │
│  │ Title                                 │  │  in...       │
│  │ Description                           │  └──────────    │
│  └───────────────────────────────────────┘                  │
│                                                             │
│                                              ◄  ►          │
│                                           (Nav Arrows)      │
└─────────────────────────────────────────────────────────────┘
```

- **Cards:** 4 total.
- **Layout pattern:** See "Carousel Component Rules" below.
- **Each card:**
  1. Image (2:1 aspect ratio, rounded corners)
  2. H3 title
  3. Description text
- **Navigation:** Two circular prev/next buttons, positioned bottom-right.

---

### Section 4 — Image Left + Text Right (Reversed)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────┐    [Title — H2]              │
│  │                      │    [Description text]         │
│  │     Large Square     │                               │
│  │       Image          │    [Label text]               │
│  │                      │    ● ● ● ● ●                 │
│  └──────────────────────┘    (5 Avatars)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Two-column — wide image left, narrow text right.
- **Left column (~2/3 width):** Large square image.
- **Right column (~1/3 width):**
  1. H2 title
  2. Description text
  3. Small label text
  4. Row of 5 circular avatar images

---

### Section 5 — Carousel (3 Cards)

```
Same layout behavior as Section 3 above — see "Carousel Component Rules" below.
```

- **Cards:** 3 total.
- **Layout pattern:** Identical to Section 3. Same component, same CSS, same behavior.
- **Each card:**
  1. Image (2:1 aspect ratio, rounded corners)
  2. H3 title
  3. Description text
- **Navigation:** Two circular prev/next buttons, positioned bottom-right.
- **Note:** Sections 3 and 5 use the exact same carousel component. The only difference is the number of cards.

---

### Section 6 — Bento Image Grid

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────┐  ┌──────────┐               │
│  │                      │  │          │               │
│  │   Wide Image (2:1)   │  │  Square  │               │
│  │                      │  │  Image   │               │
│  └──────────────────────┘  └──────────┘               │
│                                                         │
│  ┌──────────┐  ┌──────────────────────┐               │
│  │          │  │                      │               │
│  │  Square  │  │   Wide Image (2:1)   │               │
│  │  Image   │  │                      │               │
│  └──────────┘  └──────────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** 2×2 asymmetric bento grid, centered in the container.
- **Row 1:** Wide image (~2:1) on left, smaller square image on right.
- **Row 2:** Smaller square image on left, wide image (~2:1) on right.
- **Pattern is mirrored** between rows to create visual interest.

---

### Section 7 — Centered Title + Wide Image

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Title — H2]                          │
│                  [Description text]                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              Wide Landscape Image               │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Centered text block above a near-full-width image.
- **Content:**
  1. H2 title (centered)
  2. Description text (centered)
  3. Wide landscape image spanning most of the container width (~4:1 ratio).

---

### Section 8 — Simple Centered CTA

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Title — H2]                          │
│                  [Description text]                      │
│                                                         │
│                      [Button]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Same structure as Home Page Section 4.

---

### Section 9 — Footer

(See Shared Components → Footer)

---
---

## Page 3: Coren Page

**Route:** `/coren`
**Total sections:** 7 (Hero Split → Features Row → Accordion+Image → Stacked Cards → Image+Text → Footer)

---

### Section 1 — Hero (Split Layout)

```
┌─────────────────────────────────────────────────────────┐
│  [Navbar]                                               │
│                                                         │
│                                                         │
│  [Title — H1]                         ┌───────────┐    │
│  [Description text]                   │            │    │
│                                       │   Tall     │    │
│  [Button]                             │   Image    │    │
│                                       │            │    │
│                                       │            │    │
│                                       └───────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Two-column split — text left, image right.
- **Left column:**
  1. H1 title
  2. Description text
  3. Single button
- **Right column:** Single tall portrait-ratio image.
- **Vertical alignment:** Left content vertically centered.

---

### Section 2 — Features Row (3 Columns)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │      ●       │  │      ●       │  │      ●       │ │
│  │   (Icon)     │  │   (Icon)     │  │   (Icon)     │ │
│  │              │  │              │  │              │ │
│  │   [Title]    │  │   [Title]    │  │   [Title]    │ │
│  │   [Desc]     │  │   [Desc]     │  │   [Desc]     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** 3 equal columns.
- **Each column (centered content):**
  1. Circular icon/image (centered)
  2. H3 title (centered)
  3. Description text (centered)

---

### Section 3 — Accordion List + Image

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ●  [Title — H3]                      ┌───────────┐    │
│     [Description text]                │            │    │
│                                       │            │    │
│  ●  [Title — H3]                      │   Tall     │    │
│     (collapsed)                       │   Image    │    │
│                                       │            │    │
│  ●  [Title — H3]                      │            │    │
│     (collapsed)                       └───────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Two-column — accordion list left, tall image right.
- **Left column:** Vertical list of 3 items, each with:
  1. Circular icon + H3 title (side by side)
  2. Description text (visible on first/expanded item, hidden on collapsed)
- **Behavior:** Accordion — one item expanded at a time. Clicking an item expands it and collapses the others.
- **Right column:** Tall portrait image (same proportion as hero images).

---

### Section 4 — Stacked Cards with Sidebar Title

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Title — H2]             ┌──────────────────────┐     │
│  [Description text]       │       Image           │     │
│                           ├──────────────────────┤     │
│                           │ Title                 │     │
│                           │ Desc                  │     │
│                           └──────────────────────┘     │
│                                                         │
│                           ┌──────────────────────┐     │
│                           │       Image           │     │
│                           ├──────────────────────┤     │
│                           │ Title                 │     │
│                           │ Desc                  │     │
│                           └──────────────────────┘     │
│                                                         │
│                           ┌──────────────────────┐     │
│                           │       Image           │     │
│                           ├──────────────────────┤     │
│                           │ Title                 │     │
│                           │ Desc                  │     │
│                           └──────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Two-column — narrow left title, wide right card stack.
- **Left column (~1/4 width):**
  1. H2 title
  2. Description text
  3. This column should be sticky (stays visible while scrolling through the cards on the right).
- **Right column (~3/4 width):** 3 vertically stacked cards, each containing:
  1. Landscape image
  2. H3 title
  3. Description text

---

### Section 5 — Image Left + Text Right

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────┐    [Title — H2]              │
│  │                      │    [Description text —       │
│  │    Landscape Image   │     longer multi-line        │
│  │                      │     paragraph]               │
│  └──────────────────────┘                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Two-column — image left, text right.
- **Left (~2/5 width):** Landscape image.
- **Right (~3/5 width):** H2 title + longer description paragraph. Vertically centered.

---

### Section 6 — Footer

(See Shared Components → Footer)

---
---

## Page 4: About Page

**Route:** `/about`
**Total sections:** 3 (Hero CTA → Long-Form Content → Footer)

---

### Section 1 — Hero CTA (Centered)

```
┌─────────────────────────────────────────────────────────┐
│  [Navbar]                                               │
│                                                         │
│                                                         │
│                    [Title — H1]                          │
│                  [Description text]                      │
│                                                         │
│                      [Button]                           │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Full viewport height, content centered both vertically and horizontally.
- **Content:**
  1. H1 title (centered)
  2. Description text (centered)
  3. Single button (centered)

---

### Section 2 — Long-Form Content

This is a single tall content section with multiple sub-blocks stacked vertically within a centered, narrow-width column.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [Intro Title — H2]                          │
│              [Intro Description — paragraph]             │
│                                                         │
│                  [Section Title — H2]                    │
│                   (centered)                             │
│                                                         │
│              [FAQ Item 1: Title + Description]           │
│              ─────────────────────────────               │
│              [FAQ Item 2: Title + Description]           │
│              ─────────────────────────────               │
│              [FAQ Item 3: Title + Description]           │
│              ─────────────────────────────               │
│              [FAQ Item 4: Title + Description]           │
│              ─────────────────────────────               │
│              [FAQ Item 5: Title + Description]           │
│              ─────────────────────────────               │
│              [FAQ Item 6: Title + Description]           │
│              ─────────────────────────────               │
│              [FAQ Item 7: Title + Description]           │
│              ─────────────────────────────               │
│              [FAQ Item 8: Title + multi-line Desc]       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │            Wide Full-Width Image                │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│              [Block Title + Paragraph]                   │
│              [Block Paragraph]                           │
│              [Block Paragraph]                           │
│                                                         │
│              [Block Title + Paragraph]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Single centered column, narrow max-width (~650px content width).
- **Sub-blocks in order:**
  1. **Intro block:** H2 title + description paragraph (centered within the column).
  2. **Section title:** H2 centered.
  3. **FAQ/Info list:** 8 repeating items, each with:
     - H3 title (bold)
     - Short description line
     - Separated by horizontal dividers
     - Last item has a longer multi-line description.
  4. **Full-width image:** Breaks out of the narrow column to span the full container width (~landscape 2:1 ratio).
  5. **Text block A:** H3 title followed by 3 description paragraphs.
  6. **Text block B:** H3 title followed by 1 description paragraph.

---

### Section 3 — Footer

(See Shared Components → Footer)

---
---

## Page 5: Contact Page

**Route:** `/contact`
**Total sections:** 4 (Hero CTA → Contact Methods → FAQ Accordion → Footer)

---

### Section 1 — Hero CTA (Centered)

```
┌─────────────────────────────────────────────────────────┐
│  [Navbar]                                               │
│                                                         │
│                                                         │
│                    [Title — H1]                          │
│                  [Description text]                      │
│                                                         │
│                      [Button]                           │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Same structure as About Page Section 1.

---

### Section 2 — Contact Methods (3 Columns)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  ●  [Title]  │  │  ●  [Title]  │  │  ●  [Title]  │ │
│  │     [Desc]   │  │     [Desc]   │  │     [Desc]   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** 3 equal columns.
- **Each column:**
  1. Circular icon (left-aligned, inline with title)
  2. H3 title (to the right of icon)
  3. Description text (below title, full column width)
- **Note:** Icon and title sit side-by-side, description wraps below both.

---

### Section 3 — FAQ Accordion

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ●   [Title text]                               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ●   [Title text]                               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ●   [Title text]                               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ●   [Title text]                               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ●   [Title text]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Centered column, moderate width (~65% of container).
- **5 accordion items** stacked vertically.
- **Each item is a row/card:**
  1. Circular icon (left)
  2. H3 title text (right of icon)
  3. Expandable: clicking reveals description text below the title.
- **Behavior:** Accordion — one open at a time. All start collapsed.

---

### Section 4 — Footer

(See Shared Components → Footer)

---
---

## Article Page (Single Article View)

**Route:** `/articles/{slug}`
**Template:** `article.html` — a single template that reads the slug from the URL and loads the matching article from `content/articles.json`.

---

### Section 1 — Article Header

```
┌─────────────────────────────────────────────────────────┐
│  [Navbar]                                               │
│                                                         │
│              [Category tag]                              │
│              [Title — H1]                                │
│              [Date · Read time]                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              Cover Image (wide)                 │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Centered narrow column (same `--content-width: 650px` as About Page).
- **Content:**
  1. Category tag/label (small text, optional)
  2. H1 article title (centered)
  3. Meta line: publish date + estimated read time (centered, tertiary text color)
  4. Full-width cover image below

---

### Section 2 — Article Body

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [Rich text content]                         │
│              Paragraphs, subheadings (H2, H3),          │
│              blockquotes, lists, inline images...        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Centered narrow column (`--content-width: 650px`).
- **Content:** Rich HTML content — paragraphs, H2/H3 subheadings, blockquotes, images, lists.
- **Images within body** can break out to wider width if needed.

---

### Section 3 — Article Footer / Related

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ────────────────────                        │
│              [Back to articles button]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Layout:** Centered, simple.
- **Content:** Divider line, then a back/return link to the home page articles section.

---

### Section 4 — Footer

(See Shared Components → Footer)

---
---

## Article CMS System

### Data Source: `content/articles.json`

This is the single source of truth for all articles. Every article lives as an entry in this JSON file.

```json
{
  "articles": [
    {
      "slug": "article-url-slug",
      "title": "Article Title",
      "description": "Short excerpt shown in meta tags and optional card descriptions.",
      "category": "Category Name",
      "coverImage": "/images/articles/cover-slug.jpg",
      "coverImageAlt": "Descriptive alt text for the cover image",
      "date": "2026-02-18",
      "readTime": "5 min read",
      "published": true,
      "body": "<p>Full HTML content of the article...</p>"
    }
  ]
}
```

### Field Definitions

| Field           | Type      | Required | Description                                          |
| --------------- | --------- | -------- | ---------------------------------------------------- |
| `slug`          | string    | ✓        | URL-safe identifier. Used in route `/articles/{slug}` |
| `title`         | string    | ✓        | Article title. Used as H1 and in card.                |
| `description`   | string    | ✓        | Short excerpt for meta tags / SEO.                    |
| `category`      | string    |          | Optional category label displayed above the title.    |
| `coverImage`    | string    | ✓        | Path to cover image. Store in `/images/articles/`.    |
| `coverImageAlt` | string    | ✓        | Descriptive alt text for accessibility.               |
| `date`          | string    | ✓        | ISO date string (YYYY-MM-DD).                         |
| `readTime`      | string    |          | Estimated reading time (e.g., "5 min read").          |
| `published`     | boolean   | ✓        | Only `true` articles are rendered. Use `false` for drafts. |
| `body`          | string    | ✓        | Full article content as an HTML string.               |

### How It Works

1. **Home Page (cards grid):** `articles.js` fetches `content/articles.json`, filters for `published: true`, and renders a card for each article into the grid. Cards link to `/articles/{slug}`.
2. **Article Page:** `article.html` is a single template. On load, `articles.js` reads the slug from the URL path, finds the matching article in the JSON, and populates the page (title, meta, cover image, body).
3. **Vercel rewrite:** `vercel.json` rewrites `/articles/:slug` → `/article.html` so all article URLs use the same template.
4. **SEO:** `articles.js` dynamically sets `<title>`, `<meta name="description">`, and OG tags based on the article data.
5. **Noscript fallback:** The home page HTML includes hardcoded placeholder cards so the grid is never empty without JS.

### Adding a New Article

To add a new article:
1. Add a new entry to `content/articles.json` with all required fields.
2. Add the cover image to `/images/articles/`.
3. Set `"published": true`.
4. Deploy. That's it — no build step needed.

---
---

## Layout Rules Summary

1. **Section order is sacred.** Never reorder, skip, or add sections. Build them exactly as documented above.
2. **Max content width:** 1280px, centered with auto margins.
3. **Full-viewport hero sections:** The first section of every page should be full viewport height (100vh or min-height: 100vh).
4. **Two-column splits** use the proportions described (1/3+2/3 or similar). Never make them 50/50 unless specified.
5. **Carousels** follow the exact pattern defined in Shared Components → Carousel Component. Mobile: one full-width card at a time, overflow hidden, snap center. Desktop: ~70% width cards with next card peeking, overflow visible, snap start. Both Leda carousels use the same component — only card count differs.
6. **Accordion behavior:** One item expanded at a time. Animate open/close with the design system's easing and duration tokens.
7. **Bento grids** use the asymmetric pattern shown — never a uniform grid.
8. **Sticky sidebar titles** (Coren Page Section 4) should remain visible while the user scrolls through the adjacent content.
9. **Cards** always follow the same internal structure: Image → Title → Description/Button. Never rearrange card internals.
10. **Responsive behavior:** On mobile (< 768px), all multi-column layouts collapse to a single column, stacked vertically. Horizontal carousels remain horizontal with swipe support.
