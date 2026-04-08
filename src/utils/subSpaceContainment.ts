import type { RoomVertex, SubSpace, ZonePlacementMode } from '../types/room';
import { snapCmForRoomVertex } from './geometry';

const EPS = 0.0001;

const pointOnSegment = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  const cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  if (Math.abs(cross) > EPS) return false;
  const dot = (px - ax) * (bx - ax) + (py - ay) * (by - ay);
  if (dot < -EPS) return false;
  const lenSq = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (dot - lenSq > EPS) return false;
  return true;
};

const polygonSignedArea = (poly: RoomVertex[]): number => {
  let sum = 0;
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
};

const isClockwise = (poly: RoomVertex[]): boolean => polygonSignedArea(poly) < 0;

const normalize = (x: number, y: number) => {
  const len = Math.sqrt(x * x + y * y) || 1;
  return { x: x / len, y: y / len };
};

const closestPointOnSegment = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  const abx = bx - ax;
  const aby = by - ay;
  const abLenSq = abx * abx + aby * aby || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
  return { x: ax + abx * t, y: ay + aby * t };
};

const pointInRectStrict = (px: number, py: number, left: number, top: number, w: number, h: number) =>
  px > left + EPS && px < left + w - EPS && py > top + EPS && py < top + h - EPS;

const orientation = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
  const val = (by - ay) * (cx - bx) - (bx - ax) * (cy - by);
  if (Math.abs(val) < EPS) return 0;
  return val > 0 ? 1 : 2;
};

const segmentsProperlyIntersect = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
) => {
  const o1 = orientation(ax, ay, bx, by, cx, cy);
  const o2 = orientation(ax, ay, bx, by, dx, dy);
  const o3 = orientation(cx, cy, dx, dy, ax, ay);
  const o4 = orientation(cx, cy, dx, dy, bx, by);
  return o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 && o1 !== o2 && o3 !== o4;
};

/** Ray-casting point-in-polygon. Works for any simple polygon including diagonal walls. */
export function pointInPolygon(px: number, py: number, poly: RoomVertex[]): boolean {
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]!.x, yi = poly[i]!.y;
    const xj = poly[j]!.x, yj = poly[j]!.y;
    if (pointOnSegment(px, py, xi, yi, xj, yj)) return true;
  }
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

const pointInPolygonStrict = (px: number, py: number, poly: RoomVertex[]): boolean => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]!.x, yi = poly[i]!.y;
    const xj = poly[j]!.x, yj = poly[j]!.y;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

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

/** Check whether a rectangle is fully outside the polygon and does not cross any edge. */
export function rectOutsidePolygon(
  left: number, top: number, w: number, h: number,
  poly: RoomVertex[],
): boolean {
  const rectPts: [number, number][] = [
    [left, top], [left + w, top], [left + w, top + h], [left, top + h],
    [left + w / 2, top], [left + w, top + h / 2],
    [left + w / 2, top + h], [left, top + h / 2],
  ];
  if (rectPts.some(([x, y]) => pointInPolygonStrict(x, y, poly))) return false;
  if (poly.some((v) => pointInRectStrict(v.x, v.y, left, top, w, h))) return false;

  const rectEdges: [number, number, number, number][] = [
    [left, top, left + w, top],
    [left + w, top, left + w, top + h],
    [left + w, top + h, left, top + h],
    [left, top + h, left, top],
  ];
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    for (const [x1, y1, x2, y2] of rectEdges) {
      if (segmentsProperlyIntersect(x1, y1, x2, y2, a.x, a.y, b.x, b.y)) {
        return false;
      }
    }
  }
  return true;
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
  mode: ZonePlacementMode = 'binnen',
): boolean {
  if (mode === 'binnen' && !rectInsidePolygon(zoneX, zoneY, zoneW, zoneH, roomVertices)) {
    return false;
  }
  if (mode === 'buiten' && !rectOutsidePolygon(zoneX, zoneY, zoneW, zoneH, roomVertices)) {
    return false;
  }
  for (const z of otherZones) {
    if (z.id === excludeId) continue;
    if (rectsOverlap(zoneX, zoneY, zoneW, zoneH, z.position.x, z.position.y, z.width, z.length)) {
      return false;
    }
  }
  return true;
}

export function getZoneWallSnapPosition(
  zoneX: number,
  zoneY: number,
  zoneW: number,
  zoneH: number,
  roomVertices: RoomVertex[],
  mode: ZonePlacementMode,
): { x: number; y: number } {
  // 'vrij' and 'binnen': no wall-snap — grid-snap only so the zone follows the cursor freely.
  // 'binnen' is validated on drop via isZonePlacementValid; snapping to walls during drag
  // would prevent placing zones away from walls, which is not the intent.
  if (mode === 'vrij' || mode === 'binnen' || roomVertices.length < 2) {
    return { x: snapCmForRoomVertex(zoneX), y: snapCmForRoomVertex(zoneY) };
  }

  // 'buiten': snap zone to the outside of the nearest wall that yields a *valid* position.
  const centre = { x: zoneX + zoneW / 2, y: zoneY + zoneH / 2 };
  const clockwise = isClockwise(roomVertices);
  let best = {
    x: snapCmForRoomVertex(zoneX),
    y: snapCmForRoomVertex(zoneY),
    dist: Number.POSITIVE_INFINITY,
    valid: false,
  };

  for (let i = 0; i < roomVertices.length; i += 1) {
    const v1 = roomVertices[i]!;
    const v2 = roomVertices[(i + 1) % roomVertices.length]!;
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    const inward = clockwise ? normalize(dy, -dx) : normalize(-dy, dx);
    // outward normal for buiten
    const normal = { x: -inward.x, y: -inward.y };
    const closest = closestPointOnSegment(centre.x, centre.y, v1.x, v1.y, v2.x, v2.y);
    const support = Math.abs(normal.x) * (zoneW / 2) + Math.abs(normal.y) * (zoneH / 2);
    const cx = closest.x + normal.x * support;
    const cy = closest.y + normal.y * support;
    const candX = snapCmForRoomVertex(cx - zoneW / 2);
    const candY = snapCmForRoomVertex(cy - zoneH / 2);
    const isValid = rectOutsidePolygon(candX, candY, zoneW, zoneH, roomVertices);
    const dist = (candX + zoneW / 2 - centre.x) ** 2 + (candY + zoneH / 2 - centre.y) ** 2;
    // Prefer valid positions; among equal-validity pick the closest.
    if ((!best.valid && isValid) || (best.valid === isValid && dist < best.dist)) {
      best = { x: candX, y: candY, dist, valid: isValid };
    }
  }

  return { x: best.x, y: best.y };
}

/**
 * Compute the new position/size when a resize handle is dragged.
 * handleLocalX/Y = handle centre position in cm within the zone's local coordinate space.
 * Extracted from RoomPreview so ZoneLayer can import it directly.
 */
export function getResizeUpdate(
  space: SubSpace,
  handleLocalX: number,
  handleLocalY: number,
  corner: 'tl' | 'tr' | 'bl' | 'br',
  minZoneSize = 10,
): { position: { x: number; y: number }; width: number; length: number } {
  const originX = space.position.x;
  const originY = space.position.y;
  const anchorX = originX + space.width;
  const anchorY = originY + space.length;
  let nextX = originX;
  let nextY = originY;
  let nextW = space.width;
  let nextH = space.length;

  if (corner === 'tl') {
    nextX = originX + handleLocalX;
    nextY = originY + handleLocalY;
    nextW = anchorX - nextX;
    nextH = anchorY - nextY;
  } else if (corner === 'tr') {
    nextY = originY + handleLocalY;
    nextW = handleLocalX;
    nextH = anchorY - nextY;
  } else if (corner === 'bl') {
    nextX = originX + handleLocalX;
    nextW = anchorX - nextX;
    nextH = handleLocalY;
  } else {
    nextW = handleLocalX;
    nextH = handleLocalY;
  }

  if (nextW < minZoneSize) {
    nextW = minZoneSize;
    if (corner === 'tl' || corner === 'bl') nextX = anchorX - nextW;
  }
  if (nextH < minZoneSize) {
    nextH = minZoneSize;
    if (corner === 'tl' || corner === 'tr') nextY = anchorY - nextH;
  }

  return { position: { x: nextX, y: nextY }, width: nextW, length: nextH };
}
