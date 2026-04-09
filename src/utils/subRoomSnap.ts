import type { RoomVertex } from '../types/room';

interface SnapCandidate {
  offsetX: number;
  offsetY: number;
}

/**
 * Perpendicular (signed) distance from `point` to the infinite line through `a`→`b`.
 * Positive = left of the line direction.
 */
function perpDistToLine(point: RoomVertex, a: RoomVertex, b: RoomVertex): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return Infinity;
  return (dx * (point.y - a.y) - dy * (point.x - a.x)) / len;
}

/** Unit normal of edge a→b (pointing left / inward for CW polygons). */
function edgeNormal(a: RoomVertex, b: RoomVertex): { nx: number; ny: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return { nx: 0, ny: 0 };
  return { nx: -dy / len, ny: dx / len };
}

/** Check whether projections of two edges onto their shared direction overlap. */
function edgesOverlap(
  a1: RoomVertex, a2: RoomVertex,
  b1: RoomVertex, b2: RoomVertex,
): boolean {
  const dx = a2.x - a1.x;
  const dy = a2.y - a1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return false;
  const ux = dx / len;
  const uy = dy / len;
  const projA1 = a1.x * ux + a1.y * uy;
  const projA2 = a2.x * ux + a2.y * uy;
  const projB1 = b1.x * ux + b1.y * uy;
  const projB2 = b2.x * ux + b2.y * uy;
  const aMin = Math.min(projA1, projA2);
  const aMax = Math.max(projA1, projA2);
  const bMin = Math.min(projB1, projB2);
  const bMax = Math.max(projB1, projB2);
  return aMax > bMin && bMax > aMin;
}

/**
 * Snap a sub-room to the nearest parent wall edges.
 * Returns the adjusted position (cm in parent space).
 */
export function snapSubRoomToParent(
  subVertices: RoomVertex[],
  subPosition: { x: number; y: number },
  parentVertices: RoomVertex[],
  threshold: number = 15,
): { x: number; y: number } {
  const absVerts = subVertices.map((v) => ({
    x: v.x + subPosition.x,
    y: v.y + subPosition.y,
  }));

  const candidates: SnapCandidate[] = [];
  const sn = subVertices.length;
  const pn = parentVertices.length;

  for (let si = 0; si < sn; si++) {
    const s1 = absVerts[si]!;
    const s2 = absVerts[(si + 1) % sn]!;
    const sdx = s2.x - s1.x;
    const sdy = s2.y - s1.y;
    const sLen = Math.hypot(sdx, sdy);
    if (sLen < 1e-9) continue;
    const sux = sdx / sLen;
    const suy = sdy / sLen;

    for (let pi = 0; pi < pn; pi++) {
      const p1 = parentVertices[pi]!;
      const p2 = parentVertices[(pi + 1) % pn]!;
      const pdx = p2.x - p1.x;
      const pdy = p2.y - p1.y;
      const pLen = Math.hypot(pdx, pdy);
      if (pLen < 1e-9) continue;
      const pux = pdx / pLen;
      const puy = pdy / pLen;

      const dot = Math.abs(sux * pux + suy * puy);
      if (dot < 0.95) continue;

      if (!edgesOverlap(s1, s2, p1, p2)) continue;

      const dist = perpDistToLine(s1, p1, p2);
      if (Math.abs(dist) > threshold) continue;

      const { nx, ny } = edgeNormal(p1, p2);
      candidates.push({ offsetX: -dist * nx, offsetY: -dist * ny });
    }
  }

  if (candidates.length === 0) return subPosition;

  candidates.sort(
    (a, b) => Math.hypot(a.offsetX, a.offsetY) - Math.hypot(b.offsetX, b.offsetY),
  );
  const best = candidates[0]!;
  return {
    x: Math.round(subPosition.x + best.offsetX),
    y: Math.round(subPosition.y + best.offsetY),
  };
}
