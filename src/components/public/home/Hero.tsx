/* eslint-disable @next/next/no-img-element */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { gsap } from 'gsap';
import { useScrollLock } from '../scroll/ScrollLock';
import { TSG_LOGO } from './tsgLogoPaths';

// useLayoutEffect on the client (so the preloader is armed before first paint),
// useEffect on the server to avoid the SSR warning.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SESSION_KEY = 'tsg-intro-played';

// Each photo starts at its own small size (front-most smallest) so they're
// nested from the first frame, then burst out one-by-one; the last grows to
// full-bleed and hands off to the hero background.
const START_SCALES = [0.5, 0.04, 0.008, 0.0015];
const END_SCALES = [0.62, 0.72, 0.82, 0.92];
const REVEAL_BEAT = 0.22; // seconds each photo holds before the next bursts out

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
  const frames = images.length ? images : ['/assets/img/hero-carousel/tinubu1.png'];
  const heroBg = frames[frames.length - 1];

  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [introDone, setIntroDone] = useState(false);

  useScrollLock('opening-sequence', !introDone);

  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const played = sessionStorage.getItem(SESSION_KEY) === '1';
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
      const counterWrap = q('.opening-counter');
      const trace = qa('.opening-trace');
      const reveal = q('.opening-reveal');
      const frameEl = q('.opening-frame');
      const frameImgs = qa('.opening-frame img');
      const lines = qa('.hero-line-inner');
      const eyebrow = q('.hero-eyebrow');
      const sub = q('.hero-sub');
      const cta = q('.hero-cta');
      const cue = q('.hero-scroll');

      // initial states
      gsap.set([logo, counterWrap], { autoAlpha: 0, y: 16 });
      gsap.set(trace, { strokeDashoffset: 1 });
      gsap.set(reveal, { autoAlpha: 1 });
      gsap.set(frameImgs, {
        autoAlpha: 1,
        scale: (i: number) => START_SCALES[i] ?? 0.01,
        transformOrigin: '50% 50%',
      });
      gsap.set(lines, { yPercent: 120 });
      gsap.set([eyebrow, sub, cta], { autoAlpha: 0, y: 18 });
      gsap.set(cue, { autoAlpha: 0 });

      const counter = { v: 0 };
      const setCount = () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(counter.v));
        }
      };
      setCount();

      const last = frameImgs.length - 1;
      const tl = gsap.timeline({ onComplete: () => setIntroDone(true) });
      tlRef.current = tl;

      tl
        // 1. preloader content in
        .to([logo, counterWrap], {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
        })
        // 2. count up + draw the logo on, in lockstep
        .to(counter, { v: 99, duration: 2.5, ease: 'power1.inOut', onUpdate: setCount }, '<')
        .to(
          trace,
          { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut', stagger: 0.12 },
          '<',
        )
        // 3. preloader out
        .to([logo, counterWrap], { autoAlpha: 0, y: -16, duration: 0.5, ease: 'power2.in' }, '+=0.25')
        .to(preloader, { autoAlpha: 0, duration: 0.6 }, '-=0.2')
        // 4. photos burst out one after another
        .addLabel('rev', '-=0.3')
        .to(
          frameImgs,
          {
            scale: (i: number) => END_SCALES[i] ?? 0.9,
            duration: 1.5,
            ease: 'power3.out',
            stagger: REVEAL_BEAT,
          },
          'rev',
        )
        // last photo fills the screen; its frame expands; the rest fade behind it
        .to(
          frameImgs[last],
          { scale: 1, duration: 1.3, ease: 'power2.inOut', overwrite: 'auto' },
          `rev+=${(REVEAL_BEAT * frameImgs.length).toFixed(3)}`,
        )
        .to(
          frameEl,
          { width: '100vw', height: '100svh', borderRadius: 0, duration: 1.3, ease: 'power2.inOut' },
          '<',
        )
        .to(
          frameImgs.slice(0, last),
          { autoAlpha: 0, duration: 0.8, ease: 'power2.in' },
          '<',
        )
        // 5. hand off to the real hero behind the overlay
        .to(reveal, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, '+=0.15')
        // 6. hero content writes itself in
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.35')
        .to(lines, { yPercent: 0, duration: 1.0, ease: 'power4.out', stagger: 0.12 }, '-=0.4')
        .to(sub, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .to(cta, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
        .to(cue, { autoAlpha: 1, duration: 0.6 }, '-=0.3');

      // Failsafe: never lock the page if the timeline stalls.
      const failSafe = window.setTimeout(
        () => setIntroDone(true),
        (tl.duration() + 4) * 1000,
      );
      return () => window.clearTimeout(failSafe);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Persist "played" once the intro finishes (or is skipped).
  useEffect(() => {
    if (introDone && typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }, [introDone]);

  const skip = () => {
    if (tlRef.current) tlRef.current.progress(1);
    else setIntroDone(true);
  };

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
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroBg}
            alt="President Bola Ahmed Tinubu"
            fill
            priority
            sizes="100vw"
            className="hero-bg object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-tsg-deep/95 via-tsg-green/75 to-tsg-green/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-tsg-deep/90 via-transparent to-transparent" />
          <div className="hero-grain absolute inset-0" aria-hidden="true" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="hero-eyebrow eyebrow text-tsg-gold-soft">Renewed Hope Agenda</p>
            <h1 className="hero-title font-display mt-5 font-semibold leading-[1.02] tracking-tight">
              <span className="hero-line">
                <span className="hero-line-inner">Renewed Hope.</span>
              </span>
              <span className="hero-line">
                <span className="hero-line-inner italic text-tsg-gold">Stronger Nigeria.</span>
              </span>
            </h1>
            <p className="hero-sub mt-6 max-w-xl text-lg text-white/85 md:text-xl">
              Joining hands with President Bola Ahmed Tinubu to build a brighter future for
              every Nigerian — one community, one citizen at a time.
            </p>
            <div className="hero-cta mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-tsg-gold px-7 py-3.5 font-semibold text-tsg-deep shadow-lg shadow-black/20 transition hover:bg-tsg-gold-soft hover:shadow-xl"
              >
                Become a Member
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10"
              >
                Our Vision
              </Link>
            </div>
          </div>
        </div>

        <a href="#stats" className="hero-scroll" aria-label="Scroll to explore">
          <span>Scroll</span>
          <span className="hero-scroll-line" aria-hidden="true" />
        </a>
      </section>

      {/* ---- intro overlays (removed once the sequence finishes) ---- */}
      {!introDone && (
        <>
          <div className="opening-reveal" aria-hidden="true">
            <div className="opening-frame">
              {frames.map((src, i) => (
                <img key={`${src}-${i}`} src={src} alt="" decoding="async" />
              ))}
            </div>
          </div>

          <div className="opening-preloader">
            <button
              type="button"
              onClick={skip}
              className="opening-skip"
              aria-label="Skip intro"
            >
              Skip
            </button>
            <div className="opening-logo">
              <LogoTrace />
            </div>
            <div className="opening-counter" aria-live="polite">
              <span ref={counterRef}>0</span>
              <span className="opening-pct">%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
