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
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
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
      <div
        className="absolute -left-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-tsg-green/25 blur-3xl"
        aria-hidden="true"
      />
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
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? 'w-7 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/60'
                }`}
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
