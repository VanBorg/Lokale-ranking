import { useRoomStore } from '../../../../store/roomStore';
import { Input } from '../../../ui/Input';
import { Button } from '../../../ui/Button';
import { generateId } from '../../../../utils/idGenerator';
import type { SubSpace } from '../../../../types/room';

export const SpaceEditor = () => {
  const subSpaces = useRoomStore((s) => s.draft.subSpaces);
  const addSubSpace = useRoomStore((s) => s.addSubSpace);
  const removeSubSpace = useRoomStore((s) => s.removeSubSpace);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);

  const handleAdd = () => {
    const newSpace: SubSpace = {
      id: generateId(),
      name: '',
      width: 100,
      length: 100,
      position: { x: 0, y: 0 },
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
              className="!text-sm"
            />
            <Button
              variant="danger"
              className="ml-2 !px-2 !py-1 text-xs"
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
              onChange={(e) =>
                updateSubSpace(space.id, { width: parseInt(e.target.value, 10) || 0 })
              }
            />
            <Input
              id={`space-l-${space.id}`}
              label="Lengte"
              suffix="cm"
              type="number"
              min={10}
              value={space.length}
              onChange={(e) =>
                updateSubSpace(space.id, { length: parseInt(e.target.value, 10) || 0 })
              }
            />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={handleAdd}>
        + Sub-ruimte toevoegen
      </Button>
    </div>
  );
};
