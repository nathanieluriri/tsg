'use client';

import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';
import { ScrollLockProvider } from './ScrollLock';

/**
 * Momentum/eased scrolling for the public site, with the shared scroll-lock
 * provider layered on top. Users who prefer reduced motion get native scrolling
 * (Lenis is given a near-instant lerp so it never hijacks their scroll feel).
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <ReactLenis
      root
      options={{
        lerp: prefersReduced ? 1 : 0.09,
        duration: 1.2,
        smoothWheel: !prefersReduced,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        syncTouch: false,
        gestureOrientation: 'vertical',
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      <ScrollLockProvider>{children}</ScrollLockProvider>
    </ReactLenis>
  );
}
