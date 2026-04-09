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
  /** Which preset was used to seed the polygon; vertices may be edited freely afterwards. */
  preset: RoomPreset;
  vertices: RoomVertex[];
  height: number;
  walls: Wall[];
  floor: FloorSpec;
  ceiling: CeilingSpec;
  position: { x: number; y: number };
}
