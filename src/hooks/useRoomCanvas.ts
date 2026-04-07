import { useCallback } from 'react';
import type Konva from 'konva';
import { MIN_CANVAS_ZOOM } from '../constants/canvas';
import { useUiStore } from '../store/uiStore';

interface UseRoomCanvasOptions {
  viewportWidth: number;
  viewportHeight: number;
  contentWidth: number;
  contentHeight: number;
  defaultZoom: number;
}

/**
 * Keeps the scaled map in view. When the map is smaller than the viewport on both axes,
 * pan must still be clamped to a range — not forced to one centre point — or drag/scroll feels broken.
 */
export const clampStagePan = (
  pan: { x: number; y: number },
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
): { x: number; y: number } => {
  const contentW = contentWidth * zoom;
  const contentH = contentHeight * zoom;

  if (contentW <= viewportWidth) {
    const maxX = Math.max(0, viewportWidth - contentW);
    if (contentH <= viewportHeight) {
      const maxY = Math.max(0, viewportHeight - contentH);
      return {
        x: Math.min(Math.max(pan.x, 0), maxX),
        y: Math.min(Math.max(pan.y, 0), maxY),
      };
    }
    return {
      x: Math.min(Math.max(pan.x, 0), maxX),
      y: Math.min(0, Math.max(viewportHeight - contentH, pan.y)),
    };
  }

  if (contentH <= viewportHeight) {
    return {
      x: Math.min(0, Math.max(viewportWidth - contentW, pan.x)),
      y: Math.min(Math.max(pan.y, 0), Math.max(0, viewportHeight - contentH)),
    };
  }

  return {
    x: Math.min(0, Math.max(viewportWidth - contentW, pan.x)),
    y: Math.min(0, Math.max(viewportHeight - contentH, pan.y)),
  };
};

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
      const zoomIntensity = 0.00085;
      const factor = Math.exp(-deltaY * zoomIntensity);
      const newZoom = Math.min(3, Math.max(MIN_CANVAS_ZOOM, oldZoom * factor));

      const pointer = stage.getPointerPosition() ?? { x: viewportWidth / 2, y: viewportHeight / 2 };
      const mousePointTo = {
        x: (pointer.x - pan.x) / oldZoom,
        y: (pointer.y - pan.y) / oldZoom,
      };
      const nextPan = {
        x: pointer.x - mousePointTo.x * newZoom,
        y: pointer.y - mousePointTo.y * newZoom,
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
    setPan(
      clampStagePan(
        { x: 0, y: 0 },
        defaultZoom,
        viewportWidth,
        viewportHeight,
        contentWidth,
        contentHeight,
      ),
    );
  }, [defaultZoom, viewportWidth, viewportHeight, contentWidth, contentHeight, setZoom, setPan]);

  return { zoom, pan, handleWheel, handleDragMove, handleDragEnd, resetView };
};
