/** Virtual floor plan size in canvas coordinates (matches grid). */
export const FLOOR_PLAN_CANVAS_W = 2200;
export const FLOOR_PLAN_CANVAS_H = 2200;

/** Default zoom so rooms read clearly on screen (toolbar Reset uses the same). */
export const DEFAULT_CANVAS_ZOOM = 1.25;

/** Minimum zoom — balance: not endless empty space, but map usually stays larger than viewport so pan works. */
export const MIN_CANVAS_ZOOM = 0.35;

import { KONVA_COLORS } from '../design/konva';

/** Floor-plan Konva colours — grid line only; room/wall colours live in src/design/konva.ts. */
export const CANVAS_COLORS = {
  grid: KONVA_COLORS.wallStroke,
} as const;
