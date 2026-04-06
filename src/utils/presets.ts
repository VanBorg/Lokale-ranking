import type { RoomVertex, RoomPreset } from '../types/room';

/**
 * Default vertices per preset (cm, clockwise from top-left of bounding box).
 * W = width, L = length — the user can adjust any vertex after choosing.
 */
export function createPresetVertices(
  preset: RoomPreset,
  W = 400,
  L = 300,
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

    // ┌────────┐
    // │        │
    // │   ┌────┘
    // │   │
    // └───┘
    case 'l-shape':
      return [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: Math.round(L * 0.5) },
        { x: Math.round(W * 0.5), y: Math.round(L * 0.5) },
        { x: Math.round(W * 0.5), y: L },
        { x: 0, y: L },
      ];

    //    ┌───┐
    // ┌──┘   └──┐
    // │         │    Kruisvorm: hal, overloop
    // └──┐   ┌──┘
    //    └───┘
    case 'plus':
      return [
        { x: Math.round(W * 0.3), y: 0 },
        { x: Math.round(W * 0.7), y: 0 },
        { x: Math.round(W * 0.7), y: Math.round(L * 0.3) },
        { x: W, y: Math.round(L * 0.3) },
        { x: W, y: Math.round(L * 0.7) },
        { x: Math.round(W * 0.7), y: Math.round(L * 0.7) },
        { x: Math.round(W * 0.7), y: L },
        { x: Math.round(W * 0.3), y: L },
        { x: Math.round(W * 0.3), y: Math.round(L * 0.7) },
        { x: 0, y: Math.round(L * 0.7) },
        { x: 0, y: Math.round(L * 0.3) },
        { x: Math.round(W * 0.3), y: Math.round(L * 0.3) },
      ];

    // ┌───┐   ┌───┐
    // │   │   │   │
    // │   └───┘   │
    // │           │
    // └───────────┘
    case 'u-shape':
      return [
        { x: 0, y: 0 },
        { x: Math.round(W * 0.3), y: 0 },
        { x: Math.round(W * 0.3), y: Math.round(L * 0.5) },
        { x: Math.round(W * 0.7), y: Math.round(L * 0.5) },
        { x: Math.round(W * 0.7), y: 0 },
        { x: W, y: 0 },
        { x: W, y: L },
        { x: 0, y: L },
      ];

    //    ┌───┐
    //    │   │
    // ┌──┘   └──┐
    // │         │
    // └─────────┘
    case 't-shape':
      return [
        { x: Math.round(W * 0.3), y: 0 },
        { x: Math.round(W * 0.7), y: 0 },
        { x: Math.round(W * 0.7), y: Math.round(L * 0.35) },
        { x: W, y: Math.round(L * 0.35) },
        { x: W, y: L },
        { x: 0, y: L },
        { x: 0, y: Math.round(L * 0.35) },
        { x: Math.round(W * 0.3), y: Math.round(L * 0.35) },
      ];

    // ┌────────┐
    //  \        \
    //   └────────┘
    case 'trapezoid':
      return [
        { x: Math.round(W * 0.15), y: 0 },
        { x: Math.round(W * 0.85), y: 0 },
        { x: W, y: L },
        { x: 0, y: L },
      ];

    //     /\
    //    /  \
    //   /    \
    //  │      │
    //  └──────┘
    case 'pentagon':
      return [
        { x: Math.round(W * 0.5), y: 0 },
        { x: W, y: Math.round(L * 0.35) },
        { x: W, y: L },
        { x: 0, y: L },
        { x: 0, y: Math.round(L * 0.35) },
      ];

    //    /──\
    //   /    \
    //  │      │
    //  │      │
    //   \    /
    //    \──/
    case 'hexagon':
      return [
        { x: Math.round(W * 0.25), y: 0 },
        { x: Math.round(W * 0.75), y: 0 },
        { x: W, y: Math.round(L * 0.25) },
        { x: W, y: Math.round(L * 0.75) },
        { x: Math.round(W * 0.75), y: L },
        { x: Math.round(W * 0.25), y: L },
      ];
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
