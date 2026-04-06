import { Group, Line, Text } from 'react-konva';
import type { Room } from '../../types/room';
import { useDragRoom } from '../../hooks/useDragRoom';
import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { useProjectStore } from '../../store/projectStore';
import { verticesToKonvaPoints, verticesBoundingBox, ROOM_CANVAS_SCALE } from '../../utils/geometry';

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
      <Line points={points} closed fill="#fff7ed" stroke="#f97316" strokeWidth={2} />
      <Text text={room.name || room.roomType} x={8} y={8} fontSize={14} fontStyle="bold" fill="#9a3412" />
      <Text
        text={`${Math.round(bb.width)}×${Math.round(bb.height)} cm`}
        x={8}
        y={26}
        fontSize={11}
        fill="#c2410c"
      />
    </Group>
  );
};
