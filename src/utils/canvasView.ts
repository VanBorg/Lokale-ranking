import type { Room, RoomShape } from '../types/room';
import { getRoomShapeBoundingSize, ROOM_CANVAS_SCALE } from './geometry';

/**
 * World-space top-left for a draft preview so its bounding box is centred in the current viewport
 * (accounts for zoom + pan while the wizard is open).
 */
export function getDraftPreviewWorldPosition(
  shape: RoomShape,
  widthCm: number,
  lengthCm: number,
  viewportW: number,
  viewportH: number,
  zoom: number,
  pan: { x: number; y: number },
): { x: number; y: number } {
  const { w, h } = getRoomShapeBoundingSize(
    shape,
    widthCm,
    lengthCm,
    ROOM_CANVAS_SCALE,
  );
  const worldCx = (viewportW / 2 - pan.x) / zoom;
  const worldCy = (viewportH / 2 - pan.y) / zoom;
  return { x: worldCx - w / 2, y: worldCy - h / 2 };
}

/** Pan values so the room’s centre sits in the middle of the viewport (Konva stage transform). */
export function panToCenterRoomOnViewport(
  room: Room,
  viewportW: number,
  viewportH: number,
  zoom: number,
): { x: number; y: number } {
  const { w, h } = getRoomShapeBoundingSize(
    room.shape,
    room.width,
    room.length,
    ROOM_CANVAS_SCALE,
  );
  const cx = room.position.x + w / 2;
  const cy = room.position.y + h / 2;
  return {
    x: viewportW / 2 - cx * zoom,
    y: viewportH / 2 - cy * zoom,
  };
}
