import { Group, Line, Rect, Text } from 'react-konva';
import type { RoomShape, SubSpace } from '../../types/room';
import { roomShapePoints } from '../../utils/geometry';

const SCALE = 0.5;

interface RoomPreviewProps {
  draft: {
    name: string;
    roomType: string;
    width: number;
    length: number;
    shape: RoomShape;
    subSpaces: SubSpace[];
  };
}

export const RoomPreview = ({ draft }: RoomPreviewProps) => {
  const points = roomShapePoints(draft.shape, draft.width, draft.length, SCALE);

  return (
    <Group x={50} y={50} opacity={0.55} listening={false}>
      <Line
        points={points}
        closed
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth={2}
        dash={[8, 4]}
      />

      {draft.subSpaces.map((s) => (
        <Rect
          key={s.id}
          x={s.position.x * SCALE}
          y={s.position.y * SCALE}
          width={s.width * SCALE}
          height={s.length * SCALE}
          fill="#fde68a"
          stroke="#d97706"
          strokeWidth={1}
          dash={[4, 2]}
          opacity={0.6}
        />
      ))}

      <Text
        text={draft.name || 'Nieuwe kamer'}
        x={8}
        y={8}
        fontSize={13}
        fontStyle="italic"
        fill="#92400e"
      />
      <Text
        text={`${draft.width}×${draft.length} cm`}
        x={8}
        y={24}
        fontSize={10}
        fill="#b45309"
      />
    </Group>
  );
};
