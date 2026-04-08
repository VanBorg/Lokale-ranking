import type { Wall } from './wall';

/** One corner of the room polygon (cm, relative to origin 0,0 = top-left of bounding box). */
export interface RoomVertex {
  x: number;
  y: number;
}

/**
 * Preset shapes common in Dutch housing.
 * After choosing, the user can drag any vertex freely — including making diagonal walls.
 */
export type RoomPreset =
  | 'rectangle'
  | 'l-shape'
  | 'plus'
  | 'u-shape'
  | 't-shape'
  | 'trapezoid'
  | 'pentagon'
  | 'hexagon';

export type RoomType =
  | 'bathroom'
  | 'kitchen'
  | 'bedroom'
  | 'living'
  | 'hallway'
  | 'toilet'
  | 'laundry'
  | 'garage'
  | 'attic'
  | 'basement'
  | 'other';

export type FloorType = 'tiles' | 'wood' | 'laminate' | 'concrete' | 'vinyl' | 'other';

export type CeilingType = 'plaster' | 'suspended' | 'wood' | 'concrete' | 'other';

export type ZonePlacementMode = 'binnen' | 'buiten' | 'vrij';

export interface SubSpace {
  id: string;
  name: string;
  width: number;
  length: number;
  position: { x: number; y: number };
}

export interface FloorSpec {
  type?: FloorType;
  area: number;
  notes?: string;
}

export interface CeilingSpec {
  type?: CeilingType;
  area: number;
  notes?: string;
}

export interface Room {
  id: string;
  name: string;
  roomType: RoomType;
  /** Which preset was the starting point. */
  preset: RoomPreset;
  /** The room shape as a closed polygon (clockwise, cm). */
  vertices: RoomVertex[];
  /** Ceiling height in cm. */
  height: number;
  /** One wall per edge: vertices[i] → vertices[(i+1) % n]. */
  walls: Wall[];
  subSpaces: SubSpace[];
  floor: FloorSpec;
  ceiling: CeilingSpec;
  /** Position on the project floor-plan canvas (Konva world coords). */
  position: { x: number; y: number };
}
