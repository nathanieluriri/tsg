import { describe, it, expect } from 'vitest';
import { computeTilt } from '../../src/components/public/home/tiltMath';

describe('computeTilt', () => {
  const W = 300;
  const H = 200;

  it('is flat at the centre', () => {
    expect(computeTilt(W, H, W / 2, H / 2)).toEqual({ rotateX: 0, rotateY: 0 });
  });

  it('tilts toward the cursor horizontally', () => {
    expect(computeTilt(W, H, W, H / 2).rotateY).toBeCloseTo(10, 5); // right edge
    expect(computeTilt(W, H, 0, H / 2).rotateY).toBeCloseTo(-10, 5); // left edge
  });

  it('tilts the top back as the cursor rises', () => {
    expect(computeTilt(W, H, W / 2, 0).rotateX).toBeCloseTo(10, 5); // top edge
    expect(computeTilt(W, H, W / 2, H).rotateX).toBeCloseTo(-10, 5); // bottom edge
  });

  it('clamps when the pointer is past an edge', () => {
    const t = computeTilt(W, H, W * 2, -H, 10);
    expect(t.rotateY).toBe(10);
    expect(t.rotateX).toBe(10);
  });

  it('respects a custom maxDeg', () => {
    expect(computeTilt(W, H, W, H / 2, 6).rotateY).toBeCloseTo(6, 5);
  });

  it('returns flat for zero-size cards', () => {
    expect(computeTilt(0, 0, 10, 10)).toEqual({ rotateX: 0, rotateY: 0 });
  });
});
