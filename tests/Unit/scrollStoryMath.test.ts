import { describe, it, expect } from 'vitest';
import {
  clamp,
  computeProgress,
  mapRange,
  easeInOut,
  segmentProgress,
} from '../../src/components/public/home/scrollStoryMath';

describe('clamp', () => {
  it('clamps below, above, and passes through', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(0.4)).toBe(0.4);
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe('computeProgress', () => {
  const VH = 800;
  const H = 1600; // 200vh wrapper -> travel = H - VH = 800

  it('is 0 at the top of the section', () => {
    expect(computeProgress(0, H, VH)).toBe(0);
  });
  it('is 1 after the full travel', () => {
    expect(computeProgress(-800, H, VH)).toBe(1);
  });
  it('is 0.5 at the midpoint', () => {
    expect(computeProgress(-400, H, VH)).toBeCloseTo(0.5, 5);
  });
  it('clamps outside the range', () => {
    expect(computeProgress(200, H, VH)).toBe(0);
    expect(computeProgress(-2000, H, VH)).toBe(1);
  });
  it('returns 0 when the section is not taller than the viewport', () => {
    expect(computeProgress(-10, 800, 800)).toBe(0);
    expect(computeProgress(-10, 700, 800)).toBe(0);
  });
});

describe('mapRange', () => {
  it('remaps a sub-window onto 0..1', () => {
    expect(mapRange(0.5, 0.5, 1)).toBe(0);
    expect(mapRange(0.75, 0.5, 1)).toBe(0.5);
    expect(mapRange(1, 0.5, 1)).toBe(1);
  });
  it('clamps outside the window', () => {
    expect(mapRange(0.2, 0.5, 1)).toBe(0);
    expect(mapRange(2, 0.5, 1)).toBe(1);
  });
  it('handles a zero-width window', () => {
    expect(mapRange(0.6, 0.5, 0.5)).toBe(1);
    expect(mapRange(0.4, 0.5, 0.5)).toBe(0);
  });
});

describe('easeInOut', () => {
  it('pins endpoints and midpoint', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 5);
  });
  it('is monotonic increasing', () => {
    expect(easeInOut(0.25)).toBeLessThan(easeInOut(0.5));
    expect(easeInOut(0.5)).toBeLessThan(easeInOut(0.75));
  });
});

describe('segmentProgress', () => {
  it('earlier segments lead, later segments trail (cascade)', () => {
    const p = 0.3;
    expect(segmentProgress(p, 0, 4, 0, 1)).toBeGreaterThan(segmentProgress(p, 3, 4, 0, 1));
  });
  it('every segment completes by the end of the window', () => {
    expect(segmentProgress(1, 0, 4, 0, 1)).toBe(1);
    expect(segmentProgress(1, 3, 4, 0, 1)).toBe(1);
  });
  it('every segment is 0 before its window starts', () => {
    expect(segmentProgress(0, 0, 4, 0.45, 1)).toBe(0);
    expect(segmentProgress(0.4, 3, 4, 0.45, 1)).toBe(0);
  });
  it('handles a single segment', () => {
    expect(segmentProgress(0, 0, 1, 0, 1)).toBe(0);
    expect(segmentProgress(1, 0, 1, 0, 1)).toBe(1);
  });
});
