import { useRoomStore } from '../../../../store/roomStore';
import { useWallDetection } from '../../../../hooks/useWallDetection';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { ShapePicker } from './ShapePicker';
import { DimensionInputs } from './DimensionInputs';
import type { RoomType } from '../../../../types/room';
import { ROOM_TYPE_OPTIONS } from '../../../../utils/roomNaming';

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
        description="Kies de basisvorm van de kamer en vul de afmetingen in. Links op de plattegrond zie je een live voorbeeld van die kamer — dit is de buitenomtrek waarmee latere stappen werken."
      />
      <Select
        id="room-type"
        label="Type ruimte"
        options={ROOM_TYPE_OPTIONS}
        value={roomType}
        onChange={(e) => setRoomType(e.target.value as RoomType)}
      />
      <Input
        id="room-name"
        label="Kamernaam"
        placeholder="Wordt automatisch ingevuld; pas gerust aan"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
