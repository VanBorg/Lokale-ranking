import { useEffect, useRef } from 'react';
import type { Room } from '../types/room';
import { panToCenterRoomOnViewport } from '../utils/canvasView';
import { useUiStore } from '../store/uiStore';

/**
 * Automatically pans the canvas when a new room is added:
 * - First room ever: pan + zoom to fit it.
 * - Subsequent rooms: pan to the newly added room.
 *
 * Skips the initial render so persisted rooms don't trigger a pan on load.
 */
export const useAutoRoomPan = (
  rooms: Room[],
  viewportWidth: number,
  viewportHeight: number,
  defaultZoom: number,
  lastAutoZoomRef: React.MutableRefObject<number | null>,
) => {
  const setCanvasPan = useUiStore((s) => s.setCanvasPan);
  const setCanvasZoom = useUiStore((s) => s.setCanvasZoom);
  const zoomValue = useUiStore((s) => s.canvasZoom);

  // First room added from zero → pan + fit zoom
  const prevCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevCountRef.current === null) {
      prevCountRef.current = rooms.length;
      return;
    }
    const prev = prevCountRef.current;
    prevCountRef.current = rooms.length;
    if (rooms.length !== 1 || prev !== 0) return;
    const room = rooms[0];
    if (!room) return;
    setCanvasZoom(defaultZoom);
    setCanvasPan(panToCenterRoomOnViewport(room, viewportWidth, viewportHeight, defaultZoom));
    lastAutoZoomRef.current = defaultZoom;
  }, [rooms, viewportWidth, viewportHeight, defaultZoom, setCanvasPan, setCanvasZoom, lastAutoZoomRef]);

  // Room added to existing list → pan to new room
  const prevIdsRef = useRef<string[] | null>(null);
  useEffect(() => {
    const nextIds = rooms.map((r) => r.id);
    if (prevIdsRef.current === null) {
      prevIdsRef.current = nextIds;
      return;
    }
    const prevIds = prevIdsRef.current;
    prevIdsRef.current = nextIds;
    if (nextIds.length <= prevIds.length) return;
    if (prevIds.length === 0 && nextIds.length === 1) return;
    const newRoom = rooms[rooms.length - 1];
    if (!newRoom) return;
    setCanvasPan(panToCenterRoomOnViewport(newRoom, viewportWidth, viewportHeight, zoomValue));
  }, [rooms, viewportWidth, viewportHeight, zoomValue, setCanvasPan]);
};
