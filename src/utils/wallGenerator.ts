import type { RoomVertex } from '../types/room';
import type { Wall } from '../types/wall';
import { generateId } from './idGenerator';
import { edgeLength, calcSurfaceArea } from './geometry';

/**
 * Generate one wall per edge of the polygon.
 * Edge i: vertices[i] → vertices[(i+1) % n].
 * Wall width = edge length (works for straight and diagonal edges).
 */
export function generateWallsFromVertices(
  vertices: RoomVertex[],
  heightCm: number,
): Wall[] {
  const n = vertices.length;
  return vertices.map((v, i) => {
    const next = vertices[(i + 1) % n]!;
    const width = edgeLength(v, next);
    const surfaceArea = calcSurfaceArea(width, heightCm);
    const label = `Wand ${String.fromCharCode(65 + i)}`;
    return {
      id: generateId(),
      label,
      width,
      height: heightCm,
      surfaceArea,
      netArea: surfaceArea,
      elements: [],
      details: [],
      photos: [],
    };
  });
}
