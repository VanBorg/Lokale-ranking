import { Stage, Layer, Line, Text, Group, Rect } from 'react-konva';
import { useRoomStore } from '../../../../store/roomStore';
import { KONVA_COLORS } from '../../../../design/konva';
import { useStep2Transform } from './useStep2Transform';
import { ZoneNode } from './ZoneNode';
import type { SubSpace } from '../../../../types/room';

const WALL_LABEL_BOX = 18;

export const Step2Canvas = () => {
  const vertices = useRoomStore((s) => s.draft.vertices);
  const subSpaces = useRoomStore((s) => s.draft.subSpaces);
  const mode = useRoomStore((s) => s.draft.zonePlacementMode);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);

  const { containerRef, stageW, stageH, scale, offsetX, offsetY } = useStep2Transform(vertices);

  const konvaPoints = vertices.flatMap((v) => [
    offsetX + v.x * scale,
    offsetY + v.y * scale,
  ]);

  const wallLabels = vertices.map((v, i) => {
    const next = vertices[(i + 1) % vertices.length]!;
    const mx = offsetX + ((v.x + next.x) / 2) * scale;
    const my = offsetY + ((v.y + next.y) / 2) * scale;
    return { label: String.fromCharCode(65 + i), mx, my };
  });

  const handleUpdate = (id: string, updates: Partial<SubSpace>) => {
    updateSubSpace(id, updates);
  };

  return (
    <div ref={containerRef} className="h-full w-full">
      <Stage width={stageW} height={stageH}>
        <Layer>
          {vertices.length >= 3 && (
            <Line
              points={konvaPoints}
              closed
              fill={KONVA_COLORS.roomFill}
              stroke={KONVA_COLORS.roomStroke}
              strokeWidth={2}
            />
          )}

          {wallLabels.map(({ label, mx, my }) => (
            <Group key={label} x={mx - WALL_LABEL_BOX / 2} y={my - WALL_LABEL_BOX / 2}>
              <Rect
                width={WALL_LABEL_BOX} height={WALL_LABEL_BOX}
                fill={KONVA_COLORS.previewOverlay}
                stroke={KONVA_COLORS.roomStroke}
                strokeWidth={1}
                cornerRadius={3}
              />
              <Text
                width={WALL_LABEL_BOX} height={WALL_LABEL_BOX}
                text={label}
                fontSize={10}
                fontStyle="bold"
                fill={KONVA_COLORS.roomLabel}
                align="center"
                verticalAlign="middle"
              />
            </Group>
          ))}

          {subSpaces.map((space) => (
            <ZoneNode
              key={space.id}
              space={space}
              allSpaces={subSpaces}
              vertices={vertices}
              mode={mode}
              scale={scale}
              offsetX={offsetX}
              offsetY={offsetY}
              onUpdate={handleUpdate}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
