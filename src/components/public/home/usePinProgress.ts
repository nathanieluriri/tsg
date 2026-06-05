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
 * (e.g. PinnedStory) -- mounting/unmounting that component gates the listeners.
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
  // so a viewport-height change resizes it and the ResizeObserver fires -- covering
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
