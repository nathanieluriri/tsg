# Homepage Sections & Interactive Location Map — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. When building UI, also consult the `frontend-design` skill.

**Goal:** Add five new full-viewport homepage sections (About, Leadership & Vision, Impact/Programs, Our Journey, Voices) plus a spectacular interactive "Africa → Nigeria" Location section, all matching the existing TSG design system.

**Architecture:** Each section is its own component under `src/components/public/home/`. Presentational sections are React Server Components using the existing `Reveal` scroll-in helper. Interactive sections (`Voices`, `LocationMap`) are `'use client'` and use GSAP (already a dependency). Placeholder content lives in a single labelled constants module. `page.tsx` composes the sections in a fixed order and removes the old standalone Pillars block (folded into Impact).

**Tech Stack:** Next.js 15 App Router (React 19), TypeScript, Tailwind 3, GSAP 3.15, lucide-react, `next/image`. Spec: [docs/superpowers/specs/2026-06-02-homepage-sections-and-location-map-design.md](../specs/2026-06-02-homepage-sections-and-location-map-design.md)

---

## Conventions for every task

**Verification gates (run after each task):**
- `npm run typecheck` → expect: no errors.
- `npm run lint` → expect: no new errors/warnings for the files you touched.
- **Visual check:** the user runs their own `next dev` server. **DO NOT run `next dev` or `next build`** — both write `.next` and will corrupt the user's running server (see memory: single-dev-server-windows). Ask the user to glance at `http://localhost:3000` instead, or describe what to look for.

**Design tokens (reuse, do not reinvent):**
- Colors: `bg-tsg-cream`, `bg-tsg-deep`, `bg-tsg-green`, `text-tsg-deep`, `text-tsg-green`, `text-white`.
- Headings: `className="font-display ..."` (serif). Eyebrow label: `<p className="eyebrow text-tsg-green">…</p>` (use `text-white/75` on dark bgs).
- Section wrapper for full-viewport: `className="relative isolate flex min-h-[100svh] items-center bg-… "` with inner `<div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">`.
- Entrance animation: wrap blocks in `<Reveal>` / `<Reveal delay={n}>` (import from `@/components/public/home/Reveal`).
- Decorative blurred orbs (reuse CTA motif): `<div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-tsg-green/10 blur-3xl" />`.

**Commit convention:** `feat(home): <what>` on the current `master` branch (matches repo history). Commit only the files listed in the task — never `git add -A` (the working tree has unrelated pre-existing changes).

---

## File structure

**Create:**
- `src/components/public/home/homeContent.ts` — placeholder content constants + types (PROGRAMS, MILESTONES, TESTIMONIALS, ABOUT_STATS).
- `src/components/public/home/AboutStory.tsx` — section 3 (server).
- `src/components/public/home/LeadershipVision.tsx` — section 4 (server).
- `src/components/public/home/ImpactPrograms.tsx` — section 5 (server, absorbs Pillars).
- `src/components/public/home/JourneyTimeline.tsx` — section 6 (server + Reveal).
- `src/components/public/home/Voices.tsx` — section 7 (`'use client'`).
- `src/components/public/home/mapPaths.ts` — Africa + Nigeria SVG geometry + Abuja point.
- `src/components/public/home/LocationMap.tsx` — section 9 (`'use client'`).

**Modify:**
- `src/app/(public)/page.tsx` — import & render new sections, remove standalone Pillars block, pass Setting fields to `LocationMap`.
- `src/app/globals.css` — timeline line, map pin pulse, office card, map helpers.

---

## Task 1: Placeholder content constants

**Files:**
- Create: `src/components/public/home/homeContent.ts`

- [ ] **Step 1: Write the content module**

```ts
// PLACEHOLDER CONTENT — replace with verified TSG content before launch.
// Mirrors the inline STATS/PILLARS pattern in src/app/(public)/page.tsx so it
// is easy for an editor to find and update. No external data source this round.
import type { LucideIcon } from 'lucide-react';
import { GraduationCap, LineChart, Landmark } from 'lucide-react';

export interface Program {
  icon: LucideIcon;
  title: string;
  body: string;
  image: string; // path under /public
}

export interface Milestone {
  year: string;
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

/** Section 5 — Impact / Programs. Seeded from the former PILLARS copy. */
export const PROGRAMS: Program[] = [
  {
    icon: GraduationCap,
    title: 'Youth Empowerment',
    body: 'Investing in education, skills and innovation so every young Nigerian can build a future at home.',
    image: '/assets/img/masonry-portfolio/masonry-portfolio-1.jpg',
  },
  {
    icon: LineChart,
    title: 'Economic Growth',
    body: 'Backing sustainable policies and enterprise that create jobs and lift families across the nation.',
    image: '/assets/img/masonry-portfolio/masonry-portfolio-4.jpg',
  },
  {
    icon: Landmark,
    title: 'Inclusive Governance',
    body: 'Championing transparency, accountability and citizen participation at every level of leadership.',
    image: '/assets/img/masonry-portfolio/masonry-portfolio-7.jpg',
  },
];

/** Section 6 — Our Journey timeline. PLACEHOLDER dates/copy — verify before launch. */
export const MILESTONES: Milestone[] = [
  { year: '2019', title: 'The movement begins', body: 'Supporters across Nigeria come together around a shared vision of renewed hope.' },
  { year: '2021', title: 'Grassroots mobilisation', body: 'Coordination expands into communities across the six geopolitical zones.' },
  { year: '2023', title: 'A nationwide network', body: 'Active membership grows across all 36 states and the Federal Capital Territory.' },
  { year: '2024', title: 'Programs take root', body: 'Youth, economic and governance initiatives move from advocacy into action.' },
  { year: 'Today', title: 'Stronger together', body: 'A united community advancing the Renewed Hope agenda, one citizen at a time.' },
];

/** Section 7 — Voices / Testimonials. PLACEHOLDER quotes — replace with real, consented quotes. */
export const TESTIMONIALS: Testimonial[] = [
  { quote: 'Being part of this movement gave me a way to serve my community and believe in my country again.', name: 'Aisha B.', role: 'Volunteer Coordinator', location: 'Kano' },
  { quote: 'We are not waiting for change — we are organising for it, street by street.', name: 'Emeka O.', role: 'Group Leader', location: 'Enugu' },
  { quote: 'The focus on young people is real. I found mentorship, skills and a network that opened doors.', name: 'Tunde A.', role: 'Member', location: 'Lagos' },
  { quote: 'From the FCT to the riverside communities, the message of renewed hope is the same.', name: 'Grace I.', role: 'Regional Volunteer', location: 'Bayelsa' },
];

/** Section 3 — About mini-stats. */
export const ABOUT_STATS: AboutStat[] = [
  { value: '36', label: 'States & FCT' },
  { value: '774', label: 'Local Governments' },
  { value: '2019', label: 'Mobilising since' },
];
```

- [ ] **Step 2: Verify** — `npm run typecheck` → no errors.
- [ ] **Step 3: Commit**

```bash
git add src/components/public/home/homeContent.ts
git commit -m "feat(home): add placeholder content constants for new sections"
```

---

## Task 2: AboutStory section (3)

**Files:**
- Create: `src/components/public/home/AboutStory.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { ABOUT_STATS } from './homeContent';

interface AboutStoryProps {
  description?: string | null;
}

export default function AboutStory({ description }: AboutStoryProps) {
  return (
    <section id="about" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-tsg-cream">
      <div className="absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-tsg-green/10 blur-3xl" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow text-tsg-green">Who We Are</p>
          <h2 className="font-display mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-tsg-deep md:text-5xl lg:text-6xl">
            A movement built on <span className="italic font-light text-tsg-green">renewed hope</span>.
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600">
            The Tinubu Support Group is a nationwide community of individuals and groups who believe in the
            vision and leadership of President Bola Ahmed Tinubu — working to advance policies, initiatives and
            developmental programs that align with the Renewed Hope agenda for a better Nigeria.
          </p>
          {description ? (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-600">{description}</p>
          ) : (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
              Through events, advocacy and grassroots mobilisation, we promote unity, good governance and active
              citizen participation in nation-building.
            </p>
          )}

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {ABOUT_STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-semibold text-tsg-green md:text-4xl">{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">{s.label}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/about"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-tsg-green px-7 py-3.5 font-semibold text-white shadow-lg shadow-tsg-green/20 transition hover:bg-tsg-deep"
          >
            Read our story
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={120} className="order-1 lg:order-2">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -right-4 -top-4 h-full w-full rounded-3xl border border-tsg-green/20" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-tsg-deep/20">
              <Image
                src="/assets/img/about-portrait.jpg"
                alt="President Bola Ahmed Tinubu"
                width={720}
                height={860}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tsg-deep/80 to-transparent p-6">
                <p className="font-display text-lg text-white">President Bola Ahmed Tinubu</p>
                <p className="text-sm text-white/70">Commander-in-Chief, Federal Republic of Nigeria</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — `npm run typecheck` && `npm run lint` → clean. Confirm `public/assets/img/about-portrait.jpg` exists (it does).
- [ ] **Step 3: Commit**

```bash
git add src/components/public/home/AboutStory.tsx
git commit -m "feat(home): add full-viewport About story section"
```

---

## Task 3: LeadershipVision section (4)

**Files:**
- Create: `src/components/public/home/LeadershipVision.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import Reveal from './Reveal';

interface LeadershipVisionProps {
  vision?: string | null;
  mission?: string | null;
}

export default function LeadershipVision({ vision, mission }: LeadershipVisionProps) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-tsg-deep text-white">
      <div className="hero-grain absolute inset-0 -z-10" aria-hidden="true" />
      <div className="absolute -right-32 -top-24 -z-10 h-96 w-96 rounded-full bg-tsg-green/30 blur-3xl" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-sm lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-black/40">
              <Image
                src="/assets/img/blog/presidentbola.jpg"
                alt="President Bola Ahmed Tinubu"
                width={640}
                height={760}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 80vw, 40vw"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="eyebrow text-white/70">Leadership &amp; Vision</p>
          <Quote className="mt-6 h-10 w-10 text-tsg-green/70" aria-hidden="true" />
          <blockquote className="font-display mt-4 text-3xl font-light leading-snug tracking-tight md:text-4xl lg:text-5xl">
            “Renewed Hope is more than a slogan — it is a commitment to a Nigeria where every citizen can
            dream, build and belong.”
          </blockquote>
          <div className="mt-6 h-px w-16 bg-white/30" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/80">
            {vision ||
              'We stand with President Tinubu to turn the Renewed Hope agenda into real progress — championing reform, opportunity and unity in every community.'}
          </p>
          {mission && <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">{mission}</p>}
          <Link
            href="/pbat"
            className="group mt-10 inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            About the President
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — `npm run typecheck` && `npm run lint`. Confirm `public/assets/img/blog/presidentbola.jpg` exists (it does).
- [ ] **Step 3: Commit**

```bash
git add src/components/public/home/LeadershipVision.tsx
git commit -m "feat(home): add Leadership & Vision section"
```

---

## Task 4: ImpactPrograms section (5) + remove old Pillars

**Files:**
- Create: `src/components/public/home/ImpactPrograms.tsx`
- (Pillars removed from `page.tsx` in Task 8.)

- [ ] **Step 1: Write the component**

```tsx
import Image from 'next/image';
import Reveal from './Reveal';
import { PROGRAMS } from './homeContent';

export default function ImpactPrograms() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-tsg-green">What We Stand For</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-5xl">
            Programs driving the Renewed Hope agenda
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Three commitments guide everything we do as we mobilise Nigerians behind a shared vision for
            the nation.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 110}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tsg-deep/70 via-tsg-deep/10 to-transparent" />
                  <span className="absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 text-tsg-green shadow-lg">
                    <p.icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                </div>
                <div className="p-7">
                  <h3 className="font-display text-xl font-semibold text-tsg-deep">{p.title}</h3>
                  <p className="mt-3 text-gray-600">{p.body}</p>
                </div>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-tsg-green transition-transform duration-300 group-hover:scale-x-100" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — `npm run typecheck` && `npm run lint`.
- [ ] **Step 3: Commit**

```bash
git add src/components/public/home/ImpactPrograms.tsx
git commit -m "feat(home): add Impact/Programs section (absorbs Pillars)"
```

---

## Task 5: JourneyTimeline section (6) + timeline CSS

**Files:**
- Create: `src/components/public/home/JourneyTimeline.tsx`
- Modify: `src/app/globals.css` (append timeline styles)

- [ ] **Step 1: Append timeline styles to `globals.css`** (add at end of file)

```css
/* ── Journey timeline ───────────────────────────────────────────────────── */
.timeline {
  position: relative;
}
/* The central (mobile: left) spine. */
.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 1.25rem;
  width: 2px;
  background: linear-gradient(to bottom, transparent, rgba(10, 77, 46, 0.35), transparent);
}
@media (min-width: 768px) {
  .timeline::before { left: 50%; transform: translateX(-50%); }
}
.timeline-node {
  position: absolute;
  left: 1.25rem;
  top: 0.4rem;
  width: 14px;
  height: 14px;
  margin-left: -6px;
  border-radius: 999px;
  background: var(--tsg-green);
  box-shadow: 0 0 0 4px rgba(10, 77, 46, 0.15);
}
@media (min-width: 768px) {
  .timeline-node { left: 50%; transform: translateX(-50%); }
}
```

- [ ] **Step 2: Write the component**

```tsx
import Reveal from './Reveal';
import { MILESTONES } from './homeContent';

export default function JourneyTimeline() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center bg-tsg-cream">
      <div className="mx-auto w-full max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="eyebrow justify-center text-tsg-green">Our Journey</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-5xl">
            From a shared belief to a national movement
          </h2>
        </Reveal>

        <div className="timeline mt-16 space-y-12 md:space-y-0">
          {MILESTONES.map((m, i) => (
            <Reveal key={m.year} delay={i * 90}>
              <div
                className={`relative pl-12 md:flex md:w-1/2 md:pl-0 ${
                  i % 2 === 0
                    ? 'md:ml-auto md:pl-12 md:text-left'
                    : 'md:mr-auto md:pr-12 md:text-right'
                } md:py-8`}
              >
                <span className="timeline-node" aria-hidden="true" />
                <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                  <span className="font-display text-2xl font-semibold text-tsg-green">{m.year}</span>
                  <h3 className="font-display mt-2 text-lg font-semibold text-tsg-deep">{m.title}</h3>
                  <p className="mt-2 text-gray-600">{m.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

> Note: the `timeline-node` is positioned relative to the nearest positioned ancestor; the per-item `relative` wrapper anchors it on mobile (left spine). On `md+` the node centers on the shared spine. If alternating offset needs fine-tuning during the visual check, adjust the `md:w-1/2` / `md:ml-auto` row above — keep the spine and node selectors as-is.

- [ ] **Step 3: Verify** — `npm run typecheck` && `npm run lint`. Visual: spine + nodes align, cards alternate on desktop, single column on mobile.
- [ ] **Step 4: Commit**

```bash
git add src/components/public/home/JourneyTimeline.tsx src/app/globals.css
git commit -m "feat(home): add Our Journey timeline section"
```

---

## Task 6: Voices / Testimonials carousel (7)

**Files:**
- Create: `src/components/public/home/Voices.tsx`

- [ ] **Step 1: Write the client component**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from './homeContent';

const AUTO_MS = 6000;

export default function Voices() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused || count < 2) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((c) => (c + 1) % count), AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, count, index]);

  const active = TESTIMONIALS[index];

  return (
    <section
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-tsg-deep text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="What people are saying"
    >
      <div className="hero-grain absolute inset-0 -z-10" aria-hidden="true" />
      <div className="absolute -left-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-tsg-green/25 blur-3xl" aria-hidden="true" />
      <div className="mx-auto w-full max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="eyebrow justify-center text-white/70">Voices of the Movement</p>
        <Quote className="mx-auto mt-8 h-12 w-12 text-tsg-green/70" aria-hidden="true" />

        <blockquote
          key={index}
          className="font-display voices-fade mx-auto mt-6 max-w-3xl text-2xl font-light leading-snug md:text-4xl"
          aria-live="polite"
        >
          “{active.quote}”
        </blockquote>
        <figcaption className="mt-8">
          <span className="font-semibold text-white">{active.name}</span>
          <span className="mt-1 block text-sm text-white/65">
            {active.role} · {active.location}
          </span>
        </figcaption>

        <div className="mt-10 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition hover:border-white hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-7 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/60'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition hover:border-white hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Append the fade keyframe to `globals.css`**

```css
/* ── Voices carousel ────────────────────────────────────────────────────── */
.voices-fade { animation: voicesFade 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes voicesFade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .voices-fade { animation: none; }
}
```

- [ ] **Step 3: Verify** — `npm run typecheck` && `npm run lint`. Visual: auto-advances every 6s, pauses on hover, arrows + dots work, keyboard focus visible.
- [ ] **Step 4: Commit**

```bash
git add src/components/public/home/Voices.tsx src/app/globals.css
git commit -m "feat(home): add Voices testimonials carousel"
```

---

## Task 7: Map geometry data

**Files:**
- Create: `src/components/public/home/mapPaths.ts`

This holds the SVG geometry for the Location section. The structure is fixed; the long `d` path strings are sourced from public-domain SVG maps.

- [ ] **Step 1: Source the geometry**

Obtain a CC0 / public-domain SVG of Africa with country paths and of Nigeria. Recommended source: the Wikimedia Commons "Blank map of Africa" family or the public-domain world TopoJSON rendered to SVG (e.g. via `world-atlas`/`simplemaps` basic tier, both permissively licensed). Procedure:
1. Take an Africa SVG whose `viewBox` you record as `AFRICA_VIEWBOX`.
2. Extract the single combined continent outline `<path d="…">` → `AFRICA_OUTLINE`.
3. Extract Nigeria's country `<path d="…">` in the **same coordinate system** → `NIGERIA_PATH`, and record a tight bounding `viewBox` around it as `NIGERIA_VIEWBOX` (use the path's bbox + ~8% padding).
4. Compute Abuja's point in that coordinate system (Abuja ≈ 9.07°N, 7.48°E). Either read it off the source SVG's graticule or linearly map from the source's known lon/lat extents to SVG units. Store as `ABUJA_POINT = { x, y }`.

If sourcing is blocked, fall back to a **stylized** (not survey-accurate) Africa silhouette + Nigeria highlight — still recognizable, drawn by hand in a vector editor — and document the choice in a comment. Either way the export shape below is identical, so `LocationMap.tsx` does not change.

- [ ] **Step 2: Write the module (fill the `d` strings from Step 1)**

```ts
// Public-domain SVG geometry for the Location section's Africa→Nigeria zoom.
// AFRICA_OUTLINE, NIGERIA_PATH and ABUJA_POINT share one coordinate system so
// the SVG can animate its viewBox from AFRICA_VIEWBOX to NIGERIA_VIEWBOX.
// Source: <record the exact source + license here>.
export const AFRICA_VIEWBOX = '0 0 1000 1000'; // replace with the source viewBox
export const NIGERIA_VIEWBOX = '0 0 1000 1000'; // tight box around Nigeria + ~8% padding

export const AFRICA_OUTLINE =
  'M …'; // continent outline path data

export const NIGERIA_PATH =
  'M …'; // Nigeria country path data, same coordinate system as AFRICA_OUTLINE

export const ABUJA_POINT = { x: 0, y: 0 } as const; // Abuja (FCT) in the shared coordinate system
```

- [ ] **Step 3: Verify** — `npm run typecheck`. (Visual correctness is checked in Task 8.)
- [ ] **Step 4: Commit**

```bash
git add src/components/public/home/mapPaths.ts
git commit -m "feat(home): add Africa/Nigeria map geometry data"
```

---

## Task 8: LocationMap section (9)

**Files:**
- Create: `src/components/public/home/LocationMap.tsx`
- Modify: `src/app/globals.css` (append map styles)

The Google Maps link (provided by the user):
`https://www.google.com/maps?cid=9709369009114742493&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=en&gl=NG&source=embed`
Embed URL: `https://www.google.com/maps?cid=9709369009114742493&hl=en&output=embed` (if the cid embed renders blank during the visual check, fall back to `https://www.google.com/maps?q=2+Kainji+Crescent,+Maitama,+Abuja&hl=en&output=embed`).

- [ ] **Step 1: Append map styles to `globals.css`**

```css
/* ── Location map ───────────────────────────────────────────────────────── */
.map-pin-ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: pinPulse 2.2s ease-out infinite;
}
@keyframes pinPulse {
  0% { opacity: 0.55; transform: scale(0.6); }
  70% { opacity: 0; transform: scale(2.4); }
  100% { opacity: 0; transform: scale(2.4); }
}
.map-embed-skeleton {
  background: linear-gradient(100deg, rgba(10,77,46,0.06) 30%, rgba(10,77,46,0.12) 50%, rgba(10,77,46,0.06) 70%);
  background-size: 200% 100%;
  animation: mapShimmer 1.4s ease-in-out infinite;
}
@keyframes mapShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) {
  .map-pin-ring, .map-embed-skeleton { animation: none; }
}
```

- [ ] **Step 2: Write the client component**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, Phone, Mail } from 'lucide-react';
import { gsap } from 'gsap';
import {
  AFRICA_VIEWBOX,
  NIGERIA_VIEWBOX,
  AFRICA_OUTLINE,
  NIGERIA_PATH,
  ABUJA_POINT,
} from './mapPaths';

const MAPS_LINK =
  'https://www.google.com/maps?cid=9709369009114742493&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=en&gl=NG&source=embed';
const MAPS_EMBED = 'https://www.google.com/maps?cid=9709369009114742493&hl=en&output=embed';

interface LocationMapProps {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

function toViewBox(s: string) {
  const [x, y, w, h] = s.split(/\s+/).map(Number);
  return { x, y, w, h };
}

export default function LocationMap({ address, phone, email }: LocationMapProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pinRef = useRef<SVGGElement>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [pinActive, setPinActive] = useState(false);
  const displayAddress = address || '2 Kainji Crescent, Maitama, Abuja, FCT';

  // Animate viewBox Africa → Nigeria, then drop the pin, when scrolled into view.
  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const africa = toViewBox(AFRICA_VIEWBOX);
    const nigeria = toViewBox(NIGERIA_VIEWBOX);

    if (reduced) {
      svg.setAttribute('viewBox', NIGERIA_VIEWBOX);
      gsap.set(pinRef.current, { autoAlpha: 1, y: 0 });
      return;
    }

    svg.setAttribute('viewBox', AFRICA_VIEWBOX);
    gsap.set(pinRef.current, { autoAlpha: 0, y: -18 });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const vb = { ...africa };
        const tl = gsap.timeline();
        tl.to(vb, {
          x: nigeria.x, y: nigeria.y, w: nigeria.w, h: nigeria.h,
          duration: 1.8, ease: 'power3.inOut',
          onUpdate: () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`),
        }).to(pinRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(2)' }, '-=0.3');
      },
      { threshold: 0.4 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Lazy-mount the Google embed only when the section is near the viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowEmbed(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="location"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-tsg-cream"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Animated map */}
        <div className="order-2 lg:order-1">
          <svg
            ref={svgRef}
            viewBox={AFRICA_VIEWBOX}
            className="mx-auto h-auto w-full max-w-lg"
            role="img"
            aria-label="Map locating the Tinubu Support Group head office in Abuja, Nigeria"
          >
            <path d={AFRICA_OUTLINE} fill="rgba(10,77,46,0.10)" stroke="rgba(10,77,46,0.25)" strokeWidth={1} />
            <path d={NIGERIA_PATH} fill="rgba(10,77,46,0.85)" stroke="#063d23" strokeWidth={1.2} />
            <g
              ref={pinRef}
              tabIndex={0}
              role="button"
              aria-label="TSG head office, Abuja"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setPinActive(true)}
              onMouseLeave={() => setPinActive(false)}
              onFocus={() => setPinActive(true)}
              onBlur={() => setPinActive(false)}
            >
              <circle className="map-pin-ring" cx={ABUJA_POINT.x} cy={ABUJA_POINT.y} r={6} fill="#fff" />
              <circle cx={ABUJA_POINT.x} cy={ABUJA_POINT.y} r={5} fill="#fff" stroke="#063d23" strokeWidth={1.5} />
              <circle cx={ABUJA_POINT.x} cy={ABUJA_POINT.y} r={2} fill="#063d23" />
              {pinActive && (
                <g transform={`translate(${ABUJA_POINT.x}, ${ABUJA_POINT.y - 12})`}>
                  <rect x={-46} y={-22} width={92} height={20} rx={5} fill="#063d23" />
                  <text x={0} y={-8} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={600}>
                    TSG · Abuja
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* Office card + embed */}
        <div className="order-1 lg:order-2">
          <p className="eyebrow text-tsg-green">Find Us</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-tsg-deep md:text-5xl">
            Our home in the heart of Nigeria
          </h2>
          <p className="mt-5 max-w-lg text-lg text-gray-600">
            The Tinubu Support Group is headquartered in Abuja — the Federal Capital Territory and seat of
            the nation. Come and be part of the movement.
          </p>

          <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-lg shadow-tsg-deep/5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-tsg-green" />
              <div>
                <p className="font-semibold text-tsg-deep">Tinubu Support Group</p>
                <p className="text-gray-600">{displayAddress}</p>
              </div>
            </div>
            {(phone || email) && (
              <div className="mt-4 space-y-2 border-t border-black/5 pt-4 text-sm text-gray-600">
                {phone && (
                  <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-tsg-green">
                    <Phone className="h-4 w-4 text-tsg-green" /> {phone}
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-tsg-green">
                    <Mail className="h-4 w-4 text-tsg-green" /> {email}
                  </a>
                )}
              </div>
            )}
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-tsg-green px-6 py-3 font-semibold text-white transition hover:bg-tsg-deep"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 shadow-sm">
            {showEmbed ? (
              <iframe
                title="TSG head office location on Google Maps"
                src={MAPS_EMBED}
                className="h-64 w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="map-embed-skeleton h-64 w-full" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify** — `npm run typecheck` && `npm run lint`. Visual: section enters on Africa, zooms to Nigeria, pin drops on Abuja, hover/focus shows the label, the embed loads when scrolled to, "Open in Google Maps" opens the user's link. Toggle OS reduced-motion → no zoom, final state shown.
- [ ] **Step 4: Commit**

```bash
git add src/components/public/home/LocationMap.tsx src/app/globals.css
git commit -m "feat(home): add interactive Africa→Nigeria location section"
```

---

## Task 9: Wire sections into the homepage + remove Pillars

**Files:**
- Modify: `src/app/(public)/page.tsx`

- [ ] **Step 1: Add imports** (after the existing `CountUp` import, line ~23)

```tsx
import AboutStory from '@/components/public/home/AboutStory';
import LeadershipVision from '@/components/public/home/LeadershipVision';
import ImpactPrograms from '@/components/public/home/ImpactPrograms';
import JourneyTimeline from '@/components/public/home/JourneyTimeline';
import Voices from '@/components/public/home/Voices';
import LocationMap from '@/components/public/home/LocationMap';
```

- [ ] **Step 2: Delete the `PILLARS` constant** (the `const PILLARS = [ … ];` block, lines ~39-55) — it now lives in `homeContent.ts` as `PROGRAMS`. Remove the now-unused `GraduationCap, LineChart, Landmark` names from the lucide import (keep `ArrowRight, Users, ChevronDown, Newspaper`).

- [ ] **Step 3: Replace the standalone Pillars `<section>`** (the `{/* ----- Pillars */}` block, lines ~152-183) with `<ImpactPrograms />`, and insert the other new sections. The JSX body becomes, in order:

```tsx
{/* ---------------------------------------------------------------- Hero */}
<Hero images={heroImages} />

{/* --------------------------------------------------------------- Stats */}
{/* (existing Stats section — unchanged) */}

{/* ----------------------------------------------------------- About */}
<AboutStory description={setting.description} />

{/* ------------------------------------------------ Leadership & Vision */}
<LeadershipVision vision={setting.vision} mission={setting.mission} />

{/* ------------------------------------------------------------- Impact */}
<ImpactPrograms />

{/* ------------------------------------------------------------ Journey */}
<JourneyTimeline />

{/* ------------------------------------------------------------- Voices */}
<Voices />

{/* ---------------------------------------------------------- Latest News */}
{/* (existing Latest News section — unchanged) */}

{/* ----------------------------------------------------------- Location */}
<LocationMap address={setting.address} phone={setting.phone} email={setting.email} />

{/* ----------------------------------------------------------- CTA banner */}
{/* (existing CTA section — unchanged) */}

{/* ----------------------------------------------------------------- FAQ */}
{/* (existing FAQ section — unchanged) */}
```

Keep the existing Stats, Latest News, CTA, and FAQ sections exactly as they are; only their relative position changes (Impact replaces Pillars; About/Leadership go between Stats and Impact; Journey/Voices between Impact and News; Location between News and CTA).

- [ ] **Step 4: Verify** — `npm run typecheck` && `npm run lint`. Confirm no unused-import warnings (the removed lucide icons). Visual: full homepage scrolls through Hero → Stats → About → Leadership → Impact → Journey → Voices → News → Location → CTA → FAQ.
- [ ] **Step 5: Commit**

```bash
git add "src/app/(public)/page.tsx"
git commit -m "feat(home): compose new sections into homepage, retire standalone Pillars"
```

---

## Task 10: Cross-cutting polish pass

**Files:** any of the above, as needed.

- [ ] **Step 1: Reduced-motion** — with OS "reduce motion" on, confirm: `Reveal` shows content immediately, Voices does not auto-advance, the map shows its final Nigeria+pin state with no zoom. Fix any section that still animates.
- [ ] **Step 2: Mobile (≤640px)** — confirm each section stacks correctly, headings don't overflow, the timeline uses the left spine, the map SVG and embed are full-width, tap targets ≥44px. Adjust Tailwind classes as needed.
- [ ] **Step 3: Accessibility** — keyboard-tab through Voices controls and the map pin; confirm visible focus, working `aria-label`s, and that the office card is reachable without hover. The embed `<iframe>` has a `title`.
- [ ] **Step 4: Consistency** — eyebrow colors correct per background, alternating bg rhythm reads well, spacing consistent (`py-24`, `max-w-7xl`).
- [ ] **Step 5: Final gates** — `npm run typecheck` && `npm run lint` clean. (Optional, only when the user has stopped their dev server: `npm run build`.)
- [ ] **Step 6: Commit any fixes**

```bash
git add -- <only the files you changed>
git commit -m "polish(home): reduced-motion, mobile, a11y pass on new sections"
```

---

## Self-review (spec coverage)

- About (full-viewport, redesigned) → Task 2 ✓
- Leadership & Vision → Task 3 ✓
- Impact/Programs (absorbs Pillars) → Task 4 + Task 9 ✓
- Our Journey timeline → Task 5 ✓
- Voices/Testimonials → Task 6 ✓
- Location: Africa→Nigeria zoom, pin on Abuja, hover card, lazy Google embed, reduced-motion fallback → Tasks 7–8 ✓
- Placeholder content, clearly labelled, editable → Task 1 ✓
- Address "2 Kainji Crescent, Maitama, Abuja" + user's Maps link → Task 8 ✓
- Each new section ≥ one viewport (`min-h-[100svh]`) → all section tasks ✓
- Reuse design system (palette, serif, eyebrow, Reveal, GSAP) → conventions + all tasks ✓
- a11y + reduced-motion + perf (lazy embed) → Tasks 6, 8, 10 ✓
- No new dependencies → confirmed ✓
- Don't break Hero/Stats/News/CTA/FAQ → Task 9 keeps them ✓

**Type consistency:** `PROGRAMS`/`MILESTONES`/`TESTIMONIALS`/`ABOUT_STATS` and their interfaces defined once in Task 1 and consumed unchanged in Tasks 2/4/5/6. `mapPaths.ts` exports (`AFRICA_VIEWBOX`, `NIGERIA_VIEWBOX`, `AFRICA_OUTLINE`, `NIGERIA_PATH`, `ABUJA_POINT`) defined in Task 7 and consumed unchanged in Task 8.
