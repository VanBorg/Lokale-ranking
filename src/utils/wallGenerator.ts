import type { RoomShape } from '../types/room';
import type { Wall } from '../types/wall';
import { generateId } from './idGenerator';
import { calcSurfaceArea } from './geometry';

interface WallDef {
  label: string;
  width: number;
  height: number;
}

const rectangleWalls = (w: number, l: number, h: number): WallDef[] => [
  { label: 'Noord', width: w, height: h },
  { label: 'Oost', width: l, height: h },
  { label: 'Zuid', width: w, height: h },
  { label: 'West', width: l, height: h },
];

const lShapeWalls = (w: number, l: number, h: number): WallDef[] => {
  const halfW = Math.round(w / 2);
  const halfL = Math.round(l / 2);
  return [
    { label: 'Noord', width: w, height: h },
    { label: 'Oost-boven', width: halfL, height: h },
    { label: 'Binnenhoek-horizontaal', width: halfW, height: h },
    { label: 'Binnenhoek-verticaal', width: halfL, height: h },
    { label: 'Zuid', width: halfW, height: h },
    { label: 'West', width: l, height: h },
  ];
};

const createWall = (def: WallDef): Wall => {
  const surfaceArea = calcSurfaceArea(def.width, def.height);
  return {
    id: generateId(),
    label: def.label,
    width: def.width,
    height: def.height,
    surfaceArea,
    netArea: surfaceArea,
    elements: [],
    details: [],
    photos: [],
  };
};

const customWalls = (w: number, l: number, h: number, count: number): WallDef[] => {
  const perimeter = 2 * (w + l);
  const avgWidth = Math.round(perimeter / count);
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  return Array.from({ length: count }, (_, i) => ({
    label: `Wand ${labels[i] ?? i + 1}`,
    width: avgWidth,
    height: h,
  }));
};

export const generateWalls = (
  shape: RoomShape,
  width: number,
  length: number,
  height: number,
  customWallCount?: number,
): Wall[] => {
  let defs: WallDef[];
  if (shape === 'l-shape') {
    defs = lShapeWalls(width, length, height);
  } else if (shape === 'custom' && customWallCount && customWallCount > 0) {
    defs = customWalls(width, length, height, customWallCount);
  } else {
    defs = rectangleWalls(width, length, height);
  }
  return defs.map(createWall);
};
