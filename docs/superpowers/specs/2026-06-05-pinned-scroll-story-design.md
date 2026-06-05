# Pinned Scroll-Story: "Who We Are" → "Leadership & Vision" — Design

**Date:** 2026-06-05
**Status:** Approved (pending spec review)
**Scope:** Merge the two stacked homepage sections — **AboutStory ("Who We Are")** and
**LeadershipVision ("Leadership & Vision")** — into a single **pinned, scroll-driven
story** where the image holds a fixed position/size and, as the user scrolls, the image
slides to the next photo while the text + background blur-cross-fade between the two
frames. Mobile / reduced-motion fall back to today's stacked layout.

---

## 1. Goal

Recreate the filmic "pinned panel" effect from the user's inspiration (the *AIR* real-estate
site): the viewport holds still while a single section narrates through two states. The image
column stays the same size and position; its content scrolls vertically from photo 1 to photo 2;
the text on the other column blurs and fades out, while the next frame's text blurs and fades in
(React Bits `BlurText` look, reproduced in GSAP). The whole thing rides Lenis's eased scroll
value so the motion feels soft and momentum-driven, consistent with the rest of the site.

This is purely a presentation change to two existing sections. No new content, no data-model
change. It reuses the exact copy and images already on the homepage.

## 2. Decisions locked in brainstorming

| Decision | Choice |
|---|---|
| Scroll feel | **Scrubbed / continuous** — image + text transition tied 1:1 to scroll position |
| Blur-text implementation | **Reproduce with GSAP** — no new dependency; consistent with `SplitText`/`Hero` |
| Number of frames | **Two** — Who We Are (`tinubu2.jpg`) → Leadership & Vision (`presidentbola.jpg`) |
| Mobile / reduced-motion | **Stack normally** — skip the pin, render two normal sections (today's behavior) |
| Image side | **Left** (per user). Easy to flip to right if desired — single layout flag. |

## 3. Mechanism (recommended approach: custom Lenis-progress sticky scrubber)

**Why not GSAP ScrollTrigger or Framer Motion `useScroll`:** ScrollTrigger is unused in this
codebase, requires Lenis wiring + spacer DOM that fights Tailwind layout, and adds bundle weight;
Framer Motion (`motion`) is a whole second animation library and the team chose GSAP. The custom
approach below is ~40 lines of progress math, rides the Lenis eased scroll value directly, and
matches the existing GSAP + Lenis + progressive-enhancement patterns (`Hero`, `Reveal`,
`SplitText`, `ScrollLock`).

**Structure:**

```
<section> (outer wrapper, height ≈ 200vh — establishes scroll distance)
  <div class="sticky top-0 h-[100svh]">      ← the pinned panel
    ├ background layer (cream → green cross-fade)
    ├ image column (LEFT): fixed-size frame, overflow-hidden
    │    └ vertical strip of 2 images (stack height 200%), translateY scrubbed
    └ text column (RIGHT): Frame A + Frame B absolutely stacked,
         each blur/opacity/y driven by progress (cross-fade)
```

**Progress source:** a `usePinProgress(wrapperRef)` hook subscribes via the existing
`useLenis((lenis) => …)` callback (from `lenis/react`). On each Lenis scroll tick it reads
`wrapperRef.current.getBoundingClientRect()` and computes:

```
progress = clamp( -rect.top / (rect.height - window.innerHeight), 0, 1 )
```

`progress` is **never** stored in React state (no re-render per frame). It is written to a ref and
applied imperatively to the DOM via `gsap.quickSetter` (or direct `ref.style` writes) inside the
same callback. A `ResizeObserver` recomputes the denominator on resize. Because Lenis emits the
*eased* scroll position, the transforms inherit Lenis's momentum smoothing for free.

**Image scrub:** the image strip is a `flex-col` (or absolutely stacked) container at 200% of the
frame height holding both `next/image`s, each at `h-1/2` of the strip (= 100% of the frame).
`translateY = -progress * 50%` of the strip → frame 1 slides up and out as frame 2 slides in. An
`ease` curve is applied to `progress` for the image (e.g. `power2.inOut`) so the slide settles
softly rather than tracking the scroll linearly.

**Text scrub (BlurText reproduction):** each text frame's elements animate on a progress window:
- **Frame A** (Who We Are) is fully readable at `progress = 0`, then over `progress ∈ [0, 0.5]`
  animates to `filter: blur(10px)`, `opacity: 0`, `translateY: -28px`.
- **Frame B** (Leadership & Vision) starts at `blur(10px)`, `opacity: 0`, `translateY: 28px`, then
  over `progress ∈ [0.45, 1]` animates to `blur(0)`, `opacity: 1`, `translateY: 0`.
- A **light per-line stagger** (each line/word offset by a small slice of its window) reproduces the
  React Bits `BlurText` signature (delay between segments, blur 10→0, fade, directional `y`). The
  outgoing frame staggers in reverse so it "unwrites." This is the GSAP analogue of `BlurText`'s
  `animateBy`, `direction`, and `delay` props.

**Background + theme cross-fade:** the panel background color interpolates `tsg-cream → tsg-green`
and the ambient blurred-orb accent swaps from `tsg-green/10` (light theme) to `tsg-deep/50` (dark
theme), so each frame keeps the exact palette of its original section. Body text color interpolates
dark → white. (Implemented as two stacked solid background layers cross-faded by opacity, which is
cheaper and more correct than animating a single `background-color`.)

## 4. Components & files

**New** — `src/components/public/home/ScrollStory.tsx` (`'use client'`)
- Owns the wrapper, the `usePinProgress` hook, the image strip, and both text frames.
- Frame content defined as a small typed data structure; a single presentational `Frame` render is
  reused by **both** the pinned mode and the static fallback (single source of truth for copy).
- Props: `description?: string | null`, `vision?: string | null`, `mission?: string | null`
  (the same `Setting` fields `AboutStory`/`LeadershipVision` receive today).
- Internal structure (for isolation/testability):
  - `usePinProgress(ref) → { getProgress(): number, subscribe(fn) }` — Lenis-driven, no state.
  - `FRAMES` constant — array of two frame descriptors (eyebrow, heading, body, extras, image,
    theme, CTA). Mirrors the existing inline content from `AboutStory`/`LeadershipVision`.
  - `ScrollStory` — decides mode on mount, renders pinned or stacked, owns refs + imperative apply.

**Modified** — `src/app/(public)/page.tsx`
- Replace the two adjacent elements:
  ```diff
  - <AboutStory description={setting.description} />
  - <LeadershipVision vision={setting.vision} mission={setting.mission} />
  + <ScrollStory
  +   description={setting.description}
  +   vision={setting.vision}
  +   mission={setting.mission}
  + />
  ```
- `AboutStory.tsx` and `LeadershipVision.tsx` remain in the repo (not deleted) but are no longer
  imported by the homepage. Their imports are removed from `page.tsx`. (Keeping the files avoids a
  destructive change and leaves them available if referenced elsewhere later; a follow-up can delete
  them once confirmed unused.)

**Modified (minimal)** — `src/app/globals.css`
- Only if needed: a `will-change` helper / blur-layer class. Tailwind arbitrary values + inline
  styles are preferred; keep CSS additions minimal.

**No new dependencies.** GSAP, Lenis (`lenis/react`), `next/image`, `lucide-react`, and the
`SplitText` helper are all already present.

## 5. Progressive enhancement / fallback (SSR-safe)

Mirrors the codebase philosophy (`Reveal` renders visible fallback; `SplitText` falls back to inline
text; `Hero` gates the intro on `prefers-reduced-motion` + `sessionStorage`):

1. **SSR / first paint:** render both frames **stacked and fully visible** — i.e. effectively the
   current AboutStory + LeadershipVision layout. This is crawler-friendly, accessible, and avoids any
   hydration mismatch or layout flash.
2. **On mount:** evaluate eligibility = `window.matchMedia('(min-width: 1024px)').matches` **and**
   `!window.matchMedia('(prefers-reduced-motion: reduce)').matches`. Only if eligible, upgrade to the
   pinned scrubbed mode (mount the `200vh` wrapper + sticky panel + scrub bindings).
3. **Responsive / preference changes:** listen to both media queries; tearing down to the static
   layout (and rebuilding) when the user crosses the `lg` breakpoint or toggles reduced motion.
4. **Headings in static mode** reuse `SplitText` for the existing one-shot rise; in pinned mode the
   heading is part of the blur cross-fade (no `SplitText`).

Result: mobile, tablet (<`lg`), reduced-motion, no-JS, and crawlers all get today's clean stacked
experience; only capable desktops get the pinned story.

## 6. Content (reused verbatim from the existing sections)

**Frame A — Who We Are** (theme: cream bg, dark text)
- eyebrow `Who We Are`
- heading `A MOVEMENT FOR\nRENEWED HOPE`
- body = `description` ?? existing fallback paragraph
- beliefs list: *Unity & national cohesion · Good, accountable governance · Opportunity for every citizen*
- CTA: `Read our story →` to `/about`
- image `/assets/img/tinubu2.jpg`, caption *President Bola Ahmed Tinubu / Commander-in-Chief…*

**Frame B — Leadership & Vision** (theme: green bg, white text)
- eyebrow `Leadership & Vision`
- heading `RENEWED\nHOPE`
- pull-quote *"More than a slogan — a commitment to a Nigeria where every citizen can dream, build and belong."*
- body = `vision` ?? existing fallback; plus optional `mission` paragraph when present
- CTA: `About the President →` to `/pbat`
- image `/assets/img/blog/presidentbola.jpg`

No copy is invented; all of the above already exists in `AboutStory.tsx` / `LeadershipVision.tsx`.

## 7. Layout & sizing details

- Pinned panel is `h-[100svh]` (not `100vh`) for correct mobile sizing, content vertically centered,
  constrained with `max-w-7xl` + responsive padding. The original `py-28/36` density is **tightened**
  for the pinned panel so both image and text fit one viewport without clipping at common laptop
  heights (~720–900px). Long `vision`+`mission` bodies are clamped/scrolled-safe (line-clamp on the
  body in pinned mode only; full text shown in static fallback).
- Image frame: fixed aspect/size matching the current rounded-`[2rem]` framed portrait, `shadow-2xl`,
  `overflow-hidden`. Keeps the AboutStory decorative offset border as a subtle touch (optional).
- Outer wrapper height = `200vh` (one viewport of "scrub" for the single A→B transition). Tunable;
  `200vh` gives a deliberate-but-not-tedious transition. Documented as a single constant.

## 8. Accessibility & performance

- **Reduced motion / mobile:** no pin, no scrub — static stacked sections (see §5). Nothing
  scroll-jacks touch users.
- **Only `transform`, `opacity`, `filter: blur` animate**; `will-change` applied to the moving
  layers and cleared on teardown. Blur radius capped at 10px. No layout-thrashing properties.
- **No per-frame React re-renders** — progress lives in a ref, applied via `gsap.quickSetter`/direct
  style writes inside the Lenis callback (already one update per rAF).
- Both images mounted (only two), `next/image` with correct `sizes`; neither is `priority` (below the
  fold). The currently-hidden frame's text stays in the DOM (opacity/blur, not `display:none`) so it
  remains accessible to AT and selectable; `aria-hidden` is toggled on the inactive frame in pinned
  mode to avoid duplicate reading.
- All CTAs remain real `<Link>`s, reachable by keyboard regardless of scroll position. (Consideration:
  while a frame is mid-transition its links are still focusable; acceptable since both destinations
  are valid. If needed, `inert`/`tabindex=-1` is applied to the not-yet-active frame.)
- GSAP work wrapped in `gsap.context(...)` and reverted on unmount; Lenis subscription and
  `ResizeObserver` torn down on cleanup and on mode change.

## 9. Edge cases & risks

- **Lenis not mounted / `useLenis` returns null:** `usePinProgress` falls back to a native `scroll`
  listener (rect math is identical). The site always wraps public pages in `SmoothScroll`, but the
  fallback keeps the component robust in isolation/tests.
- **Anchor jumps / `scrollRestoration`:** progress is derived purely from the wrapper rect, so any
  scroll position (including refresh mid-section or a hash jump) resolves to the correct frame state.
- **Sticky inside the existing layout:** verify no ancestor sets `overflow` that would break
  `position: sticky` (the public layout uses Lenis `root`; `ScrollLock` only toggles `overflow` while
  *locked*, which never overlaps this section). Confirm during implementation.
- **Content too tall for one viewport** on small laptops: handled by tightened density + body
  line-clamp in pinned mode; static fallback shows full copy.
- **CLS:** static SSR layout reserves real height; pinned mode is enabled post-mount and the wrapper
  height is deterministic (`200vh`), so no cumulative layout shift on capable clients beyond the
  intended mode swap (which happens before scroll reaches the section).

## 10. Build phasing (for the implementation plan)

1. `ScrollStory` scaffold: `FRAMES` data + `Frame` presentational render + **static stacked mode**
   only. Wire into `page.tsx` (replace the two sections). Verify it matches today's look/SEO.
2. `usePinProgress` hook (Lenis + rect + ResizeObserver, ref-based, with native fallback). Unit-test
   the progress math (pure function: rect + viewport → clamped progress).
3. Pinned shell: `200vh` wrapper + sticky panel + image strip + background cross-fade layers. Drive
   image translateY + bg opacity from progress. Verify the image slide feels soft.
4. Text blur cross-fade with per-line stagger (BlurText reproduction); wire both frames' windows.
5. Eligibility/mode switching (matchMedia for `lg` + reduced-motion), teardown/rebuild on change,
   `aria-hidden`/`inert` on inactive frame, GSAP context cleanup.
6. Polish + verification: density/clip check at 1280×720 and 1440×900, reduced-motion pass, mobile
   stacked pass, keyboard pass, `lint`. (Avoid `tsc`/`next build` while the dev server is running per
   project memory; rely on `next lint` + the running dev server for verification.)

## 11. Testing

- **Pure-function unit test** (Vitest, already in the project) for the progress calculation and for
  the per-frame easing/window mapping (input progress → expected blur/opacity/translate). These are
  deterministic and the highest-value tests for this feature.
- **Manual / Playwright (optional):** the project has `@playwright/test` (`e2e` script). A smoke test
  can assert the section renders both frames' text in static mode and that the wrapper gains the
  pinned structure at desktop width. Scroll-scrub visual correctness is verified manually against the
  inspiration.

## 12. Out of scope

- No changes to the other homepage sections (Hero, Stats, Impact, Journey, Voices, News, Location,
  CTA, FAQ).
- No new content, CMS field, or data-model change — copy and images are reused verbatim.
- No deletion of `AboutStory.tsx` / `LeadershipVision.tsx` this round (left unused on the homepage;
  optional follow-up cleanup).
- No additional image frames beyond the two (a longer image strip is a possible future enhancement).
