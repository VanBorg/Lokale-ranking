import { useEffect } from 'react';
import type { RoomVertex } from '../types/room';
import { MIN_CANVAS_ZOOM } from '../constants/canvas';
import { verticesBoundingBox, ROOM_CANVAS_SCALE } from '../utils/geometry';
import { useUiStore } from '../store/uiStore';

const PADDING = 80;

/**
 * Past zoom en pan automatisch aan zodat de kamer altijd past
 * in het beschikbare canvas-gebied.
 * Alleen actief wanneer enabled=true (uitsluitend in room-outline mode, slide 1).
 */
export function useAutoZoom(
  vertices: RoomVertex[],
  canvasWidth: number,
  canvasHeight: number,
  enabled: boolean,
): void {
  const setZoom = useUiStore((s) => s.setCanvasZoom);
  const setPan = useUiStore((s) => s.setCanvasPan);

  // Do not depend on `vertices` — refitting on every drag/rescale fights the user and
  // resets pan/zoom. Only when entering edit mode or the canvas size changes.
  useEffect(() => {
    if (!enabled || vertices.length < 3) return;

    const bb = verticesBoundingBox(vertices);
    const roomW = bb.width * ROOM_CANVAS_SCALE;
    const roomH = bb.height * ROOM_CANVAS_SCALE;

    const availW = canvasWidth - PADDING * 2;
    const availH = canvasHeight - PADDING * 2;
    if (availW <= 0 || availH <= 0) return;

    const fitZoom = Math.min(availW / roomW, availH / roomH);
    const clampedZoom = Math.min(Math.max(fitZoom, MIN_CANVAS_ZOOM), 2.5);

    const panX = (canvasWidth - roomW * clampedZoom) / 2;
    const panY = (canvasHeight - roomH * clampedZoom) / 2;

    setZoom(clampedZoom);
    setPan({ x: panX, y: panY });
  }, [canvasWidth, canvasHeight, enabled, setZoom, setPan]);
}
