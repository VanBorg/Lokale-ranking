import { useCallback } from 'react';
import type Konva from 'konva';
import { useProjectStore } from '../store/projectStore';
import { snapWorldPxToGrid } from '../utils/geometry';

export const useDragRoom = (roomId: string) => {
  const updatePos = useProjectStore((s) => s.updateRoomPosition);

  const onDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      updatePos(
        roomId,
        snapWorldPxToGrid(e.target.x()),
        snapWorldPxToGrid(e.target.y()),
      );
    },
    [roomId, updatePos],
  );

  return { onDragEnd };
};
