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

const clampPan = (
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
    const centeredX = (viewportWidth - contentW) / 2;
    if (contentH <= viewportHeight) {
      return {
        x: centeredX,
        y: (viewportHeight - contentH) / 2,
      };
    }
    return {
      x: centeredX,
      y: Math.min(0, Math.max(viewportHeight - contentH, pan.y)),
    };
  }

  if (contentH <= viewportHeight) {
    return {
      x: Math.min(0, Math.max(viewportWidth - contentW, pan.x)),
      y: (viewportHeight - contentH) / 2,
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

      const scaleBy = 1.08;
      const oldZoom = zoom;
      const newZoom =
        e.evt.deltaY < 0
          ? Math.min(oldZoom * scaleBy, 3)
          : Math.max(oldZoom / scaleBy, MIN_CANVAS_ZOOM);

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
      setPan(clampPan(nextPan, newZoom, viewportWidth, viewportHeight, contentWidth, contentHeight));
    },
    [zoom, pan, viewportWidth, viewportHeight, contentWidth, contentHeight, setZoom, setPan],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target;
      if (stage.nodeType === 'Stage') {
        const clamped = clampPan(
          { x: stage.x(), y: stage.y() },
          zoom,
          viewportWidth,
          viewportHeight,
          contentWidth,
          contentHeight,
        );
        stage.position(clamped);
        setPan(clamped);
      }
    },
    [zoom, viewportWidth, viewportHeight, contentWidth, contentHeight, setPan],
  );

  const resetView = useCallback(() => {
    setZoom(defaultZoom);
    setPan(
      clampPan(
        { x: 0, y: 0 },
        defaultZoom,
        viewportWidth,
        viewportHeight,
        contentWidth,
        contentHeight,
      ),
    );
  }, [defaultZoom, viewportWidth, viewportHeight, contentWidth, contentHeight, setZoom, setPan]);

  return { zoom, pan, handleWheel, handleDragEnd, resetView };
};
