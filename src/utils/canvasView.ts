import type { Room, RoomVertex } from '../types/room';
import { verticesBoundingBox, ROOM_CANVAS_SCALE } from './geometry';

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

/** Pan so the room's centre sits in the middle of the viewport. */
export function panToCenterRoomOnViewport(
  room: Room,
  viewportW: number,
  viewportH: number,
  zoom: number,
): { x: number; y: number } {
  const bb = verticesBoundingBox(room.vertices);
  const w = bb.width * ROOM_CANVAS_SCALE;
  const h = bb.height * ROOM_CANVAS_SCALE;
  const cx = room.position.x + w / 2;
  const cy = room.position.y + h / 2;
  return {
    x: viewportW / 2 - cx * zoom,
    y: viewportH / 2 - cy * zoom,
  };
}
