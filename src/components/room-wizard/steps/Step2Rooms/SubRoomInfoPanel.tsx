import { useRoomStore } from '../../../../store/roomStore';
import { useUiStore } from '../../../../store/uiStore';
import { Select } from '../../../ui/Select';
import { Input } from '../../../ui/Input';
import { ROOM_TYPE_OPTIONS } from '../../../../utils/roomNaming';
import type { RoomType } from '../../../../types/room';

export const SubRoomInfoPanel = () => {
  const selectedId = useUiStore((s) => s.selectedSubRoomId);
  const subRoom = useRoomStore((s) => s.draft.subRooms.find((r) => r.id === selectedId));
  const setSubRoomName = useRoomStore((s) => s.setSubRoomName);
  const setSubRoomType = useRoomStore((s) => s.setSubRoomType);
  const setSubRoomNotes = useRoomStore((s) => s.setSubRoomNotes);

  if (!subRoom || !selectedId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted">
        Selecteer een ruimte om te bewerken
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ruimte info</p>

      <Select
        id="sub-room-type"
        label="Type"
        options={ROOM_TYPE_OPTIONS}
        value={subRoom.roomType}
        onChange={(e) => setSubRoomType(selectedId, e.target.value as RoomType)}
      />

      <Input
        id="sub-room-name"
        label="Naam"
        placeholder="Bijv. Badkamer 1"
        value={subRoom.name}
        onChange={(e) => setSubRoomName(selectedId, e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="sub-room-notes" className="text-sm font-medium text-white">
          Notities
        </label>
        <textarea
          id="sub-room-notes"
          rows={3}
          placeholder="Voeg notities toe..."
          value={subRoom.notes}
          onChange={(e) => setSubRoomNotes(selectedId, e.target.value)}
          className="w-full rounded-lg border border-line bg-app px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
        />
      </div>
    </div>
  );
};
