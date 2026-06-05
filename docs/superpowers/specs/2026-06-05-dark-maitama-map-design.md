# Dark Maitama Map — Location Section Redesign

**Date:** 2026-06-05
**Status:** Approved
**Supersedes:** the Africa→Nigeria animated map in `LocationMap.tsx` (from the
2026-06-02 homepage-sections spec).

## 1. Goal

Replace the homepage Location section with a full-bleed, near-black map of
Maitama, Abuja — styled after the "AIR" reference: thin light-gray streets on
black, dark building/park blocks, a few labeled landmarks, and a white
speech-bubble tooltip pin on the Tinubu Support Group head office. The office
address and "Open in Google Maps" link are kept as a floating dark-glass card.

## 2. Reference & deviations

The reference is the downtown-district dark map aesthetic (real city streets,
abstractly rendered). We replicate: black canvas, hairline streets, dark filled
blocks, landmark markers + uppercase labels, a tooltip pin on the headline
building, and a short uppercase intro paragraph.

**One deliberate deviation:** the reference's circular "M" badges are subway
stations. Maitama has no metro, so we do not fake them. The same circular-marker
visual language is reused for **real nearby landmarks** (parks, notable places)
pulled from OpenStreetMap.

The reference's global chrome (hamburger/heart icons, "CHOOSE AN OFFICE"
switcher) is site navigation, not part of this section, and is omitted. TSG has a
single HQ, so there is no office switcher.

## 3. Architecture

Two units, mirroring the existing `generate-map-paths.mjs` → `mapPaths.ts`
pattern so there is **zero runtime network dependency** (geometry is generated
once at build time and committed).

### 3.1 `scripts/generate-maitama-map.mjs` (build-time, Node)

- Office anchor: `9.0917274, 7.5051776` (geocoded "Kainji Crescent, Maitama,
  Abuja" via Nominatim).
- Fetches OSM data via the Overpass API for a square box centered on the office
  (configurable `RADIUS_M`, default 850 m). Primary endpoint
  `overpass-api.de`, falls back to `overpass.kumi.systems`. Sends a descriptive
  `User-Agent` (required — bare requests get HTTP 406).
- Layers fetched (`out geom;` so geometry is inline, no node-ref resolution):
  - **roads** (`highway`) — split into **major** (motorway/trunk/primary/
    secondary/tertiary + links) and **minor** (residential/unclassified/service/
    living_street). Footways/paths omitted to reduce clutter.
  - **buildings** (`building`) — filled polygons.
  - **green** (`leisure` park/garden/pitch/recreation_ground, `landuse`
    grass/forest/recreation_ground, `natural` wood) — filled polygons.
  - **water** (`natural=water`, `waterway` riverbank) — filled polygons.
- Projection: equirectangular, cos-corrected at the center latitude (identical
  math to `generate-map-paths.mjs`). Frame = office ± `RADIUS_M` converted to
  degrees, projected to a `0 0 1000 H` viewBox. Geometry outside the frame is
  left in place and cropped by the SVG viewport.
- Landmarks: named `leisure`/`amenity`/`tourism` features; pick up to 6 closest
  to the office with short names; store projected `{x, y, label}` (label
  uppercased).
- Street labels: up to 5 longest distinct named roads; store a midpoint `{x, y,
  angle, label}` for rotated placement.
- Output: `src/components/public/home/maitamaMap.ts` (AUTO-GENERATED header),
  exporting `MAP_VIEWBOX`, `OFFICE_POINT`, `ROADS_MAJOR`, `ROADS_MINOR`,
  `BUILDINGS`, `GREEN`, `WATER`, `LANDMARKS`, `STREET_LABELS`.

### 3.2 `LocationMap.tsx` (`'use client'`)

Props unchanged: `{ address?, phone?, email? }` from the Setting record.

- Section: `relative isolate overflow-hidden`, near-black background
  (`#070809`), `min-h-[100svh]`, flex-centered.
- **Map SVG** — `absolute inset-0 h-full w-full`,
  `preserveAspectRatio="xMidYMid slice"` so it covers the section. Layer order
  back→front: water, green, buildings, minor roads, major roads, landmark
  markers, office pin. Road strokes use `vector-effect="non-scaling-stroke"` to
  stay hairline-crisp at any cover-scale. Landmark markers (small open circle +
  uppercase label) and the office pin/tooltip are **inside the SVG** in viewBox
  units, so they stay geographically anchored and crop/scale with the map.
- **Office pin**: a `<g>` at `OFFICE_POINT` — a dot/ring at the exact point and a
  white-stroked, transparent-fill rounded rect reading **"TSG"** with a downward
  pointer (the "AIR" treatment).
- **HTML overlays** (screen-anchored, not map-anchored), above the SVG:
  - Intro: small `FIND US` eyebrow + a short uppercase paragraph (white/55,
    tracked) near the top, adapted to Maitama.
  - Address card: dark-glass (`bg-white/5 backdrop-blur border-white/10`) in a
    bottom corner — MapPin icon, "Tinubu Support Group", `displayAddress`,
    optional phone/email, and the **Open in Google Maps** button (existing
    `MAPS_LINK`).
- **Motion** (GSAP, reuse existing IntersectionObserver pattern): on first
  scroll-into-view, fade the map in and drop the office pin. `prefers-reduced-
  motion` → final state set immediately, no animation.

## 4. Styling tokens

| Element       | Value |
|---------------|-------|
| Background    | `#070809` |
| Water fill    | `rgba(56,84,104,0.25)` |
| Green fill    | `rgba(32,58,42,0.5)` |
| Building fill | `rgba(255,255,255,0.05)` |
| Minor road    | stroke `rgba(255,255,255,0.09)`, ~0.75px non-scaling |
| Major road    | stroke `rgba(255,255,255,0.20)`, ~1.3px non-scaling |
| Landmark dot  | stroke `rgba(255,255,255,0.5)`, fill none |
| Labels        | `rgba(255,255,255,0.45)`, uppercase, tracked |
| Office pin    | white stroke, transparent fill, white text |

## 5. Cleanup

- Delete `src/components/public/home/mapPaths.ts` and
  `scripts/generate-map-paths.mjs` (Africa/Nigeria, now unused).
- Remove the unused `.map-embed-skeleton` rule from `globals.css`.

## 6. Testing / verification

- Run the generator; sanity-check viewBox, layer path lengths, landmark/label
  counts.
- Visual verification against the running dev server (Playwright screenshot of
  `#location`). No `tsc`/`next build` while the dev server is up (OOM risk).
- Adversarial multi-agent review: correctness (projection/layer mapping),
  React/Next best practices, accessibility, performance, design fidelity to the
  reference, and dead-code/cleanup completeness.

## 7. Risks

- **Overpass availability at build time** — mitigated by dual endpoints and by
  committing the generated output (runtime never calls Overpass).
- **Density** — Maitama is leafy/low-rise; `RADIUS_M` is tuned so the frame has
  enough streets/blocks to read as a map without clutter.
- **Label overlap** — curated to a small set (≤6 landmarks, ≤5 streets).
