import type { RoomVertex, SubSpace } from '../types/room';

/** Ray-casting point-in-polygon. Works for any simple polygon including diagonal walls. */
export function pointInPolygon(px: number, py: number, poly: RoomVertex[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]!.x, yi = poly[i]!.y;
    const xj = poly[j]!.x, yj = poly[j]!.y;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Check whether a rectangle fits fully inside a polygon.
 * Tests 4 corners + 4 edge midpoints for better accuracy near diagonal walls.
 */
export function rectInsidePolygon(
  left: number, top: number, w: number, h: number,
  poly: RoomVertex[],
): boolean {
  const pts: [number, number][] = [
    [left, top], [left + w, top], [left + w, top + h], [left, top + h],
    [left + w / 2, top], [left + w, top + h / 2],
    [left + w / 2, top + h], [left, top + h / 2],
  ];
  return pts.every(([x, y]) => pointInPolygon(x!, y!, poly));
}

/** Check whether two axis-aligned rectangles overlap. */
export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Full placement validation: does the zone fit inside the room AND not overlap other zones?
 * Returns false → caller snaps the zone back to its previous position.
 */
export function isZonePlacementValid(
  zoneX: number, zoneY: number, zoneW: number, zoneH: number,
  roomVertices: RoomVertex[],
  otherZones: SubSpace[],
  excludeId?: string,
): boolean {
  if (!rectInsidePolygon(zoneX, zoneY, zoneW, zoneH, roomVertices)) return false;
  for (const z of otherZones) {
    if (z.id === excludeId) continue;
    if (rectsOverlap(zoneX, zoneY, zoneW, zoneH, z.position.x, z.position.y, z.width, z.length)) {
      return false;
    }
  }
  return true;
}
