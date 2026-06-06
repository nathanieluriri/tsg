'use client';

import {
  createElement,
  useEffect,
  useRef,
  type ClassAttributes,
  type HTMLAttributes,
} from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
  /** The text to animate. Use "\n" to force a line break. */
  text: string;
  className?: string;
  /** Element to render (defaults to h2). */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  /** Seconds before the stagger starts once in view. */
  delay?: number;
  /** Seconds between each word. */
  stagger?: number;
  /** Tween duration per word. */
  duration?: number;
  /** IntersectionObserver visibility threshold. */
  threshold?: number;
}

/**
 * React Bits-style "Split Text" reveal: the text is split into words that rise
 * up and fade in with a stagger the first time the element scrolls into view.
 * Falls back to fully visible for reduced-motion / no-JS (the words render as
 * normal inline text, so it stays accessible and SEO-friendly).
 */
export default function SplitText({
  text,
  className = '',
  as = 'h2',
  delay = 0,
  stagger = 0.08,
  duration = 0.8,
  threshold = 0.3,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = el.querySelectorAll<HTMLElement>('[data-word]');
    gsap.set(words, { yPercent: 115, opacity: 0 });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration,
          ease: 'power3.out',
          stagger,
          delay,
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, stagger, duration, threshold]);

  const lines = text.split('\n');

  const children = lines.map((line, li) => {
    const words = line.split(' ');
    return (
      <span key={li} className="block overflow-hidden pb-[0.08em]">
        {words.map((w, wi) => (
          <span key={wi}>
            <span data-word className="inline-block will-change-transform">
              {w}
            </span>
            {wi < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    );
  });

  // createElement keeps the dynamic tag simple and type-clean.
  return createElement(
    as,
    { ref, className } as ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement>,
    children,
  );
}
