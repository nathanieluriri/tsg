// Pure, DOM-free math for the pinned scroll-story. Kept separate from the React
// component so it can be unit-tested in the node test environment.

/** Clamp `n` into [min, max] (defaults to [0, 1]). */
export function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Scroll progress (0..1) of a tall pinned wrapper.
 * 0 when the wrapper's top edge is at the top of the viewport; 1 once the wrapper
 * has scrolled its full "travel" (its height minus one viewport).
 *
 * @param rectTop        wrapper.getBoundingClientRect().top
 * @param wrapperHeight  wrapper.getBoundingClientRect().height
 * @param viewportHeight window.innerHeight
 */
export function computeProgress(
  rectTop: number,
  wrapperHeight: number,
  viewportHeight: number,
): number {
  const travel = wrapperHeight - viewportHeight;
  if (travel <= 0) return 0;
  return clamp(-rectTop / travel);
}

/** Remap `p` from the window [inStart, inEnd] onto [0, 1], clamped. */
export function mapRange(p: number, inStart: number, inEnd: number): number {
  if (inEnd === inStart) return p >= inEnd ? 1 : 0;
  return clamp((p - inStart) / (inEnd - inStart));
}

/** Cubic ease-in-out. Keeps the image slide from tracking scroll perfectly 1:1. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Per-segment progress for a staggered ("BlurText"-style) reveal. Splits the
 * window [windowStart, windowEnd] into `count` overlapping sub-windows and
 * returns segment `index`'s clamped 0..1 progress at global progress `p`.
 * Earlier indices lead; later indices trail. `spread` (0..1) is the fraction of
 * the window each segment's own travel occupies (higher = more overlap).
 *
 * Note: callers control direction by choosing the index they pass -- e.g. an
 * outgoing frame that should "unwrite" passes `count - 1 - i` to reverse it.
 */
export function segmentProgress(
  p: number,
  index: number,
  count: number,
  windowStart: number,
  windowEnd: number,
  spread = 0.7,
): number {
  const span = windowEnd - windowStart;
  const segSpan = span * spread;
  const startRoom = span - segSpan;
  const start = windowStart + (count <= 1 ? 0 : (index / (count - 1)) * startRoom);
  return mapRange(p, start, start + segSpan);
}
