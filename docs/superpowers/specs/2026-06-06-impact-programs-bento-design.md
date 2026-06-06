# Impact Programs — Aceternity Bento + 3D Parallax Cards

**Date:** 2026-06-06
**Section:** Homepage "What We Stand For / Programs driving the Renewed Hope agenda"
**Target file:** `src/components/public/home/ImpactPrograms.tsx`

## Goal

Redesign the Impact Programs section into an Aceternity-style **asymmetric bento grid**
of **3D mouse-tilt parallax cards** on a **dark cinematic** background, matching the
production quality and motion language of the surrounding sections (`LocationMap` /
`LocationStage` GSAP cinematic + `ScrollStory`).

## Constraints (repo conventions)

- **Stack:** Tailwind 3.4 + GSAP 3.15 + Lenis. **No framer-motion** — reproduce the
  Aceternity Bento + 3D-card look with plain React state + CSS transforms (which is how
  Aceternity's `3d-card` works under the hood) and GSAP for the scroll-in.
- **No new dependencies** and **no Tailwind config changes**. Tailwind 3.4 has no
  `perspective`/`translate-z` utilities, so all 3D transforms are applied via inline
  `style` props.
- Honour `prefers-reduced-motion` (settle visible, no tilt) and coarse-pointer/touch
  devices (no tilt; gentle hover lift only) — consistent with `Reveal` and
  `LocationStage`.
- Brand tokens: `tsg-green`, `tsg-deep`, `tsg-cream`, `emerald-400`, `eyebrow` class.

## Architecture (server/client split — mirrors LocationMap → LocationStage)

- **`ImpactPrograms.tsx` (Server Component, modified):**
  - Renders the dark section shell (`bg-[#070809]`, `min-h-[100svh]`, radial glow
    backdrop) and the eyebrow / `h2` heading / subhead, each wrapped in `Reveal`.
  - Mounts the client island `<ProgramsBento />`.
- **`ProgramsBento.tsx` (new, `'use client'`):**
  - Imports `{ PROGRAMS }` directly from `homeContent.ts`. (PROGRAMS entries carry
    `icon: LucideIcon` React components, which are **not serializable** across the
    server→client prop boundary — importing inside the client island avoids passing
    them as props.)
  - Renders the bento grid: 3 program `TiltCard`s + 1 CTA tile.
  - Runs the GSAP scroll-in stagger via IntersectionObserver (same trigger pattern as
    `LocationStage`).
  - `TiltCard` is a local component handling the per-card 3D tilt + layered depth.

No data/schema changes to `homeContent.ts`. The `Program` interface is unchanged.

## Bento layout

Desktop (`lg`, `grid-cols-4`, 2 rows via `lg:auto-rows-[minmax(240px,1fr)]`):

```
┌───────────────────────────┬───────────────────────────┐
│                           │  Economic Growth (wide)   │   row 1
│   YOUTH EMPOWERMENT        ├──────────────┬────────────┤
│   (big hero, 2×2)         │  Inclusive   │   CTA      │   row 2
│                           │  Governance  │  "Add your │
│                           │              │   voice" → │
└───────────────────────────┴──────────────┴────────────┘
```

Tile spans:

| Tile                 | mobile | sm        | lg                            |
|----------------------|--------|-----------|-------------------------------|
| Youth Empowerment    | full   | col-span-2| col-span-2 row-span-2 (hero)  |
| Economic Growth      | full   | 1 col     | col-span-2 (wide)             |
| Inclusive Governance | full   | 1 col     | col-span-1                    |
| CTA ("Add your voice")| full  | col-span-2| col-span-1                    |

The 4 lg tiles fill the 4×2 grid exactly (auto-flow row). Program tiles are
image-forward; the CTA tile is a solid emerald-gradient glass panel.

## Visual treatment (dark cinematic)

- Section: `bg-[#070809]`, two blurred radial glow blobs (emerald + `tsg-green`) behind
  the grid, like the CTA banner.
- Program cards: `bg-white/[0.04]` glass, `border-white/10`, `backdrop-blur`; hover →
  emerald border + soft glow shadow + slight lift. Background `next/image` with
  per-span `sizes`, dark `from-[#070809]` bottom gradient for legibility, floating icon
  chip (`bg-white/95 text-tsg-green`) top-left.
- CTA tile: emerald/`tsg-green` gradient, glow, icon + "Add your voice to the movement"
  + arrow, links to `/register`.
- Type: eyebrow `emerald-400`, `h2` white (`font-display`), body/subhead `white/70`,
  card titles white, card body `white/70` (small tile body `line-clamp-2`).

## Interaction & motion

- **3D tilt (per card):** on `pointermove` over a fine-pointer device, compute cursor
  offset from card centre → apply `transform: perspective(1000px) rotateX(..) rotateY(..)`
  to the inner wrapper (with `transition` for smoothing). Children carry
  `transform-style: preserve-3d` and different `translateZ` depths: image plane recedes,
  icon chip + title pop forward, body sits mid-depth → parallax as the cursor moves.
  Reset flat on `pointerleave`.
- **Scroll-in:** GSAP timeline staggers tiles (opacity 0→1, `y` 24→0, `scale`
  0.96→1) when the section crosses the IntersectionObserver threshold; plays once.
- **Reduced motion / touch:** skip tilt and scroll-in animation; settle to fully
  visible with a gentle CSS hover lift. Pointer handler is rAF-throttled, transform-only
  (GPU), `will-change: transform` only while a card is active.

## Accessibility & performance

- Decorative images: `alt=""`. CTA is a real `Link`. Heading hierarchy preserved
  (`h2` section heading, `h3` per program).
- Tilt is decorative and listener-gated to fine pointers; no layout thrash.
- `next/image` with correct `sizes` per tile span; no new JS dependencies.

## Out of scope

- Editable/CMS-driven program content (stays in `homeContent.ts` placeholder data).
- Scroll-driven parallax of card imagery (chosen interaction is mouse-tilt + layered
  depth only).
- Changes to other homepage sections.
```
