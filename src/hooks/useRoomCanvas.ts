import { useCallback } from 'react';
import type Konva from 'konva';
import { DEFAULT_CANVAS_ZOOM } from '../constants/canvas';
import { useUiStore } from '../store/uiStore';

interface UseRoomCanvasOptions {
  viewportWidth: number;
  viewportHeight: number;
  contentWidth: number;
  contentHeight: number;
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
}: UseRoomCanvasOptions) => {
  const zoom = useUiStore((s) => s.canvasZoom);
  const pan = useUiStore((s) => s.canvasPan);
  const setZoom = useUiStore((s) => s.setCanvasZoom);
  const setPan = useUiStore((s) => s.setCanvasPan);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const scaleBy = 1.05;
      const newZoom =
        e.evt.deltaY < 0
          ? Math.min(zoom * scaleBy, 3)
          : Math.max(zoom / scaleBy, 0.2);
      const stage = e.target;
      if (stage.nodeType === 'Stage') {
        const center = {
          x: viewportWidth / 2,
          y: viewportHeight / 2,
        };
        const mousePointTo = {
          x: (center.x - pan.x) / zoom,
          y: (center.y - pan.y) / zoom,
        };
        const nextPan = {
          x: center.x - mousePointTo.x * newZoom,
          y: center.y - mousePointTo.y * newZoom,
        };
        setZoom(newZoom);
        setPan(clampPan(nextPan, newZoom, viewportWidth, viewportHeight, contentWidth, contentHeight));
      } else {
        setZoom(newZoom);
      }
    },
    [zoom, pan.x, pan.y, viewportWidth, viewportHeight, contentWidth, contentHeight, setZoom, setPan],
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
    setZoom(DEFAULT_CANVAS_ZOOM);
    setPan(
      clampPan(
        { x: 0, y: 0 },
        DEFAULT_CANVAS_ZOOM,
        viewportWidth,
        viewportHeight,
        contentWidth,
        contentHeight,
      ),
    );
  }, [viewportWidth, viewportHeight, contentWidth, contentHeight, setZoom, setPan]);

  return { zoom, pan, handleWheel, handleDragEnd, resetView };
};
