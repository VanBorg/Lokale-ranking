import type { RoomShape } from '../types/room';

/** Room floor outline in cm; origin top-left of the shape’s bounding box (same as roomShapePoints). */
export function getRoomFloorPolygonCm(
  shape: RoomShape,
  widthCm: number,
  lengthCm: number,
): { x: number; y: number }[] {
  const W = widthCm;
  const L = lengthCm;

  if (shape === 'l-shape') {
    const halfW = W / 2;
    const halfL = L / 2;
    return [
      { x: 0, y: 0 },
      { x: W, y: 0 },
      { x: W, y: halfL },
      { x: halfW, y: halfL },
      { x: halfW, y: L },
      { x: 0, y: L },
    ];
  }

  return [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: L },
    { x: 0, y: L },
  ];
}

/** Ray-casting for a simple polygon (orthogonal room floors). */
export function pointInPolygon(
  x: number,
  y: number,
  poly: { x: number; y: number }[],
): boolean {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i]!.x;
    const yi = poly[i]!.y;
    const xj = poly[j]!.x;
    const yj = poly[j]!.y;
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export type SubSpaceRect = {
  id?: string;
  position: { x: number; y: number };
  width: number;
  length: number;
};


function rectFullyOnFloor(
  leftCm: number,
  topCm: number,
  widthCm: number,
  lengthCm: number,
  floor: { x: number; y: number }[],
): boolean {
  const r = leftCm + widthCm;
  const b = topCm + lengthCm;
  const corners: [number, number][] = [
    [leftCm, topCm],
    [r, topCm],
    [r, b],
    [leftCm, b],
  ];
  const results = corners.map(([px, py]) => ({
    x: px,
    y: py,
    inside: pointInPolygon(px, py, floor),
    onEdge: pointOnPolygonEdge(px, py, floor),
  }));
  const ok = results.every((c) => c.inside || c.onEdge);
  return ok;
}

function pointOnPolygonEdge(
  x: number,
  y: number,
  poly: { x: number; y: number }[],
): boolean {
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = poly[j]!;
    const b = poly[i]!;
    if (pointOnSegment(x, y, a.x, a.y, b.x, b.y)) return true;
  }
  return false;
}

function pointOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): boolean {
  const eps = 1e-6;
  const cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  if (Math.abs(cross) > eps) return false;
  const dot = (px - ax) * (bx - ax) + (py - ay) * (by - ay);
  if (dot < -eps) return false;
  const lenSq = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (dot - lenSq > eps) return false;
  return true;
}

function tryPlacement(
  leftCm: number,
  topCm: number,
  W: number,
  L: number,
  sw: number,
  sl: number,
  isValidPlacement: (left: number, top: number) => boolean,
): { x: number; y: number } | null {
  const xl = Math.min(Math.max(leftCm, 0), W - sw);
  const yt = Math.min(Math.max(topCm, 0), L - sl);
  if (isValidPlacement(xl, yt)) {
    return { x: xl, y: yt };
  }
  return null;
}

function dist2(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function rectsOverlap(
  aLeft: number,
  aTop: number,
  aW: number,
  aL: number,
  bLeft: number,
  bTop: number,
  bW: number,
  bL: number,
): boolean {
  const aRight = aLeft + aW;
  const aBottom = aTop + aL;
  const bRight = bLeft + bW;
  const bBottom = bTop + bL;
  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

function overlapsAny(
  leftCm: number,
  topCm: number,
  widthCm: number,
  lengthCm: number,
  others: SubSpaceRect[],
  excludeId?: string,
): boolean {
  return others.some((s) => {
    if (excludeId && s.id === excludeId) return false;
    return rectsOverlap(
      leftCm,
      topCm,
      widthCm,
      lengthCm,
      s.position.x,
      s.position.y,
      s.width,
      s.length,
    );
  });
}

export function isSubSpacePlacementValid(
  shape: RoomShape,
  roomWidthCm: number,
  roomLengthCm: number,
  subWidthCm: number,
  subLengthCm: number,
  leftCm: number,
  topCm: number,
  otherSubSpaces: SubSpaceRect[],
  excludeId?: string,
): boolean {
  const floor = getRoomFloorPolygonCm(shape, roomWidthCm, roomLengthCm);
  const overlap = overlapsAny(
    leftCm,
    topCm,
    subWidthCm,
    subLengthCm,
    otherSubSpaces,
    excludeId,
  );
  return (
    rectFullyOnFloor(leftCm, topCm, subWidthCm, subLengthCm, floor) && !overlap
  );
}

function clampSubSpaceTopLeftWithRule(
  shape: RoomShape,
  roomWidthCm: number,
  roomLengthCm: number,
  subWidthCm: number,
  subLengthCm: number,
  leftCm: number,
  topCm: number,
  isValidPlacement: (left: number, top: number) => boolean,
): { x: number; y: number } {
  const W = roomWidthCm;
  const L = roomLengthCm;
  const sw = subWidthCm;
  const sl = subLengthCm;

  if (sw <= 0 || sl <= 0 || W <= 0 || L <= 0) {
    return { x: 0, y: 0 };
  }

  const candidates: { x: number; y: number }[] = [];

  const pushIf = (left: number, top: number) => {
    const p = tryPlacement(left, top, W, L, sw, sl, isValidPlacement);
    if (p) candidates.push(p);
  };

  pushIf(leftCm, topCm);

  if (shape === 'l-shape') {
    const halfL = L / 2;
    const halfW = W / 2;
    pushIf(leftCm, Math.min(Math.max(topCm, 0), halfL - sl));
    pushIf(Math.min(Math.max(leftCm, 0), W - sw), Math.min(Math.max(topCm, 0), halfL - sl));
    pushIf(Math.min(Math.max(leftCm, 0), halfW - sw), Math.min(Math.max(topCm, halfL), L - sl));
    pushIf(Math.min(Math.max(leftCm, 0), halfW - sw), topCm);
  }

  const uniq: { x: number; y: number }[] = [];
  for (const c of candidates) {
    if (!uniq.some((u) => u.x === c.x && u.y === c.y)) uniq.push(c);
  }

  if (uniq.length > 0) {
    let best = uniq[0]!;
    let bestD = dist2(leftCm, topCm, best.x, best.y);
    for (let i = 1; i < uniq.length; i++) {
      const c = uniq[i]!;
      const d = dist2(leftCm, topCm, c.x, c.y);
      if (d < bestD) {
        best = c;
        bestD = d;
      }
    }
    return { x: Math.round(best.x), y: Math.round(best.y) };
  }

  const cx = shape === 'l-shape' ? W * 0.25 : W / 2;
  const cy = shape === 'l-shape' ? L * 0.25 : L / 2;
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const hit = tryPlacement(
      leftCm + (cx - leftCm) * t,
      topCm + (cy - topCm) * t,
      W,
      L,
      sw,
      sl,
      isValidPlacement,
    );
    if (hit) return { x: Math.round(hit.x), y: Math.round(hit.y) };
  }

  const step = Math.max(4, Math.min(20, Math.floor(Math.min(sw, sl) / 3)));
  for (let y = 0; y <= L - sl; y += step) {
    for (let x = 0; x <= W - sw; x += step) {
      if (isValidPlacement(x, y)) {
        return { x: Math.round(x), y: Math.round(y) };
      }
    }
  }

  return { x: 0, y: 0 };
}

/**
 * Clamp top-left of a sub-rectangle (cm) so the whole zone stays on walkable floor.
 * For L-shapes, zones cannot sit in the cut-out (outside the orange outline).
 */
export function clampSubSpaceTopLeftCm(
  shape: RoomShape,
  roomWidthCm: number,
  roomLengthCm: number,
  subWidthCm: number,
  subLengthCm: number,
  leftCm: number,
  topCm: number,
): { x: number; y: number } {
  const W = roomWidthCm;
  const L = roomLengthCm;
  const sw = subWidthCm;
  const sl = subLengthCm;
  const floor = getRoomFloorPolygonCm(shape, W, L);
  return clampSubSpaceTopLeftWithRule(
    shape,
    W,
    L,
    sw,
    sl,
    leftCm,
    topCm,
    (x, y) => rectFullyOnFloor(x, y, sw, sl, floor),
  );
}

/**
 * Clamp top-left of a sub-rectangle (cm) so the zone stays on floor and avoids overlaps.
 */
export function clampSubSpaceTopLeftNoOverlapCm(
  shape: RoomShape,
  roomWidthCm: number,
  roomLengthCm: number,
  subWidthCm: number,
  subLengthCm: number,
  leftCm: number,
  topCm: number,
  otherSubSpaces: SubSpaceRect[],
  excludeId?: string,
): { x: number; y: number } {
  if (!otherSubSpaces || otherSubSpaces.length === 0) {
    return clampSubSpaceTopLeftCm(
      shape,
      roomWidthCm,
      roomLengthCm,
      subWidthCm,
      subLengthCm,
      leftCm,
      topCm,
    );
  }

  const floor = getRoomFloorPolygonCm(shape, roomWidthCm, roomLengthCm);
  return clampSubSpaceTopLeftWithRule(
    shape,
    roomWidthCm,
    roomLengthCm,
    subWidthCm,
    subLengthCm,
    leftCm,
    topCm,
    (x, y) =>
      rectFullyOnFloor(x, y, subWidthCm, subLengthCm, floor) &&
      !overlapsAny(x, y, subWidthCm, subLengthCm, otherSubSpaces, excludeId),
  );
}

/** Default top-left for a new sub-zone inside walkable floor. */
export function defaultSubSpacePositionCm(
  shape: RoomShape,
  roomWidthCm: number,
  roomLengthCm: number,
  subWidthCm: number,
  subLengthCm: number,
): { x: number; y: number } {
  const W = roomWidthCm;
  const L = roomLengthCm;
  if (shape === 'l-shape') {
    const halfL = L / 2;
    if (subWidthCm <= W && subLengthCm <= halfL) {
      return clampSubSpaceTopLeftCm(shape, W, L, subWidthCm, subLengthCm, 8, 8);
    }
    return clampSubSpaceTopLeftCm(
      shape,
      W,
      L,
      subWidthCm,
      subLengthCm,
      8,
      halfL + 2,
    );
  }
  return clampSubSpaceTopLeftCm(shape, W, L, subWidthCm, subLengthCm, 10, 10);
}
