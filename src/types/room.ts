import type { Wall } from './wall';

export type RoomShape = 'rectangle' | 'l-shape' | 'custom';

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
  shape: RoomShape;
  width: number;
  length: number;
  height: number;
  walls: Wall[];
  subSpaces: SubSpace[];
  floor: FloorSpec;
  ceiling: CeilingSpec;
  position: { x: number; y: number };
}
