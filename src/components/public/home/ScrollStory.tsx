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
  const topImageRef = useRef<HTMLDivElement | null>(null);
  const bgTopRef = useRef<HTMLDivElement | null>(null);
  const frameARef = useRef<HTMLDivElement | null>(null);
  const frameBRef = useRef<HTMLDivElement | null>(null);
  const segsRef = useRef<{ a: HTMLElement[]; b: HTMLElement[] }>({ a: [], b: [] });

  // Apply the current progress (0..1) imperatively -- no React re-render per frame.
  const apply = useCallback((p: number) => {
    // Sticky image reveal: the base (second) image stays put while the top
    // (first) image is clipped away from the bottom -- it looks "cut"/cleaned
    // off in place rather than sliding, uncovering the stationary image beneath.
    if (topImageRef.current) {
      topImageRef.current.style.clipPath = `inset(0 0 ${(easeInOut(p) * 100).toFixed(2)}% 0)`;
    }
    // Background cross-fade: cream (base) -> green (top layer) across the middle.
    if (bgTopRef.current) {
      bgTopRef.current.style.opacity = mapRange(p, 0.15, 0.85).toFixed(3);
    }
    const { a, b } = segsRef.current;
    // Frame A (Who We Are) blurs/fades OUT over [0, 0.5]. Reverse the stagger
    // index so the last element leaves first -- the outgoing frame "unwrites".
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
    // Only the dominant frame is interactive / perceivable. `inert` (Baseline
    // 2023: Chrome 102, Safari 15.5, Firefox 112) removes the other from tab
    // order, pointer events, and selection. PinnedStory only mounts on
    // fine-pointer desktops, so sub-112 Firefox simply gets the static fallback.
    // `aria-hidden` is paired in lockstep as belt-and-suspenders so the inactive
    // frame's heading never doubles up in the screen-reader outline.
    const aDominant = p < 0.5;
    frameARef.current?.toggleAttribute('inert', !aDominant);
    frameBRef.current?.toggleAttribute('inert', aDominant);
    frameARef.current?.setAttribute('aria-hidden', aDominant ? 'false' : 'true');
    frameBRef.current?.setAttribute('aria-hidden', aDominant ? 'true' : 'false');
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
    <section
      ref={wrapperRef}
      aria-label="Who We Are and Leadership & Vision"
      className="relative h-[200vh]"
    >
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
          {/* Image column (LEFT): fixed frame. The top image is clipped away from
              the bottom on scroll, uncovering the stationary ("sticky") base image
              beneath -- a hard "cut" reveal, not a slide. */}
          <div className="relative h-[68svh] max-h-[40rem] w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-tsg-deep/25">
            {/* Base image (revealed) -- stays put beneath the top image. */}
            <Image
              src="/assets/img/blog/presidentbola.jpg"
              alt="President Bola Ahmed Tinubu"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover object-center"
            />
            {/* Top image (cut away) -- clip-path shrinks it from the bottom as
                progress grows, uncovering the base image. Stays in place. */}
            <div ref={topImageRef} className="absolute inset-0" style={{ willChange: 'clip-path' }}>
              <Image
                src="/assets/img/tinubu2.jpg"
                alt="President Bola Ahmed Tinubu"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Text column (RIGHT): two overlapping frames cross-fade. */}
          <div className="relative h-[68svh] max-h-[40rem]">
            {/* Frame A -- Who We Are.
                The pinned frames are height-constrained (h-[68svh] max-h-[40rem]),
                so prose below is line-clamped for fit; the static fallback and the
                linked /about & /pbat pages show the full copy. */}
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

            {/* Frame B -- Leadership & Vision */}
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
