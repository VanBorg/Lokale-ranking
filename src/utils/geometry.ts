import type { Wall } from '../types/wall';
import type { RoomShape } from '../types/room';

/** Scale from cm to canvas pixels (floor plan). Shared by preview, blocks, and placement. */
export const ROOM_CANVAS_SCALE = 0.72;

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

/** Axis-aligned bounding size of the room shape in canvas coordinates. */
export const getRoomShapeBoundingSize = (
  shape: RoomShape,
  width: number,
  length: number,
  scale: number,
): { w: number; h: number } => {
  const pts = roomShapePoints(shape, width, length, scale);
  let minX = pts[0]!;
  let minY = pts[1]!;
  let maxX = pts[0]!;
  let maxY = pts[1]!;
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i]!;
    const y = pts[i + 1]!;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { w: maxX - minX, h: maxY - minY };
};
