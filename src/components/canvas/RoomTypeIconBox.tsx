import { Group, Rect, Text } from 'react-konva';
import type { RoomType } from '../../types/room';
import { KONVA_EMOJI_FONT_FAMILY, ROOM_TYPE_ICONS } from '../../design/konva';

export const ROOM_ICON_BOX_SIZE = 88;
export const ROOM_ICON_FONT_SIZE = 52;

interface RoomTypeIconBoxProps {
  /** Centre X in parent-local Konva coordinates (px). */
  cx: number;
  /** Centre Y in parent-local Konva coordinates (px). */
  cy: number;
  roomType: RoomType;
  boxSize?: number;
  fontSize?: number;
}

/** Centred floor-plan badge: dark rounded square + room-type emoji (matches `RoomBlock`). */
export function RoomTypeIconBox({
  cx,
  cy,
  roomType,
  boxSize = ROOM_ICON_BOX_SIZE,
  fontSize = ROOM_ICON_FONT_SIZE,
}: RoomTypeIconBoxProps) {
  const half = boxSize / 2;
  const icon = ROOM_TYPE_ICONS[roomType];
  return (
    <Group listening={false}>
      <Rect
        x={cx - half}
        y={cy - half}
        width={boxSize}
        height={boxSize}
        fill="rgba(51,65,85,0.95)"
        cornerRadius={18}
      />
      <Text
        x={cx - half}
        y={cy - half}
        width={boxSize}
        height={boxSize}
        text={icon}
        fontSize={fontSize}
        fontFamily={KONVA_EMOJI_FONT_FAMILY}
        align="center"
        verticalAlign="middle"
        shadowColor="rgba(255,255,255,0.35)"
        shadowBlur={6}
        shadowOffset={{ x: 0, y: 0 }}
      />
    </Group>
  );
}
