# Wireframe Specification — Landing Page Layout

> **Purpose**: This document describes the layout structure, grid systems, spacing, component anatomy, and interactions for the landing page. It is token-agnostic — apply your own color, typography, and spacing tokens.

---

## Page-Level Behavior

### Scroll Reveal System
- All section headings, card groups, and content blocks animate in on scroll.
- **Trigger**: `IntersectionObserver` with `threshold: 0.1` and `rootMargin: 0px 0px -50px 0px`.
- **Initial state**: `opacity: 0; transform: translateY(35px)`.
- **Revealed state**: `opacity: 1; transform: translateY(0)`.
- **Easing**: `0.9s cubic-bezier(0.16, 1, 0.3, 1)`.
- **Stagger delays**: Child elements within a group use incremental `transition-delay`: 0.1s, 0.2s, 0.35s.

### Custom Cursor (Desktop Only)
- Hide the native cursor (`cursor: none` on `html`).
- Render two fixed-position elements that follow the mouse:
  - **Outer ring**: 14×14px circle, border only, `mix-blend-mode: difference`. Follows mouse with lerp factor `0.15` via `requestAnimationFrame`.
  - **Inner dot**: 3×3px filled circle. Follows mouse position instantly (no lerp).
- **Hover state**: When hovering any interactive element (`a`, `button`, cards, rows), the outer ring scales to `scale(3)` and fills with the accent color. Transition: `transform 0.15s ease, background 0.2s`.
- **Mobile**: Hide both cursor elements and restore native cursor at `≤960px`.

### Grain Texture Overlay
- A `::after` pseudo-element on `body`, `position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: 9998`.
- Uses an inline SVG `feTurbulence` filter as `background-image` at very low opacity (~2%).
- Adds subtle print-like texture over the entire page.

### Container
- `max-width: 1200px`, centered with `margin: 0 auto`, horizontal padding `48px`.
- Mobile (`≤960px`): padding reduces to `24px`.

### Section Vertical Padding
- Each content section uses `110px` top/bottom padding.
- Mobile: reduces to `80px`.

---

## Section Dividers

Between every content section, insert an **editorial rule**:
- Full-width within the container.
- Layout: `display: flex; align-items: center; gap: 20px`.
- A 1px horizontal line on each side (`flex: 1`).
- A centered label in monospace, uppercase, with wide letter-spacing.
- The label text describes the next section (e.g., "Capabilities", "Method", "Pricing").

---

## Section 1: Hero

### Layout
- `min-height: 100vh`, `display: flex; flex-direction: column; align-items: center; justify-content: center`.
- `text-align: center`, `padding: 80px 48px`.
- No navbar — hero is the first thing visible.

### Background
- **Grid pattern**: An absolutely positioned SVG fills the hero area with a subtle grid pattern (48×48 unit cells, thin strokes). Very low opacity (~3.5%).
- **Radial glow**: A `::after` pseudo-element creates a soft elliptical gradient glow (800×500px) centered at ~30% from the top. Uses the accent color at ~5% opacity fading to transparent.

### Content Stack (top to bottom, centered)
1. **Badge/Edition label**: Monospace, uppercase, very small font size, wide letter-spacing. Flanked by 32px horizontal lines on left and right (`::before` and `::after` pseudo-elements). `margin-bottom: 40px`.
2. **Headline (h1)**: Display font, very large (`clamp(3.2rem, 7vw, 6rem)`), heavy weight, tight line-height (0.95), tight letter-spacing (-0.04em). One word/phrase uses accent color with italic styling. That accented word has an underline that animates in via `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)` with `0.8s ease` and a `1.4s` delay. `margin-bottom: 28px`.
3. **Subtitle**: Body/serif font, regular weight, italic, ~1.15rem, line-height 1.7, muted color, `max-width: 460px`, `margin: 0 auto 48px`.
4. **CTA pair**: `display: flex; gap: 20px; justify-content: center`.
   - **Primary button**: Solid background, contrasting text, monospace uppercase text (~0.68rem), `padding: 15px 32px`, no border-radius. Hover: accent background, `translateY(-2px)`, subtle box-shadow.
   - **Secondary button**: Transparent, text with `border-bottom: 1.5px solid`, no other borders, `padding: 15px 4px`. Hover: accent color on text and border.
5. **Product mockup**: `margin-top: 64px`, `width: 100%; max-width: 860px`.
   - Outer frame: white background, 1px border, `border-radius: 12px`, `padding: 32px`, soft shadow (`0 24px 80px` at ~5% opacity).
   - **Top bar**: 3 dots (8×8px circles), `gap: 6px`, `margin-bottom: 24px`.
   - **Inner grid**: `grid-template-columns: 180px 1fr; gap: 24px; min-height: 200px`.
     - **Sidebar**: Column of 6 skeleton bars (8px height, rounded, varying widths 45%-85%). Separated from main by a `border-right`. One bar uses accent color at low opacity as "active" state.
     - **Main area**: 2 skeleton lines at top (70% and 50% width), then a **bar chart** filling remaining space: `display: flex; align-items: flex-end; gap: 6px`. 10 bars with `flex: 1`, varying heights (25%-78%), `border-radius: 3px 3px 0 0`. Some bars use accent color at ~15% opacity.

### Rotating Stamp (Decorative)
- `position: absolute; bottom: 100px; right: calc(50% - 520px)`.
- 100×100px SVG with circular text path.
- Text repeats brand keywords around a circle, monospace font.
- Outer circle stroke at low opacity.
- **Animations**: `float` (5s ease-in-out infinite, translateY -10px + slight rotate), inner SVG `rotate` (25s linear infinite).
- **Mobile**: Hidden (`display: none`).

### Load Animations (Staggered)
| Element | Animation | Delay |
|---|---|---|
| Badge | fadeUp 0.8s ease | 0.3s |
| Headline | fadeUp 1s ease | 0.45s |
| Subtitle | fadeUp 1s ease | 0.6s |
| CTA pair | fadeUp 1s ease | 0.75s |
| Product mockup | fadeUp 1.1s ease | 0.9s |
| Rotating stamp | fadeIn 1s ease | 1.6s |

---

## Section 2: Features Grid

### Section Header
- `display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px`.
- **Left side**: Editorial label (monospace, uppercase, accent color, preceded by a 20px accent-colored line) + Section title (display font, large, heavy).
- **Right side**: Body text, right-aligned, muted color, serif italic.

### Grid: 3-Column Newspaper Cells
- `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px`.
- The grid container itself has a border and background color matching the rule/divider — the 1px gaps create visible divider lines between cells.
- Each **cell**:
  - Padding: `44px 36px`.
  - Contains: Icon container (36×36px, 1px border, 8px border-radius, centered icon) → Title (heading font, ~1rem, bold) → Description (serif, italic, muted, ~0.88rem, line-height 1.7).
  - **Hover interaction**:
    - A `::before` pseudo-element (absolute, bottom 0, full width, 2px height, accent color) scales from `scaleX(0)` to `scaleX(1)`, `transform-origin: left`, `0.5s ease`.
    - Cell background lightens.
    - Icon border color changes to accent.
    - All transitions: `0.5s cubic-bezier(0.22, 1, 0.36, 1)`.
- **Mobile**: `grid-template-columns: 1fr`.

---

## Section 3: Image Cards (Staggered)

### Section Header
- Editorial label + Section title, left-aligned. `margin-bottom: 48px`.

### Grid: 3-Column, Staggered
- `display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 28px`.
- **The 2nd card has `margin-top: 36px`** — creating an asymmetric stagger.

### Card Anatomy
- **Image area**: `aspect-ratio: 4/3`, 1px border, gradient background (use your brand colors). Contains:
  - A decorative SVG pattern (concentric shapes) centered at ~55% size, ~10% opacity.
  - A centered emoji/icon (2rem).
  - A **tag** label: absolute positioned `top: 18px; left: 18px`, monospace, uppercase, tiny (~0.52rem), contrasting pill (dark bg, light text).
  - An inner border frame: `::after` pseudo with `border: 10px solid` in page background color — creates a picture-frame inset effect.
- **Text area**: Title (display font, 1.25rem, bold) + description (small, muted).
- `margin-bottom: 22px` between image and text.

### Hover
- `transform: translateY(-6px)`, `0.5s cubic-bezier(0.22, 1, 0.36, 1)`.
- **Mobile**: Single column, stagger removed (`margin-top: 0` on 2nd card).

---

## Section 4: Split / Editorial Spread

### Layout
- `display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 0; min-height: 520px`.

### Left Column (Text)
- `padding: 60px 56px 60px 0; border-right: 1px solid [rule-color]`.
- `display: flex; flex-direction: column; justify-content: center`.
- Contains:
  1. Editorial label.
  2. Section title (display, large, heavy).
  3. Body text (`margin-top: 18px`).
  4. **Numbered list**: `list-style: none; margin-top: 32px`.
     - Each item: `padding: 14px 0; border-bottom: 1px solid [rule]; display: flex; align-items: center; gap: 14px`.
     - Item number: monospace, tiny (~0.55rem), muted.
     - Item text: heading font, ~0.88rem, regular weight.
     - **Hover**: `padding-left: 8px; color: [accent]`, `transition: 0.3s`.
  5. **Pagination dots**: `display: flex; gap: 7px; margin-top: 28px`.
     - Default: 7×7px squares, 1px border only.
     - Active: accent fill, accent border, `width: 24px` (elongated pill).

### Right Column (Visual)
- `padding: 48px; display: flex; align-items: center; justify-content: center`.
- **Visual block**: `width: 100%; aspect-ratio: 1; max-width: 380px; position: relative`.
  - **Background square**: Absolutely fills the container, dark/ink color.
  - **Floating card**: `width: 72%`, page background, 1px border, `padding: 24px`. Centered with `top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2`.
    - Contains 3 rows, each: circle avatar (24px, different accent colors at varying opacity) + 2 skeleton lines of varying widths.
  - **Corner decoration**: An empty 56×56px square with 1px accent border, `position: absolute; bottom: -14px; right: -14px`, ~20% opacity.

### Mobile
- Single column. Left column loses `border-right`, gets `border-bottom` and `padding-bottom: 48px` instead.

---

## Section 5: Showcase Cards

### Section Header
- Editorial label + Section title, left-aligned. `margin-bottom: 48px`.

### Grid: 3-Column
- `display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px`.

### Card Anatomy
- 1px border, no border-radius, `overflow: hidden`.
- **Thumbnail**: `aspect-ratio: 16/10`, solid dark color (each card a different brand color). Contains a large ghost-text label (display font, ~2.2rem, heavy, at ~8% opacity), positioned `bottom: 10px; left: 14px`.
- **Body**: `padding: 24px`. Title (display, ~1.15rem, bold) + description (small, muted).

### Hover
- `transform: translateY(-5px); box-shadow: 0 20px 56px rgba(..., 0.06)`, `0.5s cubic-bezier(0.22, 1, 0.36, 1)`.
- **Mobile**: Single column.

---

## Section 6: Detail Rows

### Section Header
- Editorial label + Section title, left-aligned. `margin-bottom: 48px`.

### Row Container
- `border-top: 1px solid [rule]`.

### Each Row
- `display: grid; grid-template-columns: 1fr 1.2fr; gap: 56px; padding: 44px 0; border-bottom: 1px solid [rule]; align-items: start`.
- **Left**: Title (display, ~1.3rem, bold) with an inline **tag** (monospace, uppercase, tiny ~0.5rem, secondary color on tinted background, pill-shaped padding `3px 9px`, `margin-left: 10px`).
- **Right**: Description paragraph (serif, italic, muted, ~0.9rem, line-height 1.8).

### Hover
- `background: rgba(255,255,255,0.5); padding-left: 20px; padding-right: 20px`, `transition: 0.3s`. The row subtly highlights and indents.
- **Mobile**: `grid-template-columns: 1fr`, gap reduces.

---

## Section 7: Pricing

### Section Header (Centered)
- **Pill banner**: Full-width (up to `max-width: 600px`), centered, `border-radius: 100px`, `padding: 10px 0`, monospace uppercase text, secondary/green tint. `margin-bottom: 32px`.
- **Headline**: Display font, large, heavy, centered.
- **Subtitle**: Serif, italic, muted, centered, `max-width: 480px; margin: 0 auto`.
- `margin-bottom: 56px`.

### Grid: 3-Column
- `display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start`.

### Card Anatomy
- `border: 1px solid [rule]; border-radius: 14px; padding: 40px 32px; display: flex; flex-direction: column`.
- **Popular card** variant: Different border color (accent/green), tinted background, extra top padding (`52px`) to accommodate badge.
  - **Badge**: `position: absolute; top: -14px; left: 50%; transform: translateX(-50%)`. Monospace, uppercase, tiny, `border-radius: 100px`, `padding: 6px 18px`, solid accent/green bg with light text.
- Content stack:
  1. **Tier name**: Heading font, uppercase, ~0.78rem, semi-bold, wide letter-spacing.
  2. **Price**: Display font, ~3.5rem, heavy. Currency symbol is smaller (~1.4rem), `vertical-align: super`. For the enterprise tier, use text like "Let's talk" at ~2.5rem instead.
  3. **Billing note**: Monospace, tiny (~0.62rem), muted.
  4. **Description**: Serif, italic, muted, ~0.88rem. `min-height: 48px` for alignment.
  5. **Feature list**: `list-style: none; flex: 1`. Each item: `padding: 10px 0; display: flex; align-items: center; gap: 12px`. Dot indicator (5×5px circle, accent/green color) as `::before`.
  6. **CTA button**: `border-radius: 100px; padding: 14px 24px; text-align: center; display: block`. Monospace, uppercase, ~0.65rem.
     - Default: transparent bg, 1px border. Hover: fills dark.
     - Popular: solid accent/green bg, light text. Hover: darkens, `translateY(-2px)`, shadow.

### Footnote
- Centered, serif italic, muted, `margin-top: 40px`.

### Hover (All Cards)
- `transform: translateY(-4px); box-shadow: 0 20px 56px rgba(..., 0.06)`, `0.5s cubic-bezier(0.22, 1, 0.36, 1)`.
- **Mobile**: Single column.

---

## Section 8: Footer

### Layout
- Full-width dark/ink background. `overflow: hidden; position: relative`.

### Background Decorations
- 3 absolutely positioned empty circles (border only, ~3% opacity):
  - `c1`: 500×500px, `top: -180px; left: -80px`.
  - `c2`: 350×350px, `bottom: -80px; right: -40px`.
  - `c3`: 180×180px, `top: 50%; left: 50%; transform: translate(-50%, -50%)`, uses accent color border at ~6% opacity.

### Content (Centered, z-index: 2)
- `padding: 100px 48px; max-width: 1200px; margin: 0 auto; text-align: center`.
- **Headline**: Display font, large (`clamp(2.2rem, 4.5vw, 3.5rem)`), heavy. One word in accent color + italic.
- **Subtitle**: Serif, italic, low-opacity light text, `margin-bottom: 40px`.
- **CTA pair**: `display: flex; gap: 16px; justify-content: center`.
  - Primary: Solid accent bg, light text, monospace uppercase, `padding: 15px 32px`. Hover: darkens, `translateY(-2px)`, accent shadow.
  - Secondary: Transparent, 1px border at low opacity, light text. Hover: border brightens.

### Bottom Bar
- `border-top: 1px solid rgba(..., 0.05); padding: 22px 48px`.
- `display: flex; justify-content: space-between`.
- Monospace, tiny (~0.55rem), very low opacity text.
- **Mobile**: `flex-direction: column; gap: 8px; text-align: center`.

---

## Responsive Summary (≤960px)

| Component | Change |
|---|---|
| Custom cursor | Hidden, native cursor restored |
| Container padding | 48px → 24px |
| Section padding | 110px → 80px |
| All 3-col grids | → 1 column |
| Image card stagger | Removed |
| Editorial spread | Single column, border-right → border-bottom |
| Detail rows | Single column |
| Rotating stamp | Hidden |
| Footer actions | `flex-direction: column; align-items: center` |
| Footer bottom | Column layout, centered |
| Hero mockup sidebar | Horizontal row, items become 40px width pills |
