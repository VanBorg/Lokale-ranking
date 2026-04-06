import { useRoomStore } from '../../../../store/roomStore';
import { Input } from '../../../ui/Input';
import { Button } from '../../../ui/Button';
import { generateId } from '../../../../utils/idGenerator';
import type { SubSpace } from '../../../../types/room';
import {
  clampSubSpaceTopLeftNoOverlapCm,
  defaultSubSpacePositionCm,
} from '../../../../utils/subSpaceContainment';

const getNextZoneName = (spaces: SubSpace[]): string => {
  let maxIndex = 0;
  spaces.forEach((space) => {
    const match = /^Zone(\d+)$/i.exec(space.name.trim());
    if (match) {
      const n = parseInt(match[1]!, 10);
      if (n > maxIndex) maxIndex = n;
    }
  });
  return `Zone${maxIndex + 1}`;
};

export const SpaceEditor = () => {
  const draft = useRoomStore((s) => s.draft);
  const subSpaces = draft.subSpaces;
  const addSubSpace = useRoomStore((s) => s.addSubSpace);
  const removeSubSpace = useRoomStore((s) => s.removeSubSpace);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);

  const handleAdd = () => {
    const w = 100;
    const len = 100;
    const name = getNextZoneName(subSpaces);
    const initialPosition = defaultSubSpacePositionCm(
      draft.shape,
      draft.width,
      draft.length,
      w,
      len,
    );
    const position = clampSubSpaceTopLeftNoOverlapCm(
      draft.shape,
      draft.width,
      draft.length,
      w,
      len,
      initialPosition.x,
      initialPosition.y,
      subSpaces,
    );
    const newSpace: SubSpace = {
      id: generateId(),
      name,
      width: w,
      length: len,
      position,
    };
    addSubSpace(newSpace);
  };

  return (
    <div className="flex flex-col gap-3">
      {subSpaces.map((space) => (
        <div
          key={space.id}
          className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3"
        >
          <div className="flex items-center justify-between">
            <Input
              id={`space-name-${space.id}`}
              placeholder="bijv. Inloopkast"
              value={space.name}
              onChange={(e) => updateSubSpace(space.id, { name: e.target.value })}
              className="text-sm!"
            />
            <Button
              variant="danger"
              className="ml-2 px-2! py-1! text-xs"
              onClick={() => removeSubSpace(space.id)}
            >
              ✕
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id={`space-w-${space.id}`}
              label="Breedte"
              suffix="cm"
              type="number"
              min={10}
              value={space.width}
              onChange={(e) => {
                const w = parseInt(e.target.value, 10) || 0;
                updateSubSpace(space.id, { width: w });
              }}
            />
            <Input
              id={`space-l-${space.id}`}
              label="Lengte"
              suffix="cm"
              type="number"
              min={10}
              value={space.length}
              onChange={(e) => {
                const l = parseInt(e.target.value, 10) || 0;
                updateSubSpace(space.id, { length: l });
              }}
            />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={handleAdd}>
        + Zone toevoegen
      </Button>
    </div>
  );
};
