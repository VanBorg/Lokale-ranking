import type { Room, RoomVertex } from '../types/room';
import { getFloorPlanMapSizePx, verticesBoundingBox, ROOM_CANVAS_SCALE } from './geometry';
import { clampStagePan } from './stagePan';

/**
 * World-space top-left for the draft `RoomPreview` group so the room’s bounding-box centre
 * sits at the centre of the floor-plan map (same coordinate system as grid width/height in px).
 * Keeps the room stable when zooming/panning — unlike anchoring to the viewport centre.
 */
export function getDraftPositionCenteredOnMap(
  vertices: RoomVertex[],
  mapWidthPx: number,
  mapHeightPx: number,
): { x: number; y: number } {
  const bb = verticesBoundingBox(vertices);
  const cx = ((bb.minX + bb.maxX) / 2) * ROOM_CANVAS_SCALE;
  const cy = ((bb.minY + bb.maxY) / 2) * ROOM_CANVAS_SCALE;
  return {
    x: mapWidthPx / 2 - cx,
    y: mapHeightPx / 2 - cy,
  };
}

/** World (layer) coordinates of the draft room’s axis-aligned bbox centre — must match `pan` math (`screen = world*z + pan`). */
export function getDraftRoomCentroidWorld(
  draftPos: { x: number; y: number },
  vertices: RoomVertex[],
): { x: number; y: number } {
  const bb = verticesBoundingBox(vertices);
  return {
    x: draftPos.x + ((bb.minX + bb.maxX) / 2) * ROOM_CANVAS_SCALE,
    y: draftPos.y + ((bb.minY + bb.maxY) / 2) * ROOM_CANVAS_SCALE,
  };
}

/**
 * Pan so a world-space point appears at the viewport centre, then clamped to the virtual map.
 * Konva: screen = world * zoom + pan (same as `panToCenterRoomOnViewport` / wheel).
 */
export function getPanCenteringWorldPoint(
  worldX: number,
  worldY: number,
  viewportW: number,
  viewportH: number,
  zoom: number,
  mapContentW: number,
  mapContentH: number,
): { x: number; y: number } {
  const z = zoom > 0 ? zoom : 1;
  return clampStagePan(
    {
      x: viewportW / 2 - worldX * z,
      y: viewportH / 2 - worldY * z,
    },
    z,
    viewportW,
    viewportH,
    mapContentW,
    mapContentH,
  );
}

/** Pan that places the virtual map’s centre in the viewport centre (same as floor-plan initial view). */
export function getPanFloorPlanMapCentered(
  viewportW: number,
  viewportH: number,
  zoom: number,
): { x: number; y: number } {
  const { width: gw, height: gh } = getFloorPlanMapSizePx(viewportW, viewportH);
  return getPanCenteringWorldPoint(gw / 2, gh / 2, viewportW, viewportH, zoom, gw, gh);
}

/** Place draft vertices on the map centre and compute pan so that room’s centroid is in the viewport centre (one consistent path). */
export function centerDraftRoomInFloorPlan(
  vertices: RoomVertex[],
  viewportW: number,
  viewportH: number,
  zoom: number,
): { draftPos: { x: number; y: number }; pan: { x: number; y: number } } {
  const { width: gw, height: gh } = getFloorPlanMapSizePx(viewportW, viewportH);
  const draftPos = getDraftPositionCenteredOnMap(vertices, gw, gh);
  const { x: wx, y: wy } = getDraftRoomCentroidWorld(draftPos, vertices);
  const pan = getPanCenteringWorldPoint(wx, wy, viewportW, viewportH, zoom, gw, gh);
  return { draftPos, pan };
}

/** Zoom towards viewport centre while keeping that world point fixed (matches wheel behaviour). */
export function panAfterZoomToViewportCentre(
  oldZoom: number,
  newZoom: number,
  pan: { x: number; y: number },
  viewportW: number,
  viewportH: number,
): { x: number; y: number } {
  const anchor = { x: viewportW / 2, y: viewportH / 2 };
  const zOld = oldZoom > 0 ? oldZoom : 1;
  const zNew = newZoom > 0 ? newZoom : 1;
  const worldPoint = {
    x: (anchor.x - pan.x) / zOld,
    y: (anchor.y - pan.y) / zOld,
  };
  const nextPan = {
    x: anchor.x - worldPoint.x * zNew,
    y: anchor.y - worldPoint.y * zNew,
  };
  const { width: gw, height: gh } = getFloorPlanMapSizePx(viewportW, viewportH);
  return clampStagePan(nextPan, zNew, viewportW, viewportH, gw, gh);
}

/** Pan so the room's bbox centre sits in the middle of the viewport (works for any vertex min/max, not only min at 0). */
export function panToCenterRoomOnViewport(
  room: Room,
  viewportW: number,
  viewportH: number,
  zoom: number,
): { x: number; y: number } {
  const { width: gw, height: gh } = getFloorPlanMapSizePx(viewportW, viewportH);
  const { x: wx, y: wy } = getDraftRoomCentroidWorld(room.position, room.vertices);
  return getPanCenteringWorldPoint(wx, wy, viewportW, viewportH, zoom, gw, gh);
}
