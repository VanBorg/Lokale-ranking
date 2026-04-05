import { useRoomStore } from '../../../../store/roomStore';
import { Select } from '../../../ui/Select';
import { Input } from '../../../ui/Input';
import type { FloorType, CeilingType } from '../../../../types/room';

const floorOptions = [
  { value: '', label: '— Kies vloertype —' },
  { value: 'tiles', label: 'Tegels' },
  { value: 'wood', label: 'Hout' },
  { value: 'laminate', label: 'Laminaat' },
  { value: 'concrete', label: 'Beton' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'other', label: 'Overig' },
];

const ceilingOptions = [
  { value: '', label: '— Kies plafondtype —' },
  { value: 'plaster', label: 'Stucwerk' },
  { value: 'suspended', label: 'Verlaagd' },
  { value: 'wood', label: 'Hout' },
  { value: 'concrete', label: 'Beton' },
  { value: 'other', label: 'Overig' },
];

export const FloorCeilingEditor = () => {
  const floorType = useRoomStore((s) => s.draft.floorType);
  const ceilingType = useRoomStore((s) => s.draft.ceilingType);
  const floorNotes = useRoomStore((s) => s.draft.floorNotes);
  const ceilingNotes = useRoomStore((s) => s.draft.ceilingNotes);
  const setFloorType = useRoomStore((s) => s.setFloorType);
  const setCeilingType = useRoomStore((s) => s.setCeilingType);
  const setFloorNotes = useRoomStore((s) => s.setFloorNotes);
  const setCeilingNotes = useRoomStore((s) => s.setCeilingNotes);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
      <p className="text-sm font-medium text-gray-700">Vloer & Plafond</p>
      <div className="grid grid-cols-2 gap-3">
        <Select
          id="floor-type"
          label="Vloertype"
          options={floorOptions}
          value={floorType ?? ''}
          onChange={(e) =>
            setFloorType((e.target.value || undefined) as FloorType | undefined)
          }
        />
        <Select
          id="ceiling-type"
          label="Plafondtype"
          options={ceilingOptions}
          value={ceilingType ?? ''}
          onChange={(e) =>
            setCeilingType((e.target.value || undefined) as CeilingType | undefined)
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="floor-notes"
          label="Vloer notities"
          placeholder="bijv. scheuren, ongelijk"
          value={floorNotes}
          onChange={(e) => setFloorNotes(e.target.value)}
        />
        <Input
          id="ceiling-notes"
          label="Plafond notities"
          placeholder="bijv. vochtplekken"
          value={ceilingNotes}
          onChange={(e) => setCeilingNotes(e.target.value)}
        />
      </div>
    </div>
  );
};
