import { useCallback } from 'react';
import type Konva from 'konva';
import { Group, Line, Circle } from 'react-konva';
import type { RoomVertex } from '../../types/room';
import { useRoomStore } from '../../store/roomStore';
import { useUiStore } from '../../store/uiStore';
import {
  verticesToKonvaPoints,
  ROOM_CANVAS_SCALE,
  snapCmForRoomVertex,
  isVertexFrozen,
} from '../../utils/geometry';
import { snapSubRoomToParent } from '../../utils/subRoomSnap';
import { KONVA_COLORS, SUB_ROOM_TYPE_FILLS } from '../../design/konva';

interface SubRoomOverlayProps {
  parentPosition: { x: number; y: number };
  parentVertices: RoomVertex[];
  renderZoom: number;
}

export const SubRoomOverlay = ({ parentPosition, parentVertices, renderZoom }: SubRoomOverlayProps) => {
  const subRooms = useRoomStore((s) => s.draft.subRooms);
  const updatePosition = useRoomStore((s) => s.updateSubRoomPosition);
  const updateVertex = useRoomStore((s) => s.updateSubRoomVertex);
  const selectedId = useUiStore((s) => s.selectedSubRoomId);
  const selectSubRoom = useUiStore((s) => s.selectSubRoom);

  const posCmFromKonva = useCallback(
    (konvaX: number, konvaY: number) => ({
      x: Math.round((konvaX - parentPosition.x) / ROOM_CANVAS_SCALE),
      y: Math.round((konvaY - parentPosition.y) / ROOM_CANVAS_SCALE),
    }),
    [parentPosition],
  );

  return (
    <>
      {subRooms.map((sr) => {
        const isSelected = sr.id === selectedId;
        const fill = SUB_ROOM_TYPE_FILLS[sr.roomType] ?? SUB_ROOM_TYPE_FILLS.other;
        const worldX = parentPosition.x + sr.position.x * ROOM_CANVAS_SCALE;
        const worldY = parentPosition.y + sr.position.y * ROOM_CANVAS_SCALE;
        const points = verticesToKonvaPoints(sr.vertices, ROOM_CANVAS_SCALE);

        return (
          <Group
            key={sr.id}
            x={worldX}
            y={worldY}
            draggable
            onClick={() => selectSubRoom(sr.id)}
            onTap={() => selectSubRoom(sr.id)}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
              const rawCm = posCmFromKonva(e.target.x(), e.target.y());
              const snapped = snapSubRoomToParent(sr.vertices, rawCm, parentVertices);
              const snappedPx = {
                x: parentPosition.x + snapped.x * ROOM_CANVAS_SCALE,
                y: parentPosition.y + snapped.y * ROOM_CANVAS_SCALE,
              };
              e.target.position(snappedPx);
            }}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              const rawCm = posCmFromKonva(e.target.x(), e.target.y());
              const snapped = snapSubRoomToParent(sr.vertices, rawCm, parentVertices);
              updatePosition(sr.id, snapped);
              e.target.position({
                x: parentPosition.x + snapped.x * ROOM_CANVAS_SCALE,
                y: parentPosition.y + snapped.y * ROOM_CANVAS_SCALE,
              });
            }}
          >
            <Line
              points={points}
              closed
              fill={fill}
              stroke={isSelected ? KONVA_COLORS.subRoomSelectedStroke : KONVA_COLORS.subRoomStroke}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />

            {isSelected &&
              sr.vertices.map((v, i) => {
                const frozen = isVertexFrozen(i, sr.walls, sr.lockedWallIds);
                const invZ = 1 / Math.max(renderZoom, 0.2);
                return (
                  <Circle
                    key={i}
                    x={v.x * ROOM_CANVAS_SCALE}
                    y={v.y * ROOM_CANVAS_SCALE}
                    radius={10 * invZ}
                    fill={frozen ? KONVA_COLORS.vertexHandleLocked : KONVA_COLORS.vertexHandle}
                    stroke={KONVA_COLORS.vertexHandleStroke}
                    strokeWidth={2 * invZ}
                    draggable={!frozen}
                    onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
                      e.cancelBubble = true;
                      updateVertex(sr.id, i, {
                        x: snapCmForRoomVertex(e.target.x() / ROOM_CANVAS_SCALE),
                        y: snapCmForRoomVertex(e.target.y() / ROOM_CANVAS_SCALE),
                      });
                    }}
                    onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
                      e.cancelBubble = true;
                      updateVertex(sr.id, i, {
                        x: snapCmForRoomVertex(e.target.x() / ROOM_CANVAS_SCALE),
                        y: snapCmForRoomVertex(e.target.y() / ROOM_CANVAS_SCALE),
                      });
                    }}
                  />
                );
              })}
          </Group>
        );
      })}
    </>
  );
};
