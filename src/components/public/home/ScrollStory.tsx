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
    // Pinned branch added in a later task.
  }

  return (
    <>
      <AboutStory description={description} />
      <LeadershipVision vision={vision} mission={mission} />
    </>
  );
}
