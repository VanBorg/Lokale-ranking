import { useRoomStore } from '../../../../store/roomStore';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Button } from '../../../ui/Button';
import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { PresetPicker } from './PresetPicker';
import { WallLengthEditor } from './WallLengthEditor';
import type { RoomType } from '../../../../types/room';
import { ROOM_TYPE_OPTIONS } from '../../../../utils/roomNaming';
import { cmToM, mToCm } from '../../../../utils/geometry';

export const Step1Shape = () => {
  const name = useRoomStore((s) => s.draft.name);
  const roomType = useRoomStore((s) => s.draft.roomType);
  const height = useRoomStore((s) => s.draft.height);
  const setName = useRoomStore((s) => s.setName);
  const setRoomType = useRoomStore((s) => s.setRoomType);
  const setHeight = useRoomStore((s) => s.setHeight);
  const rotateRoom = useRoomStore((s) => s.rotateRoom);
  const rotateRoomCCW = useRoomStore((s) => s.rotateRoomCCW);

  return (
    <StepContainer>
      <StepHeader
        title="Vorm & Afmetingen"
        description="Kies de figuur die het beste past bij de kamer."
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
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Basisvorm</p>
        <PresetPicker />
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={rotateRoomCCW} className="w-full">
            ↺ Links draaien
          </Button>
          <Button variant="secondary" onClick={rotateRoom} className="w-full">
            ↻ Rechts draaien
          </Button>
        </div>
      </div>

      <WallLengthEditor />

      <Input
        id="dim-height"
        label="Hoogte"
        suffix="m"
        type="number"
        min={0.1}
        step={0.01}
        value={cmToM(height)}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isFinite(v)) return;
          setHeight(Math.max(10, mToCm(v)));
        }}
      />
    </StepContainer>
  );
};
