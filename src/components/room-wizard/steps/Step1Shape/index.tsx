import { useRoomStore } from '../../../../store/roomStore';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Button } from '../../../ui/Button';
import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { PresetPicker } from './PresetPicker';
import type { RoomType } from '../../../../types/room';
import { ROOM_TYPE_OPTIONS } from '../../../../utils/roomNaming';

export const Step1Shape = () => {
  const name = useRoomStore((s) => s.draft.name);
  const roomType = useRoomStore((s) => s.draft.roomType);
  const height = useRoomStore((s) => s.draft.height);
  const walls = useRoomStore((s) => s.draft.walls);
  const setName = useRoomStore((s) => s.setName);
  const setRoomType = useRoomStore((s) => s.setRoomType);
  const setHeight = useRoomStore((s) => s.setHeight);
  const rotateRoom = useRoomStore((s) => s.rotateRoom);

  return (
    <StepContainer>
      <StepHeader
        title="Vorm & Afmetingen"
        description="Kies een basisvorm en pas de hoekpunten aan. Links op de plattegrond zie je een live voorbeeld — versleep de oranje cirkels om de vorm aan te passen."
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

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Basisvorm
        </p>
        <PresetPicker />
        <Button variant="secondary" onClick={rotateRoom} className="mt-1 w-full">
          ↻ Kwartslag draaien
        </Button>
      </div>

      <Input
        id="dim-height"
        label="Hoogte"
        suffix="cm"
        type="number"
        min={10}
        value={height}
        onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
      />

      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-sm font-medium text-gray-700">
          Gedetecteerde wanden: <strong>{walls.length}</strong>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {walls.map((w) => w.label).join(' · ')}
        </p>
      </div>
    </StepContainer>
  );
};
