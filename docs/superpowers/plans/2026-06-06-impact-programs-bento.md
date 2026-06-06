# Impact Programs Bento + 3D Parallax Cards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Impact Programs section with an Aceternity-style asymmetric bento grid of 3D mouse-tilt parallax cards on a dark cinematic background.

**Architecture:** Mirror the existing `LocationMap` → `LocationStage` server/client split. `ImpactPrograms.tsx` stays a Server Component (dark shell + heading) and mounts a new `'use client'` island `ProgramsBento.tsx` that imports `PROGRAMS` directly, renders the bento grid + tilt cards + CTA tile, runs a GSAP scroll-in stagger, and applies a per-card 3D tilt. The tilt rotation math is extracted into a pure, DOM-free helper `tiltMath.ts` and unit-tested in the node environment — same pattern as `scrollStoryMath.ts`.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, Tailwind 3.4, GSAP 3.15, lucide-react, vitest. **No new dependencies** (no framer-motion). 3D transforms via inline `style` / Tailwind arbitrary properties (Tailwind 3.4 has no `perspective`/`translate-z` utilities).

---

## ⚠️ Environment guardrails (read before running anything)

The user runs their **own** `next dev` server. Per project memory:
- **Never** start a second dev server (`next dev`) — two servers corrupt `.next`.
- **Never** run `tsc --noEmit` or `next build` while the dev server is up — it OOMs and can crash their dev server.

Therefore verification is: **(a)** `npm test` (vitest, node env — safe & light) for the pure math, and **(b)** visual confirmation against the user's already-running dev server (screenshot via the Playwright/Chrome DevTools MCP at `http://localhost:3000`, or just ask the user to look). `npm run lint` (eslint only, no webpack/tsc) is acceptable but optional; if it feels heavy, rely on the dev server's error overlay instead.

All commits use **explicit `git add <paths>`** — never `git add -A` — because the user has unrelated work in progress (`page.tsx`, `Footer.tsx`).

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `src/components/public/home/tiltMath.ts` | Pure, DOM-free tilt rotation math | Create |
| `tests/Unit/tiltMath.test.ts` | Unit tests for the tilt math | Create |
| `src/components/public/home/ProgramsBento.tsx` | `'use client'` bento grid: tilt cards + CTA tile + GSAP scroll-in | Create |
| `src/components/public/home/ImpactPrograms.tsx` | Server shell: dark section + glow + heading, mounts `ProgramsBento` | Replace |

`src/components/public/home/homeContent.ts` is **unchanged** (`PROGRAMS` and `Program` are reused as-is).

---

## Task 1: Pure tilt math helper + unit tests

**Files:**
- Create: `src/components/public/home/tiltMath.ts`
- Test: `tests/Unit/tiltMath.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/Unit/tiltMath.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeTilt } from '../../src/components/public/home/tiltMath';

describe('computeTilt', () => {
  const W = 300;
  const H = 200;

  it('is flat at the centre', () => {
    expect(computeTilt(W, H, W / 2, H / 2)).toEqual({ rotateX: 0, rotateY: 0 });
  });

  it('tilts toward the cursor horizontally', () => {
    expect(computeTilt(W, H, W, H / 2).rotateY).toBeCloseTo(10, 5); // right edge
    expect(computeTilt(W, H, 0, H / 2).rotateY).toBeCloseTo(-10, 5); // left edge
  });

  it('tilts the top back as the cursor rises', () => {
    expect(computeTilt(W, H, W / 2, 0).rotateX).toBeCloseTo(10, 5); // top edge
    expect(computeTilt(W, H, W / 2, H).rotateX).toBeCloseTo(-10, 5); // bottom edge
  });

  it('clamps when the pointer is past an edge', () => {
    const t = computeTilt(W, H, W * 2, -H, 10);
    expect(t.rotateY).toBe(10);
    expect(t.rotateX).toBe(10);
  });

  it('respects a custom maxDeg', () => {
    expect(computeTilt(W, H, W, H / 2, 6).rotateY).toBeCloseTo(6, 5);
  });

  it('returns flat for zero-size cards', () => {
    expect(computeTilt(0, 0, 10, 10)).toEqual({ rotateX: 0, rotateY: 0 });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tiltMath`
Expected: FAIL — `Failed to resolve import ".../tiltMath"` (file not created yet).

- [ ] **Step 3: Write the implementation**

Create `src/components/public/home/tiltMath.ts`:

```ts
// Pure, DOM-free math for the Impact Programs 3D tilt cards. Kept separate from
// the React island so it can be unit-tested in the node test environment, the
// same way scrollStoryMath.ts is.
import { clamp } from './scrollStoryMath';

export interface Tilt {
  /** Degrees to feed `rotateX` (tilt about the horizontal axis). */
  rotateX: number;
  /** Degrees to feed `rotateY` (tilt about the vertical axis). */
  rotateY: number;
}

/**
 * 3D tilt for a card from the pointer position over it. Pointer at the centre
 * returns {0, 0}; moving toward an edge tilts the card toward the cursor (right
 * → +rotateY, up → +rotateX). Output magnitude is clamped to ±maxDeg so pointer
 * coords past an edge stay safe.
 *
 * @param width   card width in px
 * @param height  card height in px
 * @param offsetX pointer X relative to the card's left edge (px)
 * @param offsetY pointer Y relative to the card's top edge (px)
 * @param maxDeg  maximum tilt magnitude in degrees (default 10)
 */
export function computeTilt(
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
  maxDeg = 10,
): Tilt {
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0 };
  const nx = (offsetX / width) * 2 - 1; // -1 (left) .. 1 (right)
  const ny = (offsetY / height) * 2 - 1; // -1 (top) .. 1 (bottom)
  return {
    rotateX: clamp(-ny * maxDeg, -maxDeg, maxDeg),
    rotateY: clamp(nx * maxDeg, -maxDeg, maxDeg),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tiltMath`
Expected: PASS — 6 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/public/home/tiltMath.ts tests/Unit/tiltMath.test.ts
git commit -m "feat(home): pure tilt math helper for program cards"
```

---

## Task 2: ProgramsBento island + dark section shell (static, then mounted)

This task makes the redesigned section render end-to-end (layout, theme, images, CTA) **without** the tilt or scroll-in motion yet — so the layout can be verified on its own. Motion is layered on in Tasks 3 and 4.

**Files:**
- Create: `src/components/public/home/ProgramsBento.tsx`
- Replace: `src/components/public/home/ImpactPrograms.tsx`

- [ ] **Step 1: Create the bento island (static)**

Create `src/components/public/home/ProgramsBento.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { gsap } from 'gsap';
import { PROGRAMS, type Program } from './homeContent';
import { computeTilt } from './tiltMath';

// Bento spans. The lg 4-col / 2-row grid is filled exactly by the big hero
// (2x2) + the wide tile (2x1) + one small tile (1x1), with the CTA in the last
// cell. Indices line up with PROGRAMS order.
const SPANS = [
  'sm:col-span-2 lg:col-span-2 lg:row-span-2', // 0 Youth — big hero
  'lg:col-span-2', // 1 Economic — wide
  '', // 2 Inclusive — small
];

export default function ProgramsBento() {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={gridRef}
      className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(240px,1fr)]"
    >
      {PROGRAMS.map((p, i) => (
        <TiltCard key={p.title} program={p} className={SPANS[i]} index={i} />
      ))}
      <CtaTile />
    </div>
  );
}

interface TiltCardProps {
  program: Program;
  className: string;
  index: number;
}

function TiltCard({ program, className, index }: TiltCardProps) {
  const outerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isHero = index === 0;
  const Icon = program.icon;

  return (
    <article
      ref={outerRef}
      className={`group relative min-h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/30 backdrop-blur transition-colors duration-300 hover:border-emerald-400/40 [perspective:1000px] ${className}`}
    >
      <div ref={innerRef} className="relative h-full [transform-style:preserve-3d]">
        {/* Base image plane (stays at Z=0 → reads as receding behind the copy) */}
        <Image
          src={program.image}
          alt=""
          fill
          sizes={
            isHero
              ? '(max-width: 1024px) 100vw, 50vw'
              : '(max-width: 1024px) 100vw, 25vw'
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070809] via-[#070809]/40 to-transparent" />

        {/* Icon chip — pops forward */}
        <span className="absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 text-tsg-green shadow-lg [transform:translateZ(60px)]">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>

        {/* Copy — mid depth */}
        <div className="absolute inset-x-0 bottom-0 p-6 [transform:translateZ(40px)]">
          <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
            {program.title}
          </h3>
          <p className={`mt-2 text-sm text-white/75 ${isHero ? '' : 'line-clamp-2'}`}>
            {program.body}
          </p>
        </div>
      </div>
    </article>
  );
}

function CtaTile() {
  return (
    <Link
      href="/register"
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-tsg-green to-tsg-deep p-6 shadow-xl shadow-emerald-900/30 transition-colors duration-300 hover:border-emerald-300/60 sm:col-span-2 lg:col-span-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
      />
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
        <Users className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
          Add your voice to the movement
        </h3>
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
          Become a member
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}
```

> Note: `useEffect`, `gsap`, and `computeTilt` are imported now but wired up in Tasks 3–4. If your linter flags them as unused between tasks, that resolves once Tasks 3 and 4 land; do not delete them.

- [ ] **Step 2: Replace the section shell**

Replace the entire contents of `src/components/public/home/ImpactPrograms.tsx` with:

```tsx
import Reveal from './Reveal';
import ProgramsBento from './ProgramsBento';

export default function ImpactPrograms() {
  return (
    <section className="relative isolate overflow-hidden bg-[#070809]">
      {/* Cinematic glow backdrop (matches the CTA banner's blurred blobs) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 -z-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-24 -z-10 h-96 w-96 rounded-full bg-tsg-green/20 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-emerald-400">What We Stand For</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-white md:text-5xl">
            Programs driving the Renewed Hope agenda
          </h2>
          <p className="mt-5 text-lg text-white/70">
            Three commitments guide everything we do as we mobilise Nigerians behind a shared vision
            for the nation.
          </p>
        </Reveal>

        <ProgramsBento />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify it renders (visual, against the running dev server)**

Do **not** start a server or run a build. Using the user's running dev server at `http://localhost:3000`, view the Impact Programs section (screenshot via the Playwright/Chrome DevTools MCP, or ask the user). Confirm:
- Dark `#070809` background with two soft green glow blobs.
- Eyebrow "What We Stand For" in emerald, white heading + grey subhead.
- Bento layout on desktop: big **Youth** hero (left, tall), wide **Economic Growth** (top-right), small **Inclusive Governance** (bottom-middle), emerald **CTA** tile (bottom-right).
- Each program tile shows its image, dark bottom gradient, white icon chip top-left, title + body.
- Resizing narrow: collapses to 2 columns (`sm`) then a single stacked column (mobile) with no empty grid gaps.

- [ ] **Step 4: Commit**

```bash
git add src/components/public/home/ProgramsBento.tsx src/components/public/home/ImpactPrograms.tsx
git commit -m "feat(home): dark bento layout for Impact Programs section"
```

---

## Task 3: 3D mouse-tilt + layered depth

Wire the pointer-driven tilt into `TiltCard`. Tilt is gated to fine-pointer devices and disabled under `prefers-reduced-motion`; the icon chip and copy already carry `translateZ`, so they parallax as the card rotates.

**Files:**
- Modify: `src/components/public/home/ProgramsBento.tsx` (the `TiltCard` component)

- [ ] **Step 1: Add the tilt effect to `TiltCard`**

In `src/components/public/home/ProgramsBento.tsx`, replace the `TiltCard` function (from Task 2) with this version — it adds a `useEffect` that attaches rAF-throttled pointer handlers and sets `transform` on the inner wrapper:

```tsx
function TiltCard({ program, className, index }: TiltCardProps) {
  const outerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isHero = index === 0;
  const Icon = program.icon;

  // Pointer-driven 3D tilt. Fine-pointer devices only; disabled under reduced
  // motion. Resets flat on leave. rAF-throttled, transform-only (GPU).
  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    let raf = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      raf = 0;
      const { rotateX, rotateY } = computeTilt(outer.offsetWidth, outer.offsetHeight, px, py);
      inner.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    };
    const onEnter = () => {
      inner.style.willChange = 'transform';
      inner.style.transition = 'transform 120ms ease-out';
    };
    const onMove = (e: PointerEvent) => {
      const r = outer.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      inner.style.transition = 'transform 400ms ease-out';
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
      inner.style.willChange = 'auto';
    };

    outer.addEventListener('pointerenter', onEnter);
    outer.addEventListener('pointermove', onMove);
    outer.addEventListener('pointerleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      outer.removeEventListener('pointerenter', onEnter);
      outer.removeEventListener('pointermove', onMove);
      outer.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <article
      ref={outerRef}
      className={`group relative min-h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/30 backdrop-blur transition-colors duration-300 hover:border-emerald-400/40 [perspective:1000px] ${className}`}
    >
      <div ref={innerRef} className="relative h-full [transform-style:preserve-3d]">
        <Image
          src={program.image}
          alt=""
          fill
          sizes={
            isHero
              ? '(max-width: 1024px) 100vw, 50vw'
              : '(max-width: 1024px) 100vw, 25vw'
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070809] via-[#070809]/40 to-transparent" />

        <span className="absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 text-tsg-green shadow-lg [transform:translateZ(60px)]">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-6 [transform:translateZ(40px)]">
          <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
            {program.title}
          </h3>
          <p className={`mt-2 text-sm text-white/75 ${isHero ? '' : 'line-clamp-2'}`}>
            {program.body}
          </p>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify the tilt (visual, against the running dev server)**

On the running dev server, move the mouse across a program card. Confirm:
- The card tilts toward the cursor (smooth, ≤10°) and the icon chip + title visibly sit "in front of" the image as it rotates (parallax depth).
- Moving the mouse off the card eases it back flat.
- With the OS "reduce motion" setting on (or a touch device / DevTools touch emulation), there is **no** tilt — the card is static aside from the existing hover border/scale.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/home/ProgramsBento.tsx
git commit -m "feat(home): 3D mouse-tilt with layered depth on program cards"
```

---

## Task 4: GSAP scroll-in stagger

Add the entrance animation: tiles fade/slide/scale up in sequence when the grid scrolls into view. Honours reduced motion (settle visible) and plays once — same trigger pattern as `LocationStage`.

**Files:**
- Modify: `src/components/public/home/ProgramsBento.tsx` (the `ProgramsBento` component)

- [ ] **Step 1: Add the scroll-in effect**

In `src/components/public/home/ProgramsBento.tsx`, replace the `ProgramsBento` function (from Task 2) with this version — it adds a `useEffect` that staggers the grid's direct children in on first intersection:

```tsx
export default function ProgramsBento() {
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll-in stagger of the bento tiles. Honours reduced motion (settle
  // visible). Plays once when the grid first enters the viewport. The entrance
  // transform (y/scale) lives on the outer tiles; per-card tilt lives on each
  // tile's inner wrapper, so the two never fight.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const tiles = gsap.utils.toArray<HTMLElement>(grid.children);
    if (!tiles.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(tiles, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(tiles, { autoAlpha: 0, y: 24, scale: 0.96 });
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          gsap.to(tiles, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.12,
          });
        },
        { threshold: 0.2 },
      );
      io.observe(grid);
      return () => io.disconnect();
    }, grid);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={gridRef}
      className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(240px,1fr)]"
    >
      {PROGRAMS.map((p, i) => (
        <TiltCard key={p.title} program={p} className={SPANS[i]} index={i} />
      ))}
      <CtaTile />
    </div>
  );
}
```

- [ ] **Step 2: Verify the entrance (visual, against the running dev server)**

Reload the homepage and scroll down to the section. Confirm:
- As the grid enters view, the four tiles fade + rise + scale in one after another (~0.12s apart), then settle.
- Scrolling away and back does **not** replay it (plays once).
- With "reduce motion" on, the tiles are simply visible immediately (no entrance, no tilt).
- After entrance, mouse-tilt from Task 3 still works (the two transforms don't conflict).

- [ ] **Step 3: Commit**

```bash
git add src/components/public/home/ProgramsBento.tsx
git commit -m "feat(home): GSAP scroll-in stagger for Impact Programs bento"
```

---

## Task 5: Final pass

**Files:** none (verification only)

- [ ] **Step 1: Re-run the unit tests**

Run: `npm test -- tiltMath`
Expected: PASS — 6 passing.

- [ ] **Step 2: Optional lint (eslint only — safe; no tsc/build)**

Run: `npm run lint`
Expected: no errors for `ProgramsBento.tsx`, `ImpactPrograms.tsx`, `tiltMath.ts`. If lint is unavailable or feels heavy, skip and rely on the dev server's error overlay being clean.

- [ ] **Step 3: Final visual sweep**

On the running dev server, confirm the whole section reads well end-to-end: dark theme, bento layout at all three breakpoints, image legibility, 3D tilt, scroll-in entrance, and the CTA tile linking to `/register`. Confirm the sections above and below it are visually undisturbed.

---

## Self-review notes (author check — already applied)

- **Spec coverage:** dark cinematic shell + glow (Task 2); asymmetric 2×2-with-CTA bento spans (Task 2 `SPANS` + CtaTile); 3D mouse-tilt + layered `translateZ` depth (Task 3); GSAP scroll-in (Task 4); reduced-motion + touch gating (Tasks 3–4); server/client split + importing `PROGRAMS` inside the island (Task 2); pure tilt math + unit test mirroring `scrollStoryMath` (Task 1); `next/image` with per-span `sizes`, decorative `alt=""`, CTA as a real `Link`, no new deps / no Tailwind-config change (all tasks). All spec sections map to a task.
- **Type consistency:** `computeTilt(width, height, offsetX, offsetY, maxDeg?) → { rotateX, rotateY }` is identical in `tiltMath.ts`, its test, and the `TiltCard` call site. `Program` / `PROGRAMS` imported from `homeContent.ts` unchanged. `SPANS` has 3 entries for 3 `PROGRAMS`; the CTA is rendered separately.
- **Placeholder scan:** every code step contains complete code; no TBD/TODO.
```
