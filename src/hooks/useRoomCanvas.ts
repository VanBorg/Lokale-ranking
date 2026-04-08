import { useCallback } from 'react';
import type Konva from 'konva';
import { MIN_CANVAS_ZOOM } from '../constants/canvas';
import { useUiStore } from '../store/uiStore';
import { getPanFloorPlanMapCentered } from '../utils/canvasView';
import { clampStagePan } from '../utils/stagePan';

export { clampStagePan } from '../utils/stagePan';

interface UseRoomCanvasOptions {
  viewportWidth: number;
  viewportHeight: number;
  contentWidth: number;
  contentHeight: number;
  defaultZoom: number;
}

export const useRoomCanvas = ({
  viewportWidth,
  viewportHeight,
  contentWidth,
  contentHeight,
  defaultZoom,
}: UseRoomCanvasOptions) => {
  const zoom = useUiStore((s) => s.canvasZoom);
  const pan = useUiStore((s) => s.canvasPan);
  const setZoom = useUiStore((s) => s.setCanvasZoom);
  const setPan = useUiStore((s) => s.setCanvasPan);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const ev = e.evt;
      let deltaY = ev.deltaY;
      if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        deltaY *= 16;
      } else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        deltaY *= Math.max(viewportHeight, 400);
      }

      const oldZoom = zoom;
      // Smooth zoom: scale follows scroll distance (trackpads send small deltas; mice larger steps).
      const zoomIntensity = 0.0025;
      const factor = Math.exp(-deltaY * zoomIntensity);
      const newZoom = Math.min(3, Math.max(MIN_CANVAS_ZOOM, oldZoom * factor));

      // Always zoom towards the viewport centre so the map/room stays centred regardless of cursor position.
      const cx = viewportWidth / 2;
      const cy = viewportHeight / 2;
      const mousePointTo = {
        x: (cx - pan.x) / oldZoom,
        y: (cy - pan.y) / oldZoom,
      };
      const nextPan = {
        x: cx - mousePointTo.x * newZoom,
        y: cy - mousePointTo.y * newZoom,
      };

      setZoom(newZoom);
      setPan(clampStagePan(nextPan, newZoom, viewportWidth, viewportHeight, contentWidth, contentHeight));
    },
    [zoom, pan, viewportWidth, viewportHeight, contentWidth, contentHeight, setZoom, setPan],
  );

  const syncStagePan = useCallback(
    (stage: Konva.Stage) => {
      const clamped = clampStagePan(
        { x: stage.x(), y: stage.y() },
        zoom,
        viewportWidth,
        viewportHeight,
        contentWidth,
        contentHeight,
      );
      if (stage.x() !== clamped.x || stage.y() !== clamped.y) {
        stage.position(clamped);
      }
      setPan(clamped);
    },
    [zoom, viewportWidth, viewportHeight, contentWidth, contentHeight, setPan],
  );

  /** Keep store pan aligned while dragging — avoids jitter if React re-renders mid-drag. */
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target.getStage();
      if (stage) syncStagePan(stage);
    },
    [syncStagePan],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target.getStage();
      if (stage) syncStagePan(stage);
    },
    [syncStagePan],
  );

  const resetView = useCallback(() => {
    setZoom(defaultZoom);
    setPan(getPanFloorPlanMapCentered(viewportWidth, viewportHeight, defaultZoom));
  }, [defaultZoom, viewportWidth, viewportHeight, setZoom, setPan]);

  return { zoom, pan, handleWheel, handleDragMove, handleDragEnd, resetView };
};
