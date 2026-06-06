// Pure, DOM-free math for the Impact Programs 3D tilt cards. Kept separate from
// the React island so it can be unit-tested in the node test environment, the
// same way scrollStoryMath.ts is.
import { clamp } from './scrollStoryMath';

export interface Tilt {
  /** Degrees to feed `rotateX` (tilt about the horizontal axis). */
  rotateX: number;
  /** Degrees to feed `rotateY` (tilt about the vertical axis). */
  rotateY: number;
}

/**
 * 3D tilt for a card from the pointer position over it. Pointer at the centre
 * returns {0, 0}; moving toward an edge tilts the card toward the cursor (right
 * → +rotateY, up → +rotateX). Output magnitude is clamped to ±maxDeg so pointer
 * coords past an edge stay safe.
 *
 * @param width   card width in px
 * @param height  card height in px
 * @param offsetX pointer X relative to the card's left edge (px)
 * @param offsetY pointer Y relative to the card's top edge (px)
 * @param maxDeg  maximum tilt magnitude in degrees (default 10)
 */
export function computeTilt(
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
  maxDeg = 10,
): Tilt {
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0 };
  const nx = (offsetX / width) * 2 - 1; // -1 (left) .. 1 (right)
  const ny = (offsetY / height) * 2 - 1; // -1 (top) .. 1 (bottom)
  return {
    rotateX: clamp(-ny * maxDeg, -maxDeg, maxDeg) || 0,
    rotateY: clamp(nx * maxDeg, -maxDeg, maxDeg) || 0,
  };
}
