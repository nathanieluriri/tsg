# Pinned Scroll-Story (Who We Are → Leadership & Vision) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the homepage's `AboutStory` and `LeadershipVision` sections into one pinned, scroll-scrubbed story where a fixed-position image slides from photo 1 to photo 2 while the text + background blur-cross-fade between the two frames; mobile/reduced-motion/touch keep today's stacked layout.

**Architecture:** A single client component `ScrollStory` decides its mode on mount. On capable desktops (`≥lg`, a fine pointer, and not `prefers-reduced-motion`) it renders `PinnedStory`: a `200vh` wrapper with a `sticky top-0 h-[100svh]` panel. Scroll progress (0..1) is read from the wrapper's bounding rect on every Lenis scroll tick (`useLenis(callback)`) and applied **imperatively** (direct style writes, no per-frame React state) to drive an image filmstrip's `translateY`, a background opacity cross-fade, and per-segment blur/opacity/translate on both text frames (a GSAP-free reproduction of React Bits `BlurText`). The inactive frame is made `inert`. Otherwise it renders the existing `<AboutStory>` + `<LeadershipVision>` unchanged. All copy lives in one shared `storyContent.ts`; all scroll math lives in a pure, unit-tested `scrollStoryMath.ts`.

**Tech Stack:** Next.js 15 App Router, React 19 (native `inert` support), TypeScript, Tailwind CSS 3.4, Lenis (`lenis/react`, already wired in `SmoothScroll`), `next/image`, `lucide-react`, Vitest (node env). **No new dependencies.**

---

## Background: how this fits the codebase

- Smooth scroll is global via [SmoothScroll.tsx](../../../src/components/public/scroll/SmoothScroll.tsx) (`ReactLenis root`). Lenis `root` mode scrolls the window programmatically (it does **not** transform `<body>`), so native `position: sticky` works underneath it.
- `useLenis(callback, deps)` from `lenis/react` registers a scroll callback through Lenis's own subscription queue and returns the instance; this is the idiomatic subscribe API (preferred over manual `.on/.off`).
- Progressive-enhancement precedent: [Reveal.tsx](../../../src/components/public/home/Reveal.tsx) renders a visible fallback, [SplitText.tsx](../../../src/components/public/home/SplitText.tsx) falls back to inline text and early-returns under `prefers-reduced-motion`, [Hero.tsx](../../../src/components/public/home/Hero.tsx) gates motion on `prefers-reduced-motion`.
- Tests: [vitest.config.ts](../../../vitest.config.ts) → `environment: 'node'`. The committed tests live in `tests/Unit/` (capital U); the config glob is lowercase `tests/unit/**` and only resolves on case-insensitive filesystems — **Task 2 fixes this**. Run with `npm test`. Alias `@` → `src`.
- **Project memory constraints:** do **not** start a second `next dev` server, and do **not** run `tsc`/`next build` while the dev server is up (it OOMs). Verify via `npm test`, `npm run lint`, and the user's already-running dev server.
- **Grounding confirmed during review:** `setting.description/vision/mission` exist on the Setting model; Tailwind tokens `bg-tsg-cream`, `bg-tsg-green`, `text-tsg-deep`, `bg-tsg-green/12`, `shadow-tsg-deep/25`, `font-onest`, `font-display`, `.eyebrow`, and `line-clamp-*` are all available/used; `lenis@1.3.23` exposes the `useLenis` callback API; both image paths (`/assets/img/tinubu2.jpg`, `/assets/img/blog/presidentbola.jpg`) exist under `public/`; importing the non-`'use client'` `AboutStory`/`LeadershipVision` into the `'use client'` `ScrollStory` is valid (neither has server-only code).

## File structure

| File | Responsibility |
|---|---|
| **Create** `src/components/public/home/storyContent.ts` | Single source of truth for the two frames' copy (eyebrow, heading, fallback body, beliefs, quote, CTA). |
| **Modify** `src/components/public/home/AboutStory.tsx` | Consume `storyContent` instead of inline copy (no visual change). |
| **Modify** `src/components/public/home/LeadershipVision.tsx` | Consume `storyContent` instead of inline copy (no visual change). |
| **Create** `src/components/public/home/scrollStoryMath.ts` | Pure scroll/animation math: `clamp`, `computeProgress`, `mapRange`, `easeInOut`, `segmentProgress`. No DOM. |
| **Create** `tests/Unit/scrollStoryMath.test.ts` | Vitest unit tests for every math function. |
| **Modify** `vitest.config.ts` | Fix the test glob casing so unit tests run on case-sensitive CI. |
| **Create** `src/components/public/home/usePinProgress.ts` | Client hook: subscribes via `useLenis` + `ResizeObserver`, reports clamped 0..1 progress through a callback. |
| **Create** `src/components/public/home/ScrollStory.tsx` | Client component: mode decision (`matchMedia`) + static fallback (`AboutStory`+`LeadershipVision`) + `PinnedStory`. |
| **Modify** `src/app/(public)/page.tsx` | Replace the two section elements + imports with `<ScrollStory …>`. |

`AboutStory.tsx` / `LeadershipVision.tsx` are **not** deleted — they become the static-fallback renderers imported by `ScrollStory`, and share copy with the pinned branch via `storyContent.ts`.

---

## Task 1: Extract shared copy to `storyContent.ts` (single source of truth)

Restores the spec's §4 single-source-of-truth so the pinned branch and the static fallback can never drift.

**Files:**
- Create: `src/components/public/home/storyContent.ts`
- Modify: `src/components/public/home/AboutStory.tsx`
- Modify: `src/components/public/home/LeadershipVision.tsx`

- [ ] **Step 1: Create the content module**

Create `src/components/public/home/storyContent.ts`:

```ts
// Single source of truth for the "Who We Are" (AboutStory) and
// "Leadership & Vision" (LeadershipVision) copy. Consumed by those two
// components AND by the pinned ScrollStory so the two render paths never drift.
// Headings use "\n" to mark a forced line break; the `uppercase` class on each
// heading handles display casing.

export const STORY = {
  about: {
    eyebrow: 'Who We Are',
    heading: 'A Movement For\nRenewed Hope',
    fallbackBody:
      'The Tinubu Support Group is a nationwide community of individuals and groups standing with President Bola Ahmed Tinubu — advancing policies, initiatives and developmental programs that build a better Nigeria.',
    beliefs: [
      'Unity & national cohesion',
      'Good, accountable governance',
      'Opportunity for every citizen',
    ],
    cta: { label: 'Read our story', href: '/about' },
  },
  leadership: {
    eyebrow: 'Leadership & Vision',
    heading: 'Renewed\nHope',
    quote:
      '“More than a slogan — a commitment to a Nigeria where every citizen can dream, build and belong.”',
    fallbackBody:
      'We stand with President Tinubu to turn the Renewed Hope agenda into real progress — championing reform, opportunity and unity in every community.',
    cta: { label: 'About the President', href: '/pbat' },
  },
} as const;
```

- [ ] **Step 2: Refactor `AboutStory.tsx` to consume `STORY`**

In `src/components/public/home/AboutStory.tsx`:

Add the import (with the existing imports):

```tsx
import { STORY } from './storyContent';
```

Remove the local `BELIEFS` constant (lines 11–15). Then update the JSX to use `STORY.about`:

```tsx
<Reveal>
  <p className="eyebrow text-tsg-green">{STORY.about.eyebrow}</p>
</Reveal>
<SplitText
  as="h2"
  text={STORY.about.heading}
  className="font-onest mt-5 text-[clamp(2.25rem,5vw,4.5rem)] font-normal uppercase leading-[0.95] tracking-[-0.03em] text-tsg-deep"
/>
<Reveal delay={120}>
  <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600">
    {description || STORY.about.fallbackBody}
  </p>
</Reveal>
<Reveal delay={200}>
  <ul className="mt-8 space-y-3">
    {STORY.about.beliefs.map((b) => (
      <li key={b} className="flex items-center gap-3 text-tsg-deep">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tsg-green/12 text-tsg-green">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <span className="font-medium">{b}</span>
      </li>
    ))}
  </ul>
</Reveal>
<Reveal delay={260}>
  <Link
    href={STORY.about.cta.href}
    className="group mt-10 inline-flex items-center gap-2 rounded-full bg-tsg-green px-7 py-3.5 font-semibold text-white shadow-lg shadow-tsg-green/20 transition hover:bg-tsg-deep"
  >
    {STORY.about.cta.label}
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Link>
</Reveal>
```

(The image block and section wrapper are unchanged.)

- [ ] **Step 3: Refactor `LeadershipVision.tsx` to consume `STORY`**

In `src/components/public/home/LeadershipVision.tsx`:

Add the import:

```tsx
import { STORY } from './storyContent';
```

Update the JSX text bits to use `STORY.leadership` (portrait + section wrapper unchanged):

```tsx
<Reveal>
  <p className="eyebrow text-white/70">{STORY.leadership.eyebrow}</p>
</Reveal>
<SplitText
  as="h2"
  text={STORY.leadership.heading}
  className="font-onest mt-5 text-[clamp(2.75rem,6vw,5.5rem)] font-normal uppercase leading-[0.92] tracking-[-0.03em] text-white"
/>
<Reveal delay={120}>
  <Quote className="mt-8 h-9 w-9 text-white/40" aria-hidden="true" />
  <blockquote className="font-display mt-3 text-2xl font-light leading-snug text-white md:text-3xl">
    {STORY.leadership.quote}
  </blockquote>
</Reveal>
<Reveal delay={180}>
  <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/80">
    {vision || STORY.leadership.fallbackBody}
  </p>
</Reveal>
{mission && (
  <Reveal delay={220}>
    <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">{mission}</p>
  </Reveal>
)}
<Reveal delay={260}>
  <Link
    href={STORY.leadership.cta.href}
    className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-tsg-green shadow-lg shadow-black/20 transition hover:bg-white/90"
  >
    {STORY.leadership.cta.label}
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Link>
</Reveal>
```

- [ ] **Step 4: Verify lint + homepage parity**

Run: `npm run lint`
Expected: PASS (no unused-vars from the removed `BELIEFS`).

In the running dev server, load `/` and confirm the About + Leadership sections look **identical to before** (this is a pure copy-extraction refactor).

- [ ] **Step 5: Commit**

```bash
git add src/components/public/home/storyContent.ts src/components/public/home/AboutStory.tsx src/components/public/home/LeadershipVision.tsx
git commit -m "refactor(home): extract About/Leadership copy to shared storyContent"
```

---

## Task 2: Pure scroll-math helpers (TDD) + fix test glob

**Files:**
- Create: `src/components/public/home/scrollStoryMath.ts`
- Test: `tests/Unit/scrollStoryMath.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Fix the vitest include glob so unit tests run on case-sensitive CI**

In `vitest.config.ts`, change the include line:

```ts
// FROM:
include: ['tests/unit/**/*.test.ts'],
// TO:
include: ['tests/Unit/**/*.test.ts'],
```

(The committed tests live in `tests/Unit/`; this makes the glob match the real directory on Linux/CI, not just Windows/macOS.)

- [ ] **Step 2: Write the failing test**

Create `tests/Unit/scrollStoryMath.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  clamp,
  computeProgress,
  mapRange,
  easeInOut,
  segmentProgress,
} from '../../src/components/public/home/scrollStoryMath';

describe('clamp', () => {
  it('clamps below, above, and passes through', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(0.4)).toBe(0.4);
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe('computeProgress', () => {
  const VH = 800;
  const H = 1600; // 200vh wrapper → travel = H - VH = 800

  it('is 0 at the top of the section', () => {
    expect(computeProgress(0, H, VH)).toBe(0);
  });
  it('is 1 after the full travel', () => {
    expect(computeProgress(-800, H, VH)).toBe(1);
  });
  it('is 0.5 at the midpoint', () => {
    expect(computeProgress(-400, H, VH)).toBeCloseTo(0.5, 5);
  });
  it('clamps outside the range', () => {
    expect(computeProgress(200, H, VH)).toBe(0);
    expect(computeProgress(-2000, H, VH)).toBe(1);
  });
  it('returns 0 when the section is not taller than the viewport', () => {
    expect(computeProgress(-10, 800, 800)).toBe(0);
    expect(computeProgress(-10, 700, 800)).toBe(0);
  });
});

describe('mapRange', () => {
  it('remaps a sub-window onto 0..1', () => {
    expect(mapRange(0.5, 0.5, 1)).toBe(0);
    expect(mapRange(0.75, 0.5, 1)).toBe(0.5);
    expect(mapRange(1, 0.5, 1)).toBe(1);
  });
  it('clamps outside the window', () => {
    expect(mapRange(0.2, 0.5, 1)).toBe(0);
    expect(mapRange(2, 0.5, 1)).toBe(1);
  });
  it('handles a zero-width window', () => {
    expect(mapRange(0.6, 0.5, 0.5)).toBe(1);
    expect(mapRange(0.4, 0.5, 0.5)).toBe(0);
  });
});

describe('easeInOut', () => {
  it('pins endpoints and midpoint', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 5);
  });
  it('is monotonic increasing', () => {
    expect(easeInOut(0.25)).toBeLessThan(easeInOut(0.5));
    expect(easeInOut(0.5)).toBeLessThan(easeInOut(0.75));
  });
});

describe('segmentProgress', () => {
  it('earlier segments lead, later segments trail (cascade)', () => {
    const p = 0.3;
    expect(segmentProgress(p, 0, 4, 0, 1)).toBeGreaterThan(segmentProgress(p, 3, 4, 0, 1));
  });
  it('every segment completes by the end of the window', () => {
    expect(segmentProgress(1, 0, 4, 0, 1)).toBe(1);
    expect(segmentProgress(1, 3, 4, 0, 1)).toBe(1);
  });
  it('every segment is 0 before its window starts', () => {
    expect(segmentProgress(0, 0, 4, 0.45, 1)).toBe(0);
    expect(segmentProgress(0.4, 3, 4, 0.45, 1)).toBe(0);
  });
  it('handles a single segment', () => {
    expect(segmentProgress(0, 0, 1, 0, 1)).toBe(0);
    expect(segmentProgress(1, 0, 1, 0, 1)).toBe(1);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- scrollStoryMath`
Expected: FAIL — `Failed to resolve import ".../scrollStoryMath"` (module does not exist yet).

- [ ] **Step 4: Write the minimal implementation**

Create `src/components/public/home/scrollStoryMath.ts`:

```ts
// Pure, DOM-free math for the pinned scroll-story. Kept separate from the React
// component so it can be unit-tested in the node test environment.

/** Clamp `n` into [min, max] (defaults to [0, 1]). */
export function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Scroll progress (0..1) of a tall pinned wrapper.
 * 0 when the wrapper's top edge is at the top of the viewport; 1 once the wrapper
 * has scrolled its full "travel" (its height minus one viewport).
 *
 * @param rectTop        wrapper.getBoundingClientRect().top
 * @param wrapperHeight  wrapper.getBoundingClientRect().height
 * @param viewportHeight window.innerHeight
 */
export function computeProgress(
  rectTop: number,
  wrapperHeight: number,
  viewportHeight: number,
): number {
  const travel = wrapperHeight - viewportHeight;
  if (travel <= 0) return 0;
  return clamp(-rectTop / travel);
}

/** Remap `p` from the window [inStart, inEnd] onto [0, 1], clamped. */
export function mapRange(p: number, inStart: number, inEnd: number): number {
  if (inEnd === inStart) return p >= inEnd ? 1 : 0;
  return clamp((p - inStart) / (inEnd - inStart));
}

/** Cubic ease-in-out. Keeps the image slide from tracking scroll perfectly 1:1. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Per-segment progress for a staggered ("BlurText"-style) reveal. Splits the
 * window [windowStart, windowEnd] into `count` overlapping sub-windows and
 * returns segment `index`'s clamped 0..1 progress at global progress `p`.
 * Earlier indices lead; later indices trail. `spread` (0..1) is the fraction of
 * the window each segment's own travel occupies (higher = more overlap).
 *
 * Note: callers control direction by choosing the index they pass — e.g. an
 * outgoing frame that should "unwrite" passes `count - 1 - i` to reverse it.
 */
export function segmentProgress(
  p: number,
  index: number,
  count: number,
  windowStart: number,
  windowEnd: number,
  spread = 0.7,
): number {
  const span = windowEnd - windowStart;
  const segSpan = span * spread;
  const startRoom = span - segSpan;
  const start = windowStart + (count <= 1 ? 0 : (index / (count - 1)) * startRoom);
  return mapRange(p, start, start + segSpan);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- scrollStoryMath`
Expected: PASS — all `describe` blocks green.

- [ ] **Step 6: Commit**

```bash
git add src/components/public/home/scrollStoryMath.ts tests/Unit/scrollStoryMath.test.ts vitest.config.ts
git commit -m "feat(home): add pure scroll-story math helpers + tests; fix vitest glob casing"
```

---

## Task 3: `usePinProgress` hook

**Files:**
- Create: `src/components/public/home/usePinProgress.ts`

> Not unit-tested: this is thin glue over Lenis + DOM APIs (the testable math is already covered in Task 2). It is verified manually in Task 6's browser checklist.

- [ ] **Step 1: Write the hook**

Create `src/components/public/home/usePinProgress.ts`:

```ts
'use client';

import { useCallback, useEffect, type RefObject } from 'react';
import { useLenis } from 'lenis/react';
import { computeProgress } from './scrollStoryMath';

/**
 * Reports a tall pinned wrapper's scroll progress (0..1) through `onProgress` on
 * every Lenis scroll tick and on resize. Progress is delivered via callback (not
 * React state) so consumers can apply it imperatively with no re-render per
 * frame. Subscribes through `lenis/react`'s `useLenis(callback)` so Lenis manages
 * the subscription lifecycle (no manual re-subscription gap).
 *
 * Only call this from a component that is mounted exclusively in pinned mode
 * (e.g. PinnedStory) — mounting/unmounting that component gates the listeners.
 *
 * @param ref        the tall wrapper (height > viewport) that pins a sticky child
 * @param onProgress called with the clamped 0..1 progress
 */
export function usePinProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
) {
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    onProgress(computeProgress(rect.top, rect.height, window.innerHeight));
  }, [ref, onProgress]);

  // Drive updates off Lenis's eased scroll position (smooth/momentum feel).
  useLenis(measure, [measure]);

  // Initial sync + react to size changes. The wrapper is 200vh (viewport-relative)
  // so a viewport-height change resizes it and the ResizeObserver fires — covering
  // both width and height changes without a separate window 'resize' listener.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, measure]);
}
```

- [ ] **Step 2: Verify it lints clean**

Run: `npm run lint`
Expected: PASS for the new file. (Do **not** run `tsc`/`next build` — memory: OOMs with the dev server up.)

- [ ] **Step 3: Commit**

```bash
git add src/components/public/home/usePinProgress.ts
git commit -m "feat(home): add usePinProgress Lenis scroll-progress hook"
```

---

## Task 4: `ScrollStory` shell + static fallback, wired into the homepage

This task makes the homepage render `ScrollStory`, which (for now) always shows the existing stacked sections. The pinned branch is added in Task 5. After this task the homepage must look **identical to today**.

**Files:**
- Create: `src/components/public/home/ScrollStory.tsx`
- Modify: `src/app/(public)/page.tsx`

- [ ] **Step 1: Create `ScrollStory.tsx` with the mode decision + static fallback**

Create `src/components/public/home/ScrollStory.tsx`:

```tsx
'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import AboutStory from './AboutStory';
import LeadershipVision from './LeadershipVision';

// useLayoutEffect on the client (decide the mode before first paint, no flash);
// useEffect on the server to avoid the SSR warning.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ScrollStoryProps {
  description?: string | null;
  vision?: string | null;
  mission?: string | null;
}

/**
 * Merges the "Who We Are" (AboutStory) and "Leadership & Vision"
 * (LeadershipVision) sections. On capable desktops it upgrades to a pinned,
 * scroll-scrubbed story; everywhere else (mobile, < lg, touch-primary,
 * reduced-motion, no-JS, crawlers) it renders the two sections stacked exactly
 * as before.
 */
export default function ScrollStory({ description, vision, mission }: ScrollStoryProps) {
  // Start false so SSR + first client render match (static layout). Upgraded in a
  // layout effect before paint when eligible.
  const [pinned, setPinned] = useState(false);

  useIsoLayoutEffect(() => {
    const queries = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    const [mqDesktop, mqFinePointer, mqReducedMotion] = queries;
    const update = () =>
      setPinned(mqDesktop.matches && mqFinePointer.matches && !mqReducedMotion.matches);
    update();
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);

  if (pinned) {
    // Pinned branch added in Task 5.
  }

  return (
    <>
      <AboutStory description={description} />
      <LeadershipVision vision={vision} mission={mission} />
    </>
  );
}
```

- [ ] **Step 2: Wire it into the homepage**

In `src/app/(public)/page.tsx`, replace the two imports:

```tsx
// REMOVE these two lines:
import AboutStory from '@/components/public/home/AboutStory';
import LeadershipVision from '@/components/public/home/LeadershipVision';

// ADD this line (with the other home imports):
import ScrollStory from '@/components/public/home/ScrollStory';
```

Then replace the two rendered sections:

```tsx
// REPLACE:
{/* --------------------------------------------------------------- About */}
<AboutStory description={setting.description} />

{/* ------------------------------------------------- Leadership & Vision */}
<LeadershipVision vision={setting.vision} mission={setting.mission} />

// WITH:
{/* -------------------------------- About + Leadership (pinned scroll-story) */}
<ScrollStory
  description={setting.description}
  vision={setting.vision}
  mission={setting.mission}
/>
```

- [ ] **Step 3: Verify lint + homepage parity**

Run: `npm run lint`
Expected: PASS. (The empty `if (pinned) {}` block is intentional scaffolding filled in Task 5; `vision`/`mission` are used in the fallback so there are no unused-vars errors.)

Load `/` on a desktop viewport and confirm the "Who We Are" and "Leadership & Vision" sections look and behave exactly as before (this branch still renders the originals).

- [ ] **Step 4: Commit**

```bash
git add src/components/public/home/ScrollStory.tsx "src/app/(public)/page.tsx"
git commit -m "feat(home): render About+Leadership via ScrollStory (static fallback)"
```

---

## Task 5: `PinnedStory` — the pinned scroll-scrubbed branch

Add the pinned experience and switch `ScrollStory` to use it when eligible. **Apply the whole task as one edit, then lint once** — do not lint between sub-steps (the new imports are unused until `PinnedStory` exists).

**Files:**
- Modify: `src/components/public/home/ScrollStory.tsx`

- [ ] **Step 1: Replace the file with the full pinned implementation**

Overwrite `src/components/public/home/ScrollStory.tsx` with:

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Quote } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import AboutStory from './AboutStory';
import LeadershipVision from './LeadershipVision';
import { STORY } from './storyContent';
import { usePinProgress } from './usePinProgress';
import { computeProgress, easeInOut, mapRange, segmentProgress } from './scrollStoryMath';

// useLayoutEffect on the client (decide mode / paint first frame before the
// browser paints, no flash); useEffect on the server to avoid the SSR warning.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ScrollStoryProps {
  description?: string | null;
  vision?: string | null;
  mission?: string | null;
}

/**
 * Merges "Who We Are" (AboutStory) and "Leadership & Vision" (LeadershipVision).
 * On capable desktops it upgrades to a pinned, scroll-scrubbed story; everywhere
 * else (mobile, < lg, touch-primary, reduced-motion, no-JS, crawlers) it renders
 * the two sections stacked exactly as before.
 */
export default function ScrollStory({ description, vision, mission }: ScrollStoryProps) {
  const [pinned, setPinned] = useState(false);

  useIsoLayoutEffect(() => {
    const queries = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    const [mqDesktop, mqFinePointer, mqReducedMotion] = queries;
    const update = () =>
      setPinned(mqDesktop.matches && mqFinePointer.matches && !mqReducedMotion.matches);
    update();
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);

  if (pinned) {
    return <PinnedStory description={description} vision={vision} mission={mission} />;
  }

  return (
    <>
      <AboutStory description={description} />
      <LeadershipVision vision={vision} mission={mission} />
    </>
  );
}

/** Render a "\n"-delimited heading string as line spans with <br/> breaks. */
function HeadingLines({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

function PinnedStory({ description, vision, mission }: ScrollStoryProps) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const bgTopRef = useRef<HTMLDivElement | null>(null);
  const frameARef = useRef<HTMLDivElement | null>(null);
  const frameBRef = useRef<HTMLDivElement | null>(null);
  const segsRef = useRef<{ a: HTMLElement[]; b: HTMLElement[] }>({ a: [], b: [] });

  // Apply the current progress (0..1) imperatively — no React re-render per frame.
  const apply = useCallback((p: number) => {
    // Image filmstrip: 200%-tall stack slides up by one photo (eased so it settles).
    if (stripRef.current) {
      stripRef.current.style.transform = `translate3d(0, ${(-easeInOut(p) * 50).toFixed(3)}%, 0)`;
    }
    // Background cross-fade: cream (base) → green (top layer) across the middle.
    if (bgTopRef.current) {
      bgTopRef.current.style.opacity = mapRange(p, 0.15, 0.85).toFixed(3);
    }
    const { a, b } = segsRef.current;
    // Frame A (Who We Are) blurs/fades OUT over [0, 0.5]. Reverse the stagger
    // index so the last element leaves first — the outgoing frame "unwrites".
    for (let i = 0; i < a.length; i++) {
      const s = segmentProgress(p, a.length - 1 - i, a.length, 0, 0.5);
      const el = a[i];
      el.style.filter = `blur(${(s * 10).toFixed(2)}px)`;
      el.style.opacity = (1 - s).toFixed(3);
      el.style.transform = `translate3d(0, ${(-28 * s).toFixed(2)}px, 0)`;
    }
    // Frame B (Leadership & Vision) blurs/fades IN over [0.45, 1], top-to-bottom.
    for (let i = 0; i < b.length; i++) {
      const s = segmentProgress(p, i, b.length, 0.45, 1);
      const el = b[i];
      el.style.filter = `blur(${((1 - s) * 10).toFixed(2)}px)`;
      el.style.opacity = s.toFixed(3);
      el.style.transform = `translate3d(0, ${(28 * (1 - s)).toFixed(2)}px, 0)`;
    }
    // Only the dominant frame is interactive / perceivable. `inert` removes the
    // other from tab order, the a11y tree, pointer events, and text selection —
    // fixing the "focusable CTA inside a hidden frame" problem in one move.
    const aDominant = p < 0.5;
    frameARef.current?.toggleAttribute('inert', !aDominant);
    frameBRef.current?.toggleAttribute('inert', aDominant);
  }, []);

  // Collect the animated segments once and paint the initial state before first
  // paint (no flash of the unstyled incoming frame; inert set before any focus).
  useIsoLayoutEffect(() => {
    segsRef.current = {
      a: Array.from(frameARef.current?.querySelectorAll<HTMLElement>('[data-blur]') ?? []),
      b: Array.from(frameBRef.current?.querySelectorAll<HTMLElement>('[data-blur]') ?? []),
    };
    const el = wrapperRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      apply(computeProgress(r.top, r.height, window.innerHeight));
    }
  }, [apply]);

  usePinProgress(wrapperRef, apply);

  return (
    <section ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 isolate flex h-[100svh] items-center overflow-hidden">
        {/* Background cross-fade layers (cream base, green on top fading in). */}
        <div className="absolute inset-0 bg-tsg-cream" aria-hidden="true" />
        <div
          ref={bgTopRef}
          className="absolute inset-0 bg-tsg-green"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {/* Image column (LEFT): fixed frame; filmstrip scrubs between photos. */}
          <div className="relative h-[68svh] max-h-[40rem] w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-tsg-deep/25">
            <div ref={stripRef} className="absolute inset-x-0 top-0 h-[200%] will-change-transform">
              <div className="relative h-1/2 w-full">
                <Image
                  src="/assets/img/tinubu2.jpg"
                  alt="President Bola Ahmed Tinubu"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="relative h-1/2 w-full">
                <Image
                  src="/assets/img/blog/presidentbola.jpg"
                  alt="President Bola Ahmed Tinubu"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Text column (RIGHT): two overlapping frames cross-fade. */}
          <div className="relative h-[68svh] max-h-[40rem]">
            {/* Frame A — Who We Are */}
            <div ref={frameARef} className="absolute inset-0 flex flex-col justify-center">
              <p data-blur className="eyebrow text-tsg-green">
                {STORY.about.eyebrow}
              </p>
              <h2
                data-blur
                className="font-onest mt-5 text-[clamp(2.25rem,4.5vw,4rem)] font-normal uppercase leading-[0.95] tracking-[-0.03em] text-tsg-deep"
              >
                <HeadingLines text={STORY.about.heading} />
              </h2>
              <p data-blur className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 line-clamp-4">
                {description || STORY.about.fallbackBody}
              </p>
              <ul data-blur className="mt-7 space-y-3">
                {STORY.about.beliefs.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-tsg-deep">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tsg-green/12 text-tsg-green">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="font-medium">{b}</span>
                  </li>
                ))}
              </ul>
              <div data-blur className="mt-9">
                <Link
                  href={STORY.about.cta.href}
                  className="group inline-flex items-center gap-2 rounded-full bg-tsg-green px-7 py-3.5 font-semibold text-white shadow-lg shadow-tsg-green/20 transition hover:bg-tsg-deep"
                >
                  {STORY.about.cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Frame B — Leadership & Vision */}
            <div ref={frameBRef} className="absolute inset-0 flex flex-col justify-center">
              <p data-blur className="eyebrow text-white/70">
                {STORY.leadership.eyebrow}
              </p>
              <h2
                data-blur
                className="font-onest mt-5 text-[clamp(2.75rem,5.5vw,5rem)] font-normal uppercase leading-[0.92] tracking-[-0.03em] text-white"
              >
                <HeadingLines text={STORY.leadership.heading} />
              </h2>
              <blockquote
                data-blur
                className="font-display mt-6 max-w-xl text-2xl font-light leading-snug text-white"
              >
                <Quote className="mb-2 h-8 w-8 text-white/40" aria-hidden="true" />
                {STORY.leadership.quote}
              </blockquote>
              <p data-blur className="mt-5 max-w-xl text-lg leading-relaxed text-white/80 line-clamp-3">
                {vision || STORY.leadership.fallbackBody}
              </p>
              {mission && (
                <p data-blur className="mt-3 max-w-xl text-base leading-relaxed text-white/70 line-clamp-2">
                  {mission}
                </p>
              )}
              <div data-blur className="mt-9">
                <Link
                  href={STORY.leadership.cta.href}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-tsg-green shadow-lg shadow-black/20 transition hover:bg-white/90"
                >
                  {STORY.leadership.cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: PASS. (Do not run `tsc`/`next build` with the dev server up.)

- [ ] **Step 3: Verify the math tests still pass**

Run: `npm test -- scrollStoryMath`
Expected: PASS (unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/components/public/home/ScrollStory.tsx
git commit -m "feat(home): add pinned scroll-scrubbed PinnedStory branch"
```

---

## Task 6: Verification, a11y & polish

No new code unless the checks below reveal a problem; this task is the manual verification pass and any small fixes it surfaces.

**Files (only if a check fails):**
- Modify: `src/components/public/home/ScrollStory.tsx`

- [ ] **Step 1: Automated checks**

Run: `npm test`
Expected: PASS (existing suites + `scrollStoryMath`).

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 2: Desktop pinned behaviour (browser, user's running dev server)**

On `/` at a desktop width (≥1024px, mouse/trackpad), scrolling through the section:
- The image holds position/size; its content slides smoothly from `tinubu2.jpg` to `presidentbola.jpg`.
- "Who We Are" blurs + fades out (last element first — it "unwrites"); "Leadership & Vision" blurs + fades in from below, top-to-bottom.
- The panel background transitions cream → green; text stays legible throughout (dark on cream, white on green).
- The section pins for ~one viewport of scroll, then releases into Impact/Programs.
- No flash of the incoming frame on load; refreshing mid-section resolves to the correct visual state.

Fix only if broken: if `position: sticky` does not hold, check for an ancestor with `overflow` other than `visible` between this section and `<body>` (the public layout / `ScrollLock` only set `overflow` while a lock is active, which does not overlap this section).

If the text blur cross-fade visibly janks on lower-end hardware, add `will-change` to the segment elements **imperatively** during active scroll (set in `apply`, clear after an idle debounce) — do **not** add a permanent `will-change` class to the text nodes.

- [ ] **Step 3: Density / clipping check**

At 1280×720 and 1440×900, confirm neither frame's content clips out of the `h-[68svh] max-h-[40rem]` text column. If clipping occurs, tighten via the existing `line-clamp-*` utilities on the body/vision/mission paragraphs (do not remove content) and/or lower the heading `clamp()` max.

- [ ] **Step 4: Fallback checks**

- Resize below 1024px (or use a mobile viewport): the section reflows to the stacked `AboutStory` + `LeadershipVision` layout (today's behaviour); no pinning, no scroll-jacking.
- Simulate a touch / coarse-pointer device at desktop width (DevTools device toolbar): the static fallback renders (eligibility requires `(pointer: fine)`).
- Toggle OS "reduce motion": the stacked fallback renders even at desktop width.
- Crossing the `lg` breakpoint or toggling reduce-motion live swaps modes without console errors (listeners are cleaned up). Note for the keyboard check below: a live mode-swap unmounts the pinned tree, so focus inside it would fall to `<body>` — acceptable as a rare edge; flag if it feels jarring.

- [ ] **Step 5: Accessibility checks**

- **Tab order:** Tab through the section at rest (p≈0) — only Frame A's CTA (`Read our story`) is reachable; scroll to p≈1 and confirm only Frame B's CTA (`About the President`) is reachable. The inactive frame must carry the `inert` attribute (verify in DevTools at p≈0 and p≈1).
- **Heading navigation:** Using a screen reader's headings rotor (or a headings-list extension), confirm exactly **one** `<h2>` is exposed at p≈0 and one at p≈1 (the inert frame's `<h2>` must not appear).
- **Selection:** Click-drag to select text over the panel — only the visible/dominant frame's copy should be selectable (the inert frame blocks selection).
- **Images / decorative layers:** both images have meaningful `alt`; background layers and the `Quote` icon are `aria-hidden`.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(home): scroll-story density/a11y polish from verification pass"
```

(If no fixes were needed, skip the commit and note that verification passed.)

---

## Changes from the adversarial review (wf_60694d23-229)

- **single source of truth (arch, major):** added `storyContent.ts`; refactored `AboutStory`/`LeadershipVision` to consume it; `PinnedStory` uses it too — no copy duplication (Task 1).
- **a11y blocker:** inactive frame uses **`inert`** (React 19 / `toggleAttribute`) instead of bare `aria-hidden`, removing the focusable-CTA-in-hidden-frame violation and simultaneously fixing the duplicate-`<h2>` outline, pointer-events, and text-selection issues (Task 5 `apply`).
- **correctness:** outgoing Frame A now staggers in reverse to "unwrite" (`a.length - 1 - i`); `usePinProgress` uses `useLenis(callback)` (no manual `.on/.off` gap), drops the dead `enabled` param, and drops the redundant window-resize listener (Tasks 3, 5).
- **eligibility:** added `(pointer: fine)` so large touchscreens stay on the static layout (Task 4/5).
- **will-change:** removed the interpolated `WILL_CHANGE` class (Tailwind-scanner risk + permanent compositor promotion of ~14 nodes); kept only built-in `will-change-transform` on the moving image strip; jank mitigation is now an imperative, idle-cleared fallback documented in Task 6.
- **tooling:** fixed `vitest.config.ts` glob casing so unit tests run on case-sensitive CI (Task 2).
- **step ordering:** Task 5 is applied as one atomic edit so lint never runs against unused imports.

## Self-review (against the spec)

**Spec coverage:** scrubbed transition (Task 5 `apply`) ✓; GSAP-free blur reproduction via `segmentProgress` ✓; two frames tinubu2→presidentbola ✓; mobile/reduced-motion/touch stacked fallback (Task 4) ✓; image on left ✓; custom Lenis-progress scrubber, no ScrollTrigger/motion (Task 3) ✓; progress in refs, applied imperatively ✓; background + theme cross-fade ✓; SSR-safe first paint + upgrade on mount ✓; perf (transform/opacity/filter, both images mounted) ✓; **single source of truth (§4) now honored** via `storyContent.ts` ✓; pure-function unit tests (§11) ✓; a11y intent (§8) satisfied via `inert` ✓.

**Placeholder scan:** none — every step has complete code/commands.

**Type consistency:** `apply: (p: number) => void` matches `usePinProgress(onProgress)`; `usePinProgress(ref, onProgress)` (no `enabled`) matches its single call site; `computeProgress(rectTop, height, viewportHeight)`, `segmentProgress(p, index, count, windowStart, windowEnd, spread?)`, and `mapRange(p, inStart, inEnd)` call sites all match their signatures; refs typed `RefObject<HTMLElement | null>` match the hook parameter; `STORY` shape matches all three consumers.
