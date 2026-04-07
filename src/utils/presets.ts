import type { RoomVertex, RoomPreset } from '../types/room';
import { verticesBoundingBox } from './geometry';

/** Same viewBox as `PresetPicker` icons (0–40), so floor shapes match the buttons. */
const ICON = 40;

/**
 * Scale icon coordinates to W×L cm, shift to origin, then **stretch** so the axis-aligned
 * bounding box is exactly W×L cm. Icons do not fill the full 0–40 viewBox; without this step
 * the footprint would be ~80% of the requested size and switching presets would shrink each time.
 */
function fromIconShape(
  points: readonly (readonly [number, number])[],
  W: number,
  L: number,
): RoomVertex[] {
  const verts: RoomVertex[] = points.map(([ix, iy]) => ({
    x: Math.round((ix / ICON) * W),
    y: Math.round((iy / ICON) * L),
  }));
  const bb = verticesBoundingBox(verts);
  const shifted = verts.map((v) => ({
    x: v.x - bb.minX,
    y: v.y - bb.minY,
  }));
  const inner = verticesBoundingBox(shifted);
  const wn = inner.width > 0 ? inner.width : 1;
  const hn = inner.height > 0 ? inner.height : 1;
  return shifted.map((v) => ({
    x: Math.round((v.x / wn) * W),
    y: Math.round((v.y / hn) * L),
  }));
}

/**
 * Default vertices per preset (cm, clockwise outer boundary).
 * W = width, L = length — complex presets use the same proportions as `PresetPicker` SVGs.
 */
export function createPresetVertices(
  preset: RoomPreset,
  /** Width in cm (default 10 m). */
  W = 1000,
  /** Length in cm (default 10 m). */
  L = 1000,
): RoomVertex[] {
  switch (preset) {
    // ┌────────┐
    // │        │
    // └────────┘
    case 'rectangle':
      return [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: L },
        { x: 0, y: L },
      ];

    // PresetPicker: polygon points="4,4 22,4 22,22 36,22 36,36 4,36"
    case 'l-shape':
      return fromIconShape(
        [
          [4, 4],
          [22, 4],
          [22, 22],
          [36, 22],
          [36, 36],
          [4, 36],
        ],
        W,
        L,
      );

    // PresetPicker: polygon points="14,4 26,4 26,14 36,14 36,26 26,26 26,36 14,36 14,26 4,26 4,14 14,14"
    case 'plus':
      return fromIconShape(
        [
          [14, 4],
          [26, 4],
          [26, 14],
          [36, 14],
          [36, 26],
          [26, 26],
          [26, 36],
          [14, 36],
          [14, 26],
          [4, 26],
          [4, 14],
          [14, 14],
        ],
        W,
        L,
      );

    // PresetPicker: polygon points="4,4 14,4 14,28 26,28 26,4 36,4 36,36 4,36"
    case 'u-shape':
      return fromIconShape(
        [
          [4, 4],
          [14, 4],
          [14, 28],
          [26, 28],
          [26, 4],
          [36, 4],
          [36, 36],
          [4, 36],
        ],
        W,
        L,
      );

    // PresetPicker: polygon points="4,4 36,4 36,16 24,16 24,36 16,36 16,16 4,16"
    case 't-shape':
      return fromIconShape(
        [
          [4, 4],
          [36, 4],
          [36, 16],
          [24, 16],
          [24, 36],
          [16, 36],
          [16, 16],
          [4, 16],
        ],
        W,
        L,
      );

    // PresetPicker: polygon points="10,8 30,8 36,32 4,32"
    case 'trapezoid':
      return fromIconShape(
        [
          [10, 8],
          [30, 8],
          [36, 32],
          [4, 32],
        ],
        W,
        L,
      );

    // PresetPicker: polygon points="20,8 36,16 36,36 4,36 4,16" — punt naar boven
    case 'pentagon':
      return fromIconShape(
        [
          [20, 8],
          [36, 16],
          [36, 36],
          [4, 36],
          [4, 16],
        ],
        W,
        L,
      );

    // PresetPicker: polygon points="4,8 20,4 36,8 36,32 20,36 4,32"
    case 'hexagon':
      return fromIconShape(
        [
          [4, 8],
          [20, 4],
          [36, 8],
          [36, 32],
          [20, 36],
          [4, 32],
        ],
        W,
        L,
      );
  }
}

/** Dutch labels for the preset picker UI. */
export const PRESET_LABELS: Record<RoomPreset, { label: string; desc: string }> = {
  rectangle: { label: 'Rechthoek',  desc: 'Standaard kamer' },
  'l-shape':  { label: 'L-vorm',    desc: 'Hoek uitgespaard' },
  plus:       { label: '+-vorm',    desc: 'Kruisvorm (hal)' },
  'u-shape':  { label: 'U-vorm',    desc: 'Open bovenkant' },
  't-shape':  { label: 'T-vorm',    desc: 'Smal + breed deel' },
  trapezoid:  { label: 'Trapezium', desc: 'Schuine wand (zolder)' },
  pentagon:   { label: 'Vijfhoek',  desc: 'Erkerkamer' },
  hexagon:    { label: 'Zeshoek',   desc: 'Dubbele erker' },
};
