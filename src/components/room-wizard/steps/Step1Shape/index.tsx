import { useRoomStore } from '../../../../store/roomStore';
import { useWallDetection } from '../../../../hooks/useWallDetection';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { ShapePicker } from './ShapePicker';
import { DimensionInputs } from './DimensionInputs';
import type { RoomType } from '../../../../types/room';

const roomTypeOptions = [
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
  { value: 'other', label: 'Overig' },
];

export const Step1Shape = () => {
  const name = useRoomStore((s) => s.draft.name);
  const roomType = useRoomStore((s) => s.draft.roomType);
  const setName = useRoomStore((s) => s.setName);
  const setRoomType = useRoomStore((s) => s.setRoomType);
  const { wallCount, wallLabels } = useWallDetection();

  return (
    <StepContainer>
      <StepHeader
        title="Vorm & Afmetingen"
        description="Kies de basisvorm van de kamer en vul de afmetingen in."
      />
      <Input
        id="room-name"
        label="Kamernaam"
        placeholder="bijv. Badkamer boven"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Select
        id="room-type"
        label="Type ruimte"
        options={roomTypeOptions}
        value={roomType}
        onChange={(e) => setRoomType(e.target.value as RoomType)}
      />
      <ShapePicker />
      <DimensionInputs />
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-sm font-medium text-gray-700">
          Gedetecteerde wanden: <strong>{wallCount}</strong>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {wallLabels.join(' · ')}
        </p>
      </div>
    </StepContainer>
  );
};
