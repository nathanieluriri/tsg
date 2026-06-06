'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useScrollLock } from '../scroll/ScrollLock';
import { TSG_LOGO } from './tsgLogoPaths';

// useLayoutEffect on the client (arm the preloader before first paint),
// useEffect on the server to avoid the SSR warning.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SESSION_KEY = 'tsg-intro-played';
const SLIDE_MS = 5500;

// Opening burst: a few photos nested smallest-in-front, bursting out one by one.
const START_SCALES = [0.5, 0.04, 0.008, 0.0015];
const END_SCALES = [0.62, 0.72, 0.82, 0.92];
const REVEAL_BEAT = 0.22;

function LogoTrace() {
  return (
    <svg
      viewBox={`0 0 ${TSG_LOGO.width} ${TSG_LOGO.height}`}
      className="opening-logo-svg"
      role="img"
      aria-label="Tinubu Support Group"
    >
      {TSG_LOGO.paths.map((d, i) => (
        <path key={`ghost-${i}`} className="opening-ghost" d={d} pathLength={1} />
      ))}
      {TSG_LOGO.paths.map((d, i) => (
        <path key={`trace-${i}`} className="opening-trace" d={d} pathLength={1} />
      ))}
    </svg>
  );
}

export default function Hero({ images }: { images: string[] }) {
  const slides = images.length ? images : ['/assets/img/hero-carousel/tinubu1.png'];
  const len = slides.length;

  // Burst frames: a handful of photos that ends on slide 0, so the hand-off
  // into the carousel (which opens on slide 0) is seamless.
  const first = slides[0] as string;
  const burst = len <= 1 ? slides : [...slides.slice(1, Math.min(4, len)), first];

  const [current, setCurrent] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [paused, setPaused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useScrollLock('opening-sequence', !introDone);

  const next = useCallback(() => setCurrent((c) => (c + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + len) % len), [len]);

  // Only mount the active slide and its immediate (circular) neighbours, so the
  // carousel can cycle dozens of large photos while loading just a few.
  const inWindow = useCallback(
    (i: number) => {
      if (len <= 1) return true;
      const d = Math.min((i - current + len) % len, (current - i + len) % len);
      return d <= 1;
    },
    [current, len],
  );

  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // const played = sessionStorage.getItem(SESSION_KEY) === '1';
    const played=false;
    if (reduced || played) {
      setIntroDone(true);
      return;
    }
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const q = (s: string) => root.querySelector<HTMLElement>(s);
      const qa = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s));

      const preloader = q('.opening-preloader');
      const logo = q('.opening-logo');
      const trace = qa('.opening-trace');
      const reveal = q('.opening-reveal');
      const frameEl = q('.opening-frame');
      const frameSlides = qa('.opening-frame-slide');
      const words = qa('.hero-word');
      const eyebrow = q('.hero-eyebrow');
      const divider = q('.hero-divider');
      const sub = q('.hero-sub');
      const cta = q('.hero-cta');
      const controls = q('.hero-controls');

      gsap.set(logo, { autoAlpha: 0, y: 14, scale: 0.985 });
      gsap.set(trace, { strokeDashoffset: 1, autoAlpha: 0 });
      gsap.set(reveal, { autoAlpha: 1 });
      gsap.set(frameSlides, {
        autoAlpha: 1,
        scale: (i: number) => START_SCALES[i] ?? 0.01,
        transformOrigin: '50% 50%',
      });
      gsap.set(words, { yPercent: 120 });
      gsap.set(divider, { scaleX: 0 });
      gsap.set([eyebrow, sub, cta, controls], { autoAlpha: 0, y: 18 });

      const last = frameSlides.length - 1;
      const lastSlide = frameSlides[last];
      if (!lastSlide) {
        setIntroDone(true);
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setIntroDone(true) });
      tlRef.current = tl;

      tl
        // 1. logo fades in, then draws on — fine stroke, smooth ease, gentle stagger
        .to(logo, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' })
        .to(trace, { autoAlpha: 1, duration: 0.3 }, '<')
        .to(
          trace,
          { strokeDashoffset: 0, duration: 2.8, ease: 'power2.inOut', stagger: 0.07 },
          '<',
        )
        // 2. logo out
        .to(logo, { autoAlpha: 0, y: -12, duration: 0.55, ease: 'power2.in' }, '+=0.35')
        .to(preloader, { autoAlpha: 0, duration: 0.6 }, '-=0.25')
        // 3. photos burst out one after another
        .addLabel('rev', '-=0.3')
        .to(
          frameSlides,
          {
            scale: (i: number) => END_SCALES[i] ?? 0.9,
            duration: 1.5,
            ease: 'power3.out',
            stagger: REVEAL_BEAT,
          },
          'rev',
        )
        .to(
          lastSlide,
          { scale: 1, duration: 1.3, ease: 'power2.inOut', overwrite: 'auto' },
          `rev+=${(REVEAL_BEAT * frameSlides.length).toFixed(3)}`,
        )
        .to(
          frameEl,
          { width: '100vw', height: '100svh', borderRadius: 0, duration: 1.3, ease: 'power2.inOut' },
          '<',
        )
        .to(frameSlides.slice(0, last), { autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, '<')
        // 4. hand off to the hero carousel beneath the overlay
        .to(reveal, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.15')
        // 5. hero content writes itself in
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        .to(words, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 }, '-=0.4')
        .to(divider, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, '-=0.5')
        .to(sub, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
        .to(cta, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
        .to(controls, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

      const failSafe = window.setTimeout(
        () => setIntroDone(true),
        (tl.duration() + 4) * 1000,
      );
      return () => window.clearTimeout(failSafe);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (introDone && typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }, [introDone]);

  // Carousel autoplay (after the intro, when not paused / reduced-motion).
  useEffect(() => {
    if (!introDone || len < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setCurrent((c) => (c + 1) % len), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [introDone, paused, len, current]);

  return (
    <div ref={rootRef}>
      {/* No-JS / crawlers: never leave the overlays covering the page. */}
      <noscript>
        <style>{`.opening-preloader,.opening-reveal{display:none!important}`}</style>
      </noscript>

      <section
        id="hero"
        className="hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-tsg-deep text-white"
        aria-label="Renewed Hope. Stronger Nigeria."
        style={{ ['--slide-dur' as string]: `${SLIDE_MS}ms` }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* carousel + overlay */}
        <div className="absolute inset-0 -z-10">
          {slides.map((src, i) => (
            <div key={`${src}-${i}`} className={`hero-slide ${i === current ? 'is-active' : ''}`}>
              {inWindow(i) && (
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="hero-slide-img object-cover object-center"
                />
              )}
            </div>
          ))}
          {/* clean, even tint for legibility — no gradients */}
          <div className="absolute inset-0 bg-tsg-deep/45" />
          <div className="hero-grain absolute inset-0" aria-hidden="true" />
        </div>

        {/* content */}
        <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="hero-eyebrow eyebrow text-white/75">Renewed Hope Agenda</p>
            <h1 className="hero-title font-display mt-6 tracking-tight">
              <span className="hero-line">
                <span className="hero-word font-semibold">Renewed</span>{' '}
                <span className="hero-word font-semibold">Hope.</span>
              </span>
              <span className="hero-line">
                <span className="hero-word font-light italic text-white/95">Stronger</span>{' '}
                <span className="hero-word font-light italic text-white/95">Nigeria.</span>
              </span>
            </h1>
            <span className="hero-divider mt-7" aria-hidden="true" />
            <p className="hero-sub mt-7 max-w-lg text-lg leading-relaxed text-white/80 md:text-xl">
              Joining hands with President Bola Ahmed Tinubu to build a brighter future for
              every Nigerian — one community, one citizen at a time.
            </p>
            <div className="hero-cta mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-tsg-green shadow-lg shadow-black/20 transition hover:bg-white/90"
              >
                Become a Member
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-7 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Our Vision
              </Link>
            </div>
          </div>
        </div>

        {/* carousel controls: progress bar + prev/next */}
        {len > 1 && (
          <div className="absolute inset-x-0 bottom-9 z-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
              <div className="hero-controls flex flex-1 items-center gap-4">
                <div className="hero-prog">
                  <span className="hero-prog-fill" key={`${current}-${introDone}`} />
                </div>
                <span className="text-xs font-medium tracking-wider text-white/70 tabular-nums">
                  {String(current + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
                </span>
              </div>
              <div className="hero-controls flex items-center gap-3">
                <button type="button" className="hero-arrow" onClick={prev} aria-label="Previous slide">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" className="hero-arrow" onClick={next} aria-label="Next slide">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---- intro overlays (removed once the sequence finishes) ---- */}
      {!introDone && (
        <>
          <div className="opening-reveal" aria-hidden="true">
            <div className="opening-frame">
              {burst.map((src, i) => (
                <div key={`${src}-${i}`} className="opening-frame-slide">
                  <Image src={src} alt="" fill sizes="60vw" className="object-cover object-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="opening-preloader">
            <div className="opening-logo">
              <LogoTrace />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
