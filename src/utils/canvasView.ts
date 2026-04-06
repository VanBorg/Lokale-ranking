import type { Room, RoomVertex } from '../types/room';
import { verticesBoundingBox, ROOM_CANVAS_SCALE } from './geometry';

/**
 * World-space top-left for a draft preview: room bbox centre = viewport centre.
 */
export function getDraftPreviewWorldPosition(
  vertices: RoomVertex[],
  viewportW: number,
  viewportH: number,
  zoom: number,
  pan: { x: number; y: number },
): { x: number; y: number } {
  const bb = verticesBoundingBox(vertices);
  const w = bb.width * ROOM_CANVAS_SCALE;
  const h = bb.height * ROOM_CANVAS_SCALE;
  const z = zoom > 0 ? zoom : 1;
  const worldCx = (viewportW / 2 - pan.x) / z;
  const worldCy = (viewportH / 2 - pan.y) / z;
  return {
    x: worldCx - w / 2,
    y: worldCy - h / 2,
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
