import type { RoomVertex } from '../types/room';
import type { Wall } from '../types/wall';
import { generateId } from './idGenerator';
import { edgeLength, calcSurfaceArea } from './geometry';

/**
 * Generate one wall per edge of the polygon.
 * Edge i: vertices[i] → vertices[(i+1) % n].
 * Wall width = edge length (works for straight and diagonal edges).
 *
 * When `existingWalls` has the same length as `vertices`, the wall at each
 * position keeps its original id, elements, details and photos so that
 * lockedWallIds and user-entered wall data survive vertex-drag and height
 * changes.
 */
export function generateWallsFromVertices(
  vertices: RoomVertex[],
  heightCm: number,
  existingWalls: Wall[] = [],
): Wall[] {
  const n = vertices.length;
  const sameCount = existingWalls.length === n;
  return vertices.map((v, i) => {
    const next = vertices[(i + 1) % n]!;
    const width = edgeLength(v, next);
    const surfaceArea = calcSurfaceArea(width, heightCm);
    const label = `Wand ${String.fromCharCode(65 + i)}`;
    const existing = sameCount ? existingWalls[i] : undefined;
    return {
      id: existing?.id ?? generateId(),
      label,
      width,
      height: heightCm,
      surfaceArea,
      netArea: surfaceArea,
      elements: existing?.elements ?? [],
      details: existing?.details ?? [],
      photos: existing?.photos ?? [],
    };
  });
}
