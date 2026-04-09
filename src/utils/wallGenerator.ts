import type { RoomVertex } from '../types/room';
import type { Wall } from '../types/wall';
import { generateId } from './idGenerator';
import { edgeLength, calcSurfaceArea } from './geometry';

/**
 * Generate one wall per edge of the polygon.
 * Edge i: vertices[i] → vertices[(i+1) % n].
 * When `existingWalls` has the same length as `vertices`, each wall keeps its id
 * so lockedWallIds stay valid across vertex-drag and height changes.
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
    };
  });
}
