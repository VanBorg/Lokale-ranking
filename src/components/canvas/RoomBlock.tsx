import { Group, Line, Rect, Text } from 'react-konva';
import type { Room } from '../../types/room';
import { useDragRoom } from '../../hooks/useDragRoom';
import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { useProjectStore } from '../../store/projectStore';
import { verticesToKonvaPoints, verticesBoundingBox, ROOM_CANVAS_SCALE } from '../../utils/geometry';
import { KONVA_COLORS, KONVA_EMOJI_FONT_FAMILY, ROOM_TYPE_ICONS } from '../../design/konva';

interface RoomBlockProps {
  room: Room;
  dimmed?: boolean;
}

export const RoomBlock = ({ room, dimmed = false }: RoomBlockProps) => {
  const { onDragEnd } = useDragRoom(room.id);
  const openWizard = useUiStore((s) => s.openWizard);
  const loadRoom = useRoomStore((s) => s.loadRoom);
  const removeRoom = useProjectStore((s) => s.removeRoom);

  const points = verticesToKonvaPoints(room.vertices, ROOM_CANVAS_SCALE);
  const bb = verticesBoundingBox(room.vertices);
  const iconBoxSize = 88;
  const iconCx = ((bb.minX + bb.maxX) / 2) * ROOM_CANVAS_SCALE;
  const iconCy = ((bb.minY + bb.maxY) / 2) * ROOM_CANVAS_SCALE;
  const icon = ROOM_TYPE_ICONS[room.roomType];

  const handleDblClick = () => {
    loadRoom(room);
    openWizard();
  };

  const handleContextMenu = (e: { evt: { preventDefault: () => void } }) => {
    e.evt.preventDefault();
    if (confirm(`Kamer "${room.name || room.roomType}" verwijderen?`)) {
      removeRoom(room.id);
    }
  };

  return (
    <Group
      x={room.position.x}
      y={room.position.y}
      draggable
      onDragEnd={onDragEnd}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onContextMenu={handleContextMenu}
      opacity={dimmed ? 0.4 : 1}
    >
      <Line
        points={points}
        closed
        fill={KONVA_COLORS.roomFill}
        stroke={KONVA_COLORS.roomStroke}
        strokeWidth={2}
      />
      <Rect
        listening={false}
        x={iconCx - iconBoxSize / 2}
        y={iconCy - iconBoxSize / 2}
        width={iconBoxSize}
        height={iconBoxSize}
        fill="rgba(51,65,85,0.95)"
        cornerRadius={18}
      />
      <Text
        listening={false}
        x={iconCx - iconBoxSize / 2}
        y={iconCy - iconBoxSize / 2}
        width={iconBoxSize}
        height={iconBoxSize}
        text={icon}
        fontSize={52}
        fontFamily={KONVA_EMOJI_FONT_FAMILY}
        align="center"
        verticalAlign="middle"
        shadowColor="rgba(255,255,255,0.35)"
        shadowBlur={6}
        shadowOffset={{ x: 0, y: 0 }}
      />
    </Group>
  );
};
