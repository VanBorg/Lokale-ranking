import type { Wall } from '../types/wall';
import type { RoomVertex } from '../types/room';

/** Pixels per cm on the floor-plan canvas. */
export const ROOM_CANVAS_SCALE = 0.72;

/**
 * Floor-plan background grid step in cm — 2 m per cell (CanvasGrid: 200 * ROOM_CANVAS_SCALE px).
 * Used for drawing the grid and viewport pan alignment only, not for room shape vertices.
 */
export const GRID_CELL_CM = 200;

export function snapCmToGrid(cm: number): number {
  return Math.round(cm / GRID_CELL_CM) * GRID_CELL_CM;
}

/**
 * Room outline vertices: snap to whole centimetres so dimensions stay realistic and are not
 * locked to the 2 m background grid.
 */
export function snapCmForRoomVertex(cm: number): number {
  return Math.round(cm);
}

export function snapVertexCmToGrid(v: RoomVertex): RoomVertex {
  return { x: snapCmForRoomVertex(v.x), y: snapCmForRoomVertex(v.y) };
}

export function snapVerticesCmToGrid(vertices: RoomVertex[]): RoomVertex[] {
  return vertices.map(snapVertexCmToGrid);
}

/** Extra grid cells beyond the visible viewport at min zoom (per axis, both sides). */
export const GRID_BUFFER_CELLS = 8;

/** Minimum grid size in cells — keeps the virtual map smaller; still room to pan past edges. */
export const GRID_MIN_CELLS = 18;

/** One grid cell in layer/world pixels (Konva coordinates). */
export function gridCellWorldPx(scale: number = ROOM_CANVAS_SCALE): number {
  return GRID_CELL_CM * scale;
}

export function snapWorldPxToGrid(px: number, scale: number = ROOM_CANVAS_SCALE): number {
  const cell = gridCellWorldPx(scale);
  return Math.round(px / cell) * cell;
}

/**
 * Konva stage pan: equal partial grid cells left/right and top/bottom at the viewport edges.
 */
export function symmetricGridPanForViewport(
  viewportW: number,
  viewportH: number,
  zoom: number,
  cellWorldPx: number = gridCellWorldPx(),
): { x: number; y: number } {
  const z = zoom > 0 ? zoom : 1;
  const worldW = viewportW / z;
  const worldH = viewportH / z;
  const rx = ((worldW % cellWorldPx) + cellWorldPx) % cellWorldPx;
  const ry = ((worldH % cellWorldPx) + cellWorldPx) % cellWorldPx;
  return {
    x: (rx / 2) * z,
    y: (ry / 2) * z,
  };
}

/**
 * Floor-plan grid dimensions in cells + cell size in world px (clampPan / CanvasGrid).
 */
export function computeGridExtentCells(
  viewportW: number,
  viewportH: number,
  zoom: number,
  bufferCells: number,
  minCells: number,
): { cols: number; rows: number; cellPx: number } {
  const cellPx = gridCellWorldPx();
  const z = zoom > 0 ? zoom : 1;
  const vw = viewportW / z;
  const vh = viewportH / z;
  const cellsW = Math.ceil(vw / cellPx);
  const cellsH = Math.ceil(vh / cellPx);
  return {
    cols: Math.max(minCells, cellsW + bufferCells),
    rows: Math.max(minCells, cellsH + bufferCells),
    cellPx,
  };
}

export const cmToM = (cm: number): number => cm / 100;

/** Whole centimetres from metres (for UI input). */
export const mToCm = (m: number): number => Math.round(m * 100);

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

export function rotateVertices90CCW(vertices: RoomVertex[]): RoomVertex[] {
  const bb = verticesBoundingBox(vertices);
  const cx = bb.minX + bb.width / 2;
  const cy = bb.minY + bb.height / 2;

  const rotated = vertices.map((v) => ({
    x: Math.round(cx - (v.y - cy)),
    y: Math.round(cy + (v.x - cx)),
  }));

  const rbb = verticesBoundingBox(rotated);
  return rotated.map((v) => ({
    x: v.x - rbb.minX,
    y: v.y - rbb.minY,
  }));
}
