import type { Wall } from '../types/wall';
import type { RoomVertex } from '../types/room';

/** Pixels per cm on the floor-plan canvas. */
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

/** Vertices (cm) → flat Konva points [x, y, x, y, …] in canvas pixels. */
export function verticesToKonvaPoints(vertices: RoomVertex[], scale: number): number[] {
  return vertices.flatMap((v) => [v.x * scale, v.y * scale]);
}

/** Axis-aligned bounding box of a vertex array, in cm. */
export function verticesBoundingBox(vertices: RoomVertex[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const v of vertices) {
    if (v.x < minX) minX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.x > maxX) maxX = v.x;
    if (v.y > maxY) maxY = v.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Floor area of a polygon via the Shoelace formula, returned in m². */
export function calcPolygonArea(vertices: RoomVertex[]): number {
  const n = vertices.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i]!.x * vertices[j]!.y;
    area -= vertices[j]!.x * vertices[i]!.y;
  }
  return parseFloat((Math.abs(area) / 2 / 10000).toFixed(2));
}

/** Length of an edge between two vertices in cm. Works for diagonal edges too. */
export function edgeLength(a: RoomVertex, b: RoomVertex): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

/** Midpoint between two vertices (used for "add vertex" on an edge). */
export function midpoint(a: RoomVertex, b: RoomVertex): RoomVertex {
  return {
    x: Math.round((a.x + b.x) / 2),
    y: Math.round((a.y + b.y) / 2),
  };
}

/** Gross wall surface area in m². */
export function calcSurfaceAreaWall(widthCm: number, heightCm: number): number {
  return calcSurfaceArea(widthCm, heightCm);
}

/**
 * Roteer alle vertices 90° met de klok mee rond het centrum van hun bounding box.
 * Normaliseert daarna zodat min(x)=0, min(y)=0.
 */
export function rotateVertices90CW(vertices: RoomVertex[]): RoomVertex[] {
  const bb = verticesBoundingBox(vertices);
  const cx = bb.minX + bb.width / 2;
  const cy = bb.minY + bb.height / 2;

  const rotated = vertices.map((v) => ({
    x: Math.round(cx + (v.y - cy)),
    y: Math.round(cy - (v.x - cx)),
  }));

  const rbb = verticesBoundingBox(rotated);
  return rotated.map((v) => ({
    x: v.x - rbb.minX,
    y: v.y - rbb.minY,
  }));
}
