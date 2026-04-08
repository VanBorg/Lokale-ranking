import type { RoomVertex, RoomPreset } from '../types/room';
import { verticesBoundingBox } from './geometry';

/** Same viewBox as `PresetPicker` icons (0–40), so floor shapes match the buttons. */
const ICON = 40;

/** Split a length (cm) into three near-equal integer parts (e.g. 1000 → 333, 333, 334). */
function splitThirdsCm(total: number): [number, number, number] {
  const a = Math.floor(total / 3);
  const b = Math.floor((total - a) / 2);
  const c = total - a - b;
  return [a, b, c];
}

/**
 * Thirds with remainder on the **middle** band (e.g. 1000 → 333, 334, 333).
 * Used for the + preset so outer-arm walls A, D, G, J (edges 0,3,6,9 clockwise from top) are 3.34 m
 * and the other eight walls 3.33 m at 10 m × 10 m.
 */
function splitThirdsMiddleCm(total: number): [number, number, number] {
  const base = Math.floor(total / 3);
  const r = total - base * 3;
  if (r === 0) return [base, base, base];
  if (r === 1) return [base, base + 1, base];
  return [base, base + 2, base];
}

/**
 * Swiss-cross “+” in a W×L box: grid lines at third splits so wall lengths are only those
 * three values (no 3.75 m vs 3.125 m mix from asymmetric icon stretch).
 */
function createPlusVerticesCm(W: number, L: number): RoomVertex[] {
  const [wx1, wx2] = splitThirdsMiddleCm(W);
  const [hy1, hy2] = splitThirdsMiddleCm(L);
  const x0 = 0;
  const x1 = wx1;
  const x2 = wx1 + wx2;
  const x3 = W;
  const y0 = 0;
  const y1 = hy1;
  const y2 = hy1 + hy2;
  const y3 = L;
  return [
    { x: x1, y: y0 },
    { x: x2, y: y0 },
    { x: x2, y: y1 },
    { x: x3, y: y1 },
    { x: x3, y: y2 },
    { x: x2, y: y2 },
    { x: x2, y: y3 },
    { x: x1, y: y3 },
    { x: x1, y: y2 },
    { x: x0, y: y2 },
    { x: x0, y: y1 },
    { x: x1, y: y1 },
  ];
}

/**
 * U opening upward: top edges A (left cap), C (inner base), E (right cap) use `splitThirdsMiddleCm(W)`
 * so C is the middle third (3.34 m at 10 m) and A & E are 3.33 m each. Inner legs B and D each
 * have length L/2 (5 m at 10 m). Clockwise from top-left: A→B→C→D→E→outer.
 */
function createUShapeVerticesCm(W: number, L: number): RoomVertex[] {
  const [w1, wMid] = splitThirdsMiddleCm(W);
  const h = Math.floor(L / 2);
  const xL = w1;
  const xR = w1 + wMid;
  return [
    { x: 0, y: 0 },
    { x: xL, y: 0 },
    { x: xL, y: h },
    { x: xR, y: h },
    { x: xR, y: 0 },
    { x: W, y: 0 },
    { x: W, y: L },
    { x: 0, y: L },
  ];
}

/**
 * T: top outer edge in three parts 3.33 + 3.34 + 3.33 m; four outer verticals each L/2 (5 m at 10 m);
 * stem width = middle third. Clockwise from top-left.
 */
function createTShapeVerticesCm(W: number, L: number): RoomVertex[] {
  const [w1, wMid] = splitThirdsMiddleCm(W);
  const h = Math.floor(L / 2);
  const xL = w1;
  const xR = w1 + wMid;
  return [
    { x: 0, y: 0 },
    { x: xL, y: 0 },
    { x: xR, y: 0 },
    { x: W, y: 0 },
    { x: W, y: h },
    { x: xR, y: h },
    { x: xR, y: L },
    { x: xL, y: L },
    { x: xL, y: h },
    { x: 0, y: h },
  ];
}

/** Isosceles trapezium: top = W/2 (5 m at 10 m), bottom = W (10 m); slanted sides follow. */
function createTrapezoidVerticesCm(W: number, L: number): RoomVertex[] {
  const topW = Math.floor(W / 2);
  const xL = Math.floor((W - topW) / 2);
  const xR = xL + topW;
  return [
    { x: xL, y: 0 },
    { x: xR, y: 0 },
    { x: W, y: L },
    { x: 0, y: L },
  ];
}

/**
 * Symmetric “house” pentagon: apex at top centre; left/right vertical edges each L/2 (5 m at 10 m);
 * roof slopes from (0, L/2) and (W, L/2) to apex; total height L (10 m).
 */
function createPentagonVerticesCm(W: number, L: number): RoomVertex[] {
  const h = Math.floor(L / 2);
  const xc = Math.floor(W / 2);
  return [
    { x: xc, y: 0 },
    { x: W, y: h },
    { x: W, y: L },
    { x: 0, y: L },
    { x: 0, y: h },
  ];
}

/**
 * Symmetric hex: apex at top and bottom centre; left/right verticals each L/2 (5 m at 10 m);
 * slanted edges connect; total height L.
 */
function createHexagonVerticesCm(W: number, L: number): RoomVertex[] {
  const vLen = Math.floor(L / 2);
  const yTop = Math.floor((L - vLen) / 2);
  const yBot = yTop + vLen;
  const xc = Math.floor(W / 2);
  return [
    { x: xc, y: 0 },
    { x: W, y: yTop },
    { x: W, y: yBot },
    { x: xc, y: L },
    { x: 0, y: yBot },
    { x: 0, y: yTop },
  ];
}

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

    // PresetPicker: symmetric notch so horizontal + vertical “stair” arms are ½ bbox (5 m + 5 m at 10 m).
    // (22,22) would give 18+14 icon units → ~5.63 m + ~4.37 m after stretch.
    case 'l-shape':
      return fromIconShape(
        [
          [4, 4],
          [20, 4],
          [20, 20],
          [36, 20],
          [36, 36],
          [4, 36],
        ],
        W,
        L,
      );

    // Third-based + (see `createPlusVerticesCm`) — icon below matches 10 m × 10 m proportions.
    case 'plus':
      return createPlusVerticesCm(W, L);

    // U: A,E = 3.33 m; C = 3.34 m; B,D = 5 m each at 10 m × 10 m (see `createUShapeVerticesCm`).
    case 'u-shape':
      return createUShapeVerticesCm(W, L);

    // T: see `createTShapeVerticesCm`
    case 't-shape':
      return createTShapeVerticesCm(W, L);

    case 'trapezoid':
      return createTrapezoidVerticesCm(W, L);

    case 'pentagon':
      return createPentagonVerticesCm(W, L);

    case 'hexagon':
      return createHexagonVerticesCm(W, L);
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
