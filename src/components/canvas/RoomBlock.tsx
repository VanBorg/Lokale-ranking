import { Group, Line } from 'react-konva';
import type { Room } from '../../types/room';
import { useDragRoom } from '../../hooks/useDragRoom';
import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { useProjectStore } from '../../store/projectStore';
import { verticesToKonvaPoints, verticesBoundingBox, ROOM_CANVAS_SCALE } from '../../utils/geometry';
import { KONVA_COLORS } from '../../design/konva';
import { RoomTypeIconBox } from './RoomTypeIconBox';

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
  const iconCx = ((bb.minX + bb.maxX) / 2) * ROOM_CANVAS_SCALE;
  const iconCy = ((bb.minY + bb.maxY) / 2) * ROOM_CANVAS_SCALE;

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
      <RoomTypeIconBox cx={iconCx} cy={iconCy} roomType={room.roomType} />
    </Group>
  );
};
