# Homepage Sections & Interactive Location Map — Design

**Date:** 2026-06-02
**Status:** Approved (pending spec review)
**Scope:** Add five new full-viewport homepage sections plus a spectacular interactive
"Africa → Nigeria" location section, all matching the existing TSG design system.

---

## 1. Goal

Transform the TSG homepage from a restrained, compact layout into a premium,
cinematic, full-scroll experience — without inventing a new visual language. Every
new section is built from the same vocabulary already in the codebase (palette,
serif display font, `eyebrow` labels, GSAP, the `Reveal` scroll observer) but at a
larger scale: each new section fills at least one viewport (`min-h-[100svh]`) with
editorial typography and generous whitespace.

The centerpiece is a new **Location** section that animates from a silhouette of
Africa down into Nigeria and drops a pin on the TSG head office in Abuja, paired
with a live (lazy-loaded) Google Maps embed.

## 2. Design language (shared by all new sections)

- **Palette:** `tsg-green #0a4d2e`, `tsg-deep #063d23`, `tsg-cream #f7f4ec`, white,
  `#1c2218` body text. No new brand colors. (The bright cyan "Read More" button seen
  in the old about mock is intentionally dropped.)
- **Type:** `font-display` (serif) for headings, `var(--font-sans)` for body.
  `eyebrow` label above each section title (green on light bgs, white on dark).
- **Motion:** entrance animations via the existing `Reveal` component
  (IntersectionObserver fade/slide-up, already `prefers-reduced-motion` safe). The
  Location map and Voices carousel use GSAP / client interactivity. Big headings may
  use a hero-style line-mask reveal where it adds impact.
- **Rhythm:** backgrounds alternate to break up the long scroll
  (cream → deep green → white → cream → deep green → white → cream → green → cream).
- **Sizing:** new feature sections use `min-h-[100svh]` with vertically centered
  content and `py` padding so they never feel cramped on tall screens. Existing
  compact sections (Stats) stay as thin accents.

## 3. Final homepage section order

`src/app/(public)/page.tsx` renders, in order:

| # | Section | Component | Bg | Status |
|---|---------|-----------|----|--------|
| 1 | Hero | `home/Hero` | dark | existing — unchanged |
| 2 | Stats band | inline | deep green | existing — unchanged |
| 3 | About — "Who We Are" | `home/AboutStory` | cream | **NEW** |
| 4 | Leadership & Vision | `home/LeadershipVision` | deep green | **NEW** |
| 5 | Impact / Programs | `home/ImpactPrograms` | white | **NEW** (absorbs Pillars) |
| 6 | Our Journey (timeline) | `home/JourneyTimeline` | cream | **NEW** |
| 7 | Voices / Testimonials | `home/Voices` | deep green | **NEW** |
| 8 | Latest News | inline + `PostCard` | white | existing — unchanged |
| 9 | Location (Africa→Nigeria) | `home/LocationMap` | cream | **NEW ⭐** |
| 10 | CTA banner | inline | green | existing — unchanged |
| 11 | FAQ | inline | cream | existing — unchanged |

**Decision (approved):** the existing **Pillars** section ("What We Stand For":
Youth Empowerment / Economic Growth / Inclusive Governance) is **folded into the new
Impact / Programs section** as its program categories, so the message is not
duplicated. The standalone Pillars block is removed from `page.tsx`.

## 4. Content integrity (approved)

TSG is a real movement. We will **not** fabricate authoritative-looking quotes,
milestone dates, or program claims. All new section copy is defined as **clearly
labelled, editable placeholder constants** (realistic but neutral), following the
existing `STATS` / `PILLARS` pattern in `page.tsx`. The user replaces them with real
content. Each content constant file carries a header comment:
`// PLACEHOLDER CONTENT — replace with verified TSG content before launch.`

Factual values reused from the codebase are safe to keep:
- Office address: **2 Kainji Crescent, Maitama, Abuja, FCT** (from existing JSON-LD).
- Google Maps link (provided by user):
  `https://www.google.com/maps?cid=9709369009114742493...`
- Stats already on the page (36 states, 774 LGAs, 6 zones, since 2019).

## 5. Section specs

### 5.1 AboutStory (`AboutStory.tsx`, server component)
- Full-viewport, cream bg. Two-column on desktop, stacked on mobile.
- Left: `eyebrow` "About TSG", a large serif headline (line-mask reveal), the
  mission/description paragraphs, and 2–3 inline mini-stats.
- Right: portrait (reuse `/assets/img/tinubu2.jpg` or a hero-carousel image) in a
  rounded frame with a soft `tsg-green` accent shape behind it (reuse the blurred-orb
  motif from the CTA banner).
- Uses `Reveal` for entrance. No client JS beyond `Reveal`.

### 5.2 LeadershipVision (`LeadershipVision.tsx`, server component)
- Full-viewport, `tsg-deep` bg, white text. Cinematic.
- Oversized pull-quote ("Renewed Hope…") as the focal element, portrait of the
  President, two short vision paragraphs, and a link to `/pbat`.
- Subtle grain/gradient overlay (reuse `.hero-grain` + gradient motif).

### 5.3 ImpactPrograms (`ImpactPrograms.tsx`, server component)
- Full-viewport, white bg. Section title + intro.
- Grid of program cards (the three former Pillars become categories: Youth, Economy,
  Governance) — each card has an icon (lucide), title, body, optional image, and a
  hover lift/accent (reuse the Pillars card hover treatment, enriched).
- Content constant: `PROGRAMS` array. Reuses the existing PILLARS copy as a starting
  point.

### 5.4 JourneyTimeline (`JourneyTimeline.tsx`, server component + `Reveal`)
- Full-viewport, cream bg.
- Vertical timeline (alternating left/right on desktop, single column on mobile). A
  connecting line is drawn/grows as items reveal on scroll (CSS + `Reveal` stagger).
- Content constant: `MILESTONES` array (`{ year, title, body }`) — **placeholder**.

### 5.5 Voices (`Voices.tsx`, client component)
- Full-viewport, `tsg-deep` bg, white text.
- Auto-rotating testimonial cards (quote, name, role, state). Pause on hover; prev/next
  controls + dots; keyboard accessible; respects reduced motion (no auto-advance).
- Content constant: `TESTIMONIALS` array — **placeholder**.

### 5.6 LocationMap (`LocationMap.tsx`, client component) ⭐ centerpiece

**Layout:** full-viewport, cream bg. Two columns on desktop:
- Left: the animated SVG map.
- Right: office card (name, address, phone/email if available from `Setting`) +
  "Open in Google Maps" button (user's link) + the lazy-loaded Google embed.
On mobile: stacked (map on top, card + embed below).

**SVG map & animation:**
1. SVG holds public-domain geometry: an **Africa** outline (muted
   `tsg-green/15`) and **Nigeria** as a distinct, highlighted path (`tsg-green`),
   plus an Abuja marker positioned at FCT's coordinates within the SVG space.
2. On scroll-into-view (IntersectionObserver), GSAP animates the SVG **`viewBox`**
   from the full-continent bounds to a tight frame around Nigeria — a smooth
   spotlight/zoom. (Animating `viewBox` keeps vectors crisp and is GPU-cheap.)
3. After the zoom, a **pin drops** onto Abuja with a pulsing ring (GSAP + CSS).
4. **Hover/tap/focus** on the pin reveals an office tooltip-card
   (*Tinubu Support Group · 2 Kainji Crescent, Maitama, Abuja*).
5. **`prefers-reduced-motion`**: skip the zoom + drop; render the Nigeria-framed view
   with the pin and card already in place.

**Geometry sourcing:** embed simplified public-domain SVG path data for Africa and
Nigeria (e.g. from Wikimedia/simplemaps-style sources) in a `mapPaths.ts` constants
file, mirroring how `tsgLogoPaths.ts` already stores SVG path data. Abuja pin
coordinates are computed once to sit on FCT and stored alongside the paths.

**Google Maps embed:**
- Lazy: render the `<iframe>` only after the section scrolls into view
  (placeholder skeleton before that) so it never blocks initial load. `loading="lazy"`,
  `referrerpolicy="no-referrer-when-downgrade"`, descriptive `title`.
- Source: the user's place link in `…&output=embed` form; fall back to an
  address-query embed if the cid embed fails to render. The "Open in Google Maps"
  button always uses the exact user-provided link.

## 6. Files

**New:**
- `src/components/public/home/AboutStory.tsx`
- `src/components/public/home/LeadershipVision.tsx`
- `src/components/public/home/ImpactPrograms.tsx`
- `src/components/public/home/JourneyTimeline.tsx`
- `src/components/public/home/Voices.tsx` (`'use client'`)
- `src/components/public/home/LocationMap.tsx` (`'use client'`)
- `src/components/public/home/mapPaths.ts` (Africa + Nigeria SVG path data, Abuja point)
- `src/components/public/home/homeContent.ts` (PROGRAMS, MILESTONES, TESTIMONIALS
  placeholder constants) — or co-locate each constant in its section file; final call
  during implementation, but placeholder constants are grouped and clearly labelled.

**Modified:**
- `src/app/(public)/page.tsx` — import/render new sections in the order above; remove
  the standalone Pillars block (folded into ImpactPrograms); pass any needed `Setting`
  fields (address/phone/email) to `LocationMap`.
- `src/app/globals.css` — add scoped styles for the timeline line, pin pulse, map
  hover card, and any section-specific helpers (kept minimal; Tailwind preferred).

**No new dependencies** — GSAP, lucide-react, next/image, and the `Reveal`/`CountUp`
helpers are already present.

## 7. Accessibility & performance

- All animations respect `prefers-reduced-motion` (the map renders its final state;
  the carousel stops auto-advancing; `Reveal` already short-circuits).
- The map pin and carousel controls are real `<button>`s with `aria-label`s and are
  keyboard-operable; the office card is reachable without hover.
- The Google embed is lazy-loaded and titled; images use `next/image` with `sizes`.
- SVG has `role="img"` + `aria-label`; decorative layers are `aria-hidden`.
- Full-viewport sections use `min-h-[100svh]` (not `100vh`) for correct mobile sizing.

## 8. Build phasing (for the implementation plan)

1. Scaffolding: section components as static (no motion), wired into `page.tsx` in
   order, Pillars folded into ImpactPrograms. Verify layout + responsiveness.
2. Content constants (placeholder) + the simpler sections (About, Leadership, Impact,
   Journey) with `Reveal` entrances.
3. Voices carousel (client interactivity + reduced-motion).
4. LocationMap: SVG geometry + viewBox zoom + pin drop + hover card.
5. LocationMap: lazy Google embed + office card + final polish.
6. Cross-cutting: reduced-motion pass, a11y pass, mobile pass, lint/build check.

## 9. Out of scope

- No CMS/admin model for the new content (placeholder constants only this round).
- No redesign of the `/about` page (homepage About section only, per decision).
- No changes to existing Hero / Stats / News / CTA / FAQ beyond removing the
  standalone Pillars block.
