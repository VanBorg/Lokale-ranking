export type WallElementType =
  | 'door'
  | 'window'
  | 'radiator'
  | 'outlet'
  | 'switch'
  | 'vent'
  | 'pipe'
  | 'beam'
  | 'niche';

export type WallDetailType =
  | 'tiled'
  | 'half-tiled'
  | 'painted'
  | 'wallpaper'
  | 'damaged'
  | 'hole'
  | 'moisture'
  | 'crack'
  | 'insulated'
  | 'other';

export interface WallElement {
  id: string;
  type: WallElementType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WallDetail {
  id: string;
  type: WallDetailType;
  description?: string;
  area?: { x: number; y: number; width: number; height: number };
}

export interface Wall {
  id: string;
  label: string;
  width: number;
  height: number;
  surfaceArea: number;
  netArea: number;
  elements: WallElement[];
  details: WallDetail[];
  photos: string[];
}
