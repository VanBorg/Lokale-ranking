import { useCallback } from 'react';
import type Konva from 'konva';
import { useProjectStore } from '../store/projectStore';

export const useDragRoom = (roomId: string) => {
  const updatePos = useProjectStore((s) => s.updateRoomPosition);

  const onDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      updatePos(roomId, e.target.x(), e.target.y());
    },
    [roomId, updatePos],
  );

  return { onDragEnd };
};
