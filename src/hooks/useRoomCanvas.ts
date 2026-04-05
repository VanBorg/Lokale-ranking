import { useCallback } from 'react';
import type Konva from 'konva';
import { useUiStore } from '../store/uiStore';

export const useRoomCanvas = () => {
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
      setZoom(newZoom);
    },
    [zoom, setZoom],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target;
      if (stage.nodeType === 'Stage') {
        setPan({ x: stage.x(), y: stage.y() });
      }
    },
    [setPan],
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [setZoom, setPan]);

  return { zoom, pan, handleWheel, handleDragEnd, resetView };
};
