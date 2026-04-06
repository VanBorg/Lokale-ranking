import { useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import type Konva from 'konva';
import { useUiStore } from '../../../../store/uiStore';
import { useRoomStore } from '../../../../store/roomStore';
import type { WallElement } from '../../../../types/wall';
import { KONVA_COLORS } from '../../../../design/konva';

const CANVAS_W = 370;
const CANVAS_H = 220;
const PADDING = 20;

const elementLabels: Record<string, string> = {
  door: 'Deur',
  window: 'Raam',
  radiator: 'Rad.',
  outlet: '⚡',
  switch: '◐',
  vent: '❑',
  pipe: '|',
  beam: '═',
  niche: '⊏',
};

export const WallCanvas = () => {
  const index = useUiStore((s) => s.activeWallIndex);
  const wall = useRoomStore((s) => s.draft.walls[index]);
  const updateElement = useRoomStore((s) => s.updateWallElement);

  const handleDragEnd = useCallback(
    (el: WallElement, scale: number) =>
      (e: Konva.KonvaEventObject<DragEvent>) => {
        if (!wall) return;
        const newX = Math.round(Math.max(0, Math.min(e.target.x() / scale, wall.width - el.width)));
        const newY = Math.round(Math.max(0, Math.min(e.target.y() / scale, wall.height - el.height)));
        updateElement(wall.id, el.id, { x: newX, y: newY });
      },
    [wall, updateElement],
  );

  if (!wall) return null;

  const scaleX = (CANVAS_W - PADDING * 2) / wall.width;
  const scaleY = (CANVAS_H - PADDING * 2) / wall.height;
  const scale = Math.min(scaleX, scaleY);

  const wallW = wall.width * scale;
  const wallH = wall.height * scale;
  const offsetX = (CANVAS_W - wallW) / 2;
  const offsetY = (CANVAS_H - wallH) / 2;

  const renderElement = (el: WallElement) => {
    const w = el.width * scale;
    const h = el.height * scale;
    const colour = KONVA_COLORS.wallElementColors[el.type] ?? '#6b7280';
    const label = elementLabels[el.type] ?? el.type;

    return (
      <Group
        key={el.id}
        x={el.x * scale}
        y={el.y * scale}
        draggable
        onDragEnd={handleDragEnd(el, scale)}
        dragBoundFunc={(pos) => {
          const stageX = offsetX;
          const stageY = offsetY;
          return {
            x: Math.max(stageX, Math.min(pos.x, stageX + wallW - w)),
            y: Math.max(stageY, Math.min(pos.y, stageY + wallH - h)),
          };
        }}
      >
        <Rect
          width={w}
          height={h}
          fill={colour}
          opacity={0.3}
          stroke={colour}
          strokeWidth={1.5}
          cornerRadius={2}
        />
        <Text
          text={label}
          x={2}
          y={2}
          fontSize={Math.max(8, Math.min(11, h - 4))}
          fill={colour}
        />
      </Group>
    );
  };

  return (
    <div className="flex justify-center rounded-lg border border-line bg-app p-1">
      <Stage width={CANVAS_W} height={CANVAS_H}>
        <Layer>
          <Rect
            x={offsetX}
            y={offsetY}
            width={wallW}
            height={wallH}
            fill={KONVA_COLORS.wallFill}
            stroke={KONVA_COLORS.wallStroke}
            strokeWidth={2}
          />
          <Group x={offsetX} y={offsetY}>
            {wall.elements.map(renderElement)}
          </Group>
          <Text
            x={offsetX}
            y={offsetY + wallH + 4}
            text={`${wall.width} × ${wall.height} cm  |  ${wall.surfaceArea} m²  |  netto ${wall.netArea} m²`}
            fontSize={10}
            fill={KONVA_COLORS.wallText}
          />
        </Layer>
      </Stage>
    </div>
  );
};
