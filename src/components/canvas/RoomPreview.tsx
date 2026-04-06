import { useRef } from 'react';
import type Konva from 'konva';
import { Group, Line, Rect, Text } from 'react-konva';
import type { RoomShape, SubSpace } from '../../types/room';
import {
  getRoomShapeBoundingSize,
  roomShapePoints,
  ROOM_CANVAS_SCALE,
} from '../../utils/geometry';
import {
  clampSubSpaceTopLeftCm,
  clampSubSpaceTopLeftNoOverlapCm,
  isSubSpacePlacementValid,
} from '../../utils/subSpaceContainment';
import type { WizardCanvasMode } from '../../utils/wizardCanvas';
import { WIZARD_CANVAS_OVERLAY } from '../../utils/wizardCanvas';

interface RoomPreviewProps {
  /** World coordinates (top-left of bounding box), usually viewport-centred by the parent. */
  x: number;
  y: number;
  draft: {
    name: string;
    roomType: string;
    width: number;
    length: number;
    shape: RoomShape;
    subSpaces: SubSpace[];
  };
  /** Per wizard step: what the map is for (shape vs zones vs read-only). */
  canvasMode: WizardCanvasMode;
  onSubSpacePositionChange?: (
    id: string,
    position: { x: number; y: number },
  ) => void;
}

export const RoomPreview = ({
  x,
  y,
  draft,
  canvasMode,
  onSubSpacePositionChange,
}: RoomPreviewProps) => {
  const interactiveSubSpaces = canvasMode === 'sub-space-layout';
  const overlayLabel = WIZARD_CANVAS_OVERLAY[canvasMode];
  const groupRef = useRef<Konva.Group | null>(null);
  const points = roomShapePoints(
    draft.shape,
    draft.width,
    draft.length,
    ROOM_CANVAS_SCALE,
  );

  const { h: roomBoxH } = getRoomShapeBoundingSize(
    draft.shape,
    draft.width,
    draft.length,
    ROOM_CANVAS_SCALE,
  );

  const groupOpacity =
    canvasMode === 'walls-preview' ||
    canvasMode === 'overview-preview' ||
    canvasMode === 'floor-ceiling-preview'
      ? 0.45
      : 0.55;

  const roomOutlineSolid = canvasMode === 'sub-space-layout';

  const clampSubSpaceCanvasPos = (
    pos: { x: number; y: number },
    shape: RoomShape,
    roomWidthCm: number,
    roomLengthCm: number,
    subWcm: number,
    subLcm: number,
  ): { x: number; y: number } => {
    const leftCm = pos.x / ROOM_CANVAS_SCALE;
    const topCm = pos.y / ROOM_CANVAS_SCALE;
    const c = clampSubSpaceTopLeftCm(
      shape,
      roomWidthCm,
      roomLengthCm,
      subWcm,
      subLcm,
      leftCm,
      topCm,
    );
    return { x: c.x * ROOM_CANVAS_SCALE, y: c.y * ROOM_CANVAS_SCALE };
  };

  return (
    <Group ref={groupRef} x={x} y={y} opacity={groupOpacity} listening>
      <Line
        listening={false}
        points={points}
        closed
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth={roomOutlineSolid ? 3 : 2.5}
        dash={roomOutlineSolid ? undefined : [8, 4]}
      />

      {draft.subSpaces.map((s) => (
        <Rect
          key={s.id}
          x={s.position.x * ROOM_CANVAS_SCALE}
          y={s.position.y * ROOM_CANVAS_SCALE}
          width={s.width * ROOM_CANVAS_SCALE}
          height={s.length * ROOM_CANVAS_SCALE}
          fill="#fde68a"
          stroke="#d97706"
          strokeWidth={1}
          hitStrokeWidth={20}
          dash={[4, 2]}
          opacity={interactiveSubSpaces ? 0.85 : 0.55}
          listening={interactiveSubSpaces}
          draggable={interactiveSubSpaces}
          cursor={interactiveSubSpaces ? 'move' : 'default'}
          onDragStart={(e) => {
            if (!interactiveSubSpaces) return;
            e.cancelBubble = true;
            (e.target as { dragStartCm?: { x: number; y: number } }).dragStartCm = {
              x: s.position.x,
              y: s.position.y,
            };
          }}
          dragBoundFunc={(pos) =>
            (() => {
              const stage = groupRef.current?.getStage?.();
              const stageScaleX = stage?.scaleX?.() ?? null;
              const stageScaleY = stage?.scaleY?.() ?? null;
              const groupAbs = groupRef.current?.getAbsolutePosition?.() ?? null;
              const localX =
                groupAbs && stageScaleX
                  ? (pos.x - groupAbs.x) / stageScaleX
                  : null;
              const localY =
                groupAbs && stageScaleY
                  ? (pos.y - groupAbs.y) / stageScaleY
                  : null;
              const nextLocal =
                localX !== null && localY !== null
                  ? clampSubSpaceCanvasPos(
                      { x: localX, y: localY },
                      draft.shape,
                      draft.width,
                      draft.length,
                      s.width,
                      s.length,
                    )
                  : clampSubSpaceCanvasPos(
                      pos,
                      draft.shape,
                      draft.width,
                      draft.length,
                      s.width,
                      s.length,
                    );
              const next =
                groupAbs && stageScaleX && stageScaleY
                  ? {
                      x: groupAbs.x + nextLocal.x * stageScaleX,
                      y: groupAbs.y + nextLocal.y * stageScaleY,
                    }
                  : nextLocal;
              return next;
            })()
          }
          onDragEnd={(e) => {
            if (!interactiveSubSpaces || !onSubSpacePositionChange) return;
            const n = e.target;
            const stage = groupRef.current?.getStage?.();
            const stageScaleX = stage?.scaleX?.() ?? 1;
            const stageScaleY = stage?.scaleY?.() ?? 1;
            const groupAbs = groupRef.current?.getAbsolutePosition?.() ?? { x: 0, y: 0 };
            const absPos = (n as { getAbsolutePosition?: () => { x: number; y: number } })
              .getAbsolutePosition?.();
            const absX = absPos?.x ?? n.x();
            const absY = absPos?.y ?? n.y();
            const localX = (absX - groupAbs.x) / stageScaleX;
            const localY = (absY - groupAbs.y) / stageScaleY;
            const rawX = localX / ROOM_CANVAS_SCALE;
            const rawY = localY / ROOM_CANVAS_SCALE;
            const snapped = clampSubSpaceTopLeftNoOverlapCm(
              draft.shape,
              draft.width,
              draft.length,
              s.width,
              s.length,
              rawX,
              rawY,
              draft.subSpaces,
              s.id,
            );
            const valid = isSubSpacePlacementValid(
              draft.shape,
              draft.width,
              draft.length,
              s.width,
              s.length,
              snapped.x,
              snapped.y,
              draft.subSpaces,
              s.id,
            );
            if (!valid) {
              const start = (n as { dragStartCm?: { x: number; y: number } })
                .dragStartCm;
              if (start) {
                n.position({
                  x: start.x * ROOM_CANVAS_SCALE,
                  y: start.y * ROOM_CANVAS_SCALE,
                });
                onSubSpacePositionChange(s.id, start);
                return;
              }
            }
            onSubSpacePositionChange(s.id, snapped);
          }}
        />
      ))}

      <Text
        listening={false}
        text={draft.name || 'Nieuwe kamer'}
        x={8}
        y={8}
        fontSize={15}
        fontStyle="italic"
        fill="#92400e"
      />
      <Text
        listening={false}
        text={`${draft.width}×${draft.length} cm`}
        x={8}
        y={24}
        fontSize={12}
        fill="#b45309"
      />
      {overlayLabel && (
        <Text
          listening={false}
          text={overlayLabel}
          x={8}
          y={Math.max(40, roomBoxH - 36)}
          width={Math.max(120, draft.width * ROOM_CANVAS_SCALE - 16)}
          fontSize={11}
          fill="#9a3412"
        />
      )}
    </Group>
  );
};
