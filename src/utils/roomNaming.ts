import type { Room, RoomType } from '../types/room';

/** Dutch labels shared by the wizard and auto-generated room names. */
export const ROOM_TYPE_OPTIONS: { value: RoomType; label: string }[] = [
  { value: 'bathroom', label: 'Badkamer' },
  { value: 'kitchen', label: 'Keuken' },
  { value: 'bedroom', label: 'Slaapkamer' },
  { value: 'living', label: 'Woonkamer' },
  { value: 'hallway', label: 'Gang' },
  { value: 'toilet', label: 'Toilet' },
  { value: 'laundry', label: 'Wasruimte' },
  { value: 'garage', label: 'Garage' },
  { value: 'attic', label: 'Zolder' },
  { value: 'basement', label: 'Kelder' },
  { value: 'other', label: 'Overige' },
];

export const roomTypeLabels = Object.fromEntries(
  ROOM_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<RoomType, string>;

/**
 * Next default name for a room of this type, e.g. "Woonkamer 1".
 * When editing, pass excludeRoomId so the current room is not counted.
 */
export function suggestNextRoomName(
  roomType: RoomType,
  rooms: Room[],
  excludeRoomId: string | null,
): string {
  const base = roomTypeLabels[roomType] ?? 'Ruimte';
  const n =
    rooms.filter(
      (r) => r.roomType === roomType && r.id !== excludeRoomId,
    ).length + 1;
  return `${base} ${n}`;
}
