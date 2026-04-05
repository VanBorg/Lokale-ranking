import type { Wall } from '../types/wall';
import type { RoomShape } from '../types/room';

export const cmToM = (cm: number): number => cm / 100;

export const calcSurfaceArea = (widthCm: number, heightCm: number): number =>
  parseFloat((cmToM(widthCm) * cmToM(heightCm)).toFixed(2));

export const calcNetArea = (wall: Wall): number => {
  const elementsArea = wall.elements.reduce(
    (sum, el) => sum + cmToM(el.width) * cmToM(el.height),
    0,
  );
  return parseFloat(Math.max(0, wall.surfaceArea - elementsArea).toFixed(2));
};

export const calcFloorArea = (widthCm: number, lengthCm: number): number =>
  parseFloat((cmToM(widthCm) * cmToM(lengthCm)).toFixed(2));

/**
 * Returns a flat array of [x,y, x,y, ...] points describing the room outline,
 * scaled by the given factor. Used by both RoomBlock and RoomPreview.
 */
export const roomShapePoints = (
  shape: RoomShape,
  width: number,
  length: number,
  scale: number,
): number[] => {
  const w = width * scale;
  const l = length * scale;

  if (shape === 'l-shape') {
    const halfW = w / 2;
    const halfL = l / 2;
    return [
      0, 0,
      w, 0,
      w, halfL,
      halfW, halfL,
      halfW, l,
      0, l,
    ];
  }

  // rectangle & custom fallback
  return [0, 0, w, 0, w, l, 0, l];
};
