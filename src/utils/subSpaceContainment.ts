import type { RoomVertex, SubSpace, ZonePlacementMode } from '../types/room';
import { snapCmForRoomVertex } from './geometry';

const EPS = 0.0001;

const WALL_SNAP_DIST = 30;   // cm — how close before snapping to a room wall
const ZONE_SNAP_DIST = 20;   // cm — how close before snapping to another zone's edge
const CORNER_SNAP_DIST = 25; // cm — zone corner snaps to a room vertex when this close

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
 * Validate room-polygon containment only. Zone-on-zone overlap is allowed.
 * Returns false → caller snaps the zone back to its previous position.
 */
export function isZonePlacementValid(
  zoneX: number,
  zoneY: number,
  zoneW: number,
  zoneH: number,
  roomVertices: RoomVertex[],
  _otherZones: SubSpace[],
  _excludeId?: string,
  mode: ZonePlacementMode = 'binnen',
): boolean {
  if (mode === 'binnen') return rectInsidePolygon(zoneX, zoneY, zoneW, zoneH, roomVertices);
  if (mode === 'buiten') return rectOutsidePolygon(zoneX, zoneY, zoneW, zoneH, roomVertices);
  return true;
}

/**
 * If any zone corner is within CORNER_SNAP_DIST of a room vertex, shift the
 * zone so that corner aligns exactly with the vertex. Only the closest match
 * is applied — X and Y are snapped together so the correct corner lands on
 * the vertex.
 */
function applyCornerSnap(
  zoneX: number,
  zoneY: number,
  zoneW: number,
  zoneH: number,
  roomVertices: RoomVertex[],
): { x: number; y: number } {
  const zoneCorners = [
    { dx: 0,    dy: 0    },
    { dx: zoneW, dy: 0   },
    { dx: 0,    dy: zoneH },
    { dx: zoneW, dy: zoneH },
  ];

  let bestDist = CORNER_SNAP_DIST;
  let snapX = zoneX;
  let snapY = zoneY;
  let snapped = false;

  for (const rv of roomVertices) {
    for (const zc of zoneCorners) {
      const dist = Math.sqrt((zoneX + zc.dx - rv.x) ** 2 + (zoneY + zc.dy - rv.y) ** 2);
      if (dist < bestDist) {
        bestDist = dist;
        snapX = rv.x - zc.dx;
        snapY = rv.y - zc.dy;
        snapped = true;
      }
    }
  }

  return snapped ? { x: snapX, y: snapY } : { x: zoneX, y: zoneY };
}

function getBinnenWallSnapPosition(
  zoneX: number,
  zoneY: number,
  zoneW: number,
  zoneH: number,
  roomVertices: RoomVertex[],
): { x: number; y: number } {
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
    // inward normal — same direction as "inward" in the buiten block, before negation
    const normal = clockwise ? normalize(dy, -dx) : normalize(-dy, dx);
    const closest = closestPointOnSegment(centre.x, centre.y, v1.x, v1.y, v2.x, v2.y);
    const distToWall = Math.sqrt((centre.x - closest.x) ** 2 + (centre.y - closest.y) ** 2);
    // Only consider walls the zone centre is actually near
    if (distToWall > WALL_SNAP_DIST + Math.max(zoneW, zoneH) / 2) continue;
    const support = Math.abs(normal.x) * (zoneW / 2) + Math.abs(normal.y) * (zoneH / 2);
    const cx = closest.x + normal.x * support;
    const cy = closest.y + normal.y * support;
    const candX = snapCmForRoomVertex(cx - zoneW / 2);
    const candY = snapCmForRoomVertex(cy - zoneH / 2);
    const isValid = rectInsidePolygon(candX, candY, zoneW, zoneH, roomVertices);
    const dist = (candX + zoneW / 2 - centre.x) ** 2 + (candY + zoneH / 2 - centre.y) ** 2;
    if ((!best.valid && isValid) || (best.valid === isValid && dist < best.dist)) {
      best = { x: candX, y: candY, dist, valid: isValid };
    }
  }

  // No wall was in snap range — fall back to plain grid snap
  if (!best.valid) return { x: snapCmForRoomVertex(zoneX), y: snapCmForRoomVertex(zoneY) };

  // Corner magnet: align a zone corner to a room vertex when close enough
  const cornered = applyCornerSnap(best.x, best.y, zoneW, zoneH, roomVertices);
  if (rectInsidePolygon(cornered.x, cornered.y, zoneW, zoneH, roomVertices)) {
    return cornered;
  }
  return { x: best.x, y: best.y };
}

export function getZoneEdgeSnapPosition(
  zoneX: number,
  zoneY: number,
  zoneW: number,
  zoneH: number,
  otherZones: SubSpace[],
  excludeId?: string,
): { x: number; y: number } {
  let snapX = zoneX;
  let snapY = zoneY;
  let bestDX = ZONE_SNAP_DIST + 1;
  let bestDY = ZONE_SNAP_DIST + 1;

  for (const z of otherZones) {
    if (z.id === excludeId) continue;
    const bx = z.position.x;
    const by = z.position.y;
    const bw = z.width;
    const bh = z.length;

    // X-axis: align any of our vertical faces to any of z's vertical faces
    for (const [myFace, theirFace] of [
      [zoneX, bx] as [number, number],
      [zoneX, bx + bw] as [number, number],
      [zoneX + zoneW, bx] as [number, number],
      [zoneX + zoneW, bx + bw] as [number, number],
    ]) {
      const d = Math.abs(myFace - theirFace);
      if (d < bestDX) {
        bestDX = d;
        snapX = zoneX + (theirFace - myFace);
      }
    }

    // Y-axis: align any of our horizontal faces to any of z's horizontal faces
    for (const [myFace, theirFace] of [
      [zoneY, by] as [number, number],
      [zoneY, by + bh] as [number, number],
      [zoneY + zoneH, by] as [number, number],
      [zoneY + zoneH, by + bh] as [number, number],
    ]) {
      const d = Math.abs(myFace - theirFace);
      if (d < bestDY) {
        bestDY = d;
        snapY = zoneY + (theirFace - myFace);
      }
    }
  }

  return {
    x: snapCmForRoomVertex(bestDX <= ZONE_SNAP_DIST ? snapX : zoneX),
    y: snapCmForRoomVertex(bestDY <= ZONE_SNAP_DIST ? snapY : zoneY),
  };
}

export function getZoneWallSnapPosition(
  zoneX: number,
  zoneY: number,
  zoneW: number,
  zoneH: number,
  roomVertices: RoomVertex[],
  mode: ZonePlacementMode,
): { x: number; y: number } {
  if (mode === 'vrij' || roomVertices.length < 2) {
    return { x: snapCmForRoomVertex(zoneX), y: snapCmForRoomVertex(zoneY) };
  }
  if (mode === 'binnen') {
    return getBinnenWallSnapPosition(zoneX, zoneY, zoneW, zoneH, roomVertices);
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
