import { useRoomStore } from '../../../../store/roomStore';
import { Input } from '../../../ui/Input';
import { Button } from '../../../ui/Button';
import { cmToM, mToCm } from '../../../../utils/geometry';
import { isZonePlacementValid, getZoneWallSnapPosition } from '../../../../utils/subSpaceContainment';
import type { SubSpace } from '../../../../types/room';

interface ZoneListItemProps {
  space: SubSpace;
}

export const ZoneListItem = ({ space }: ZoneListItemProps) => {
  const draft = useRoomStore((s) => s.draft);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);
  const removeSubSpace = useRoomStore((s) => s.removeSubSpace);

  const applyDimUpdate = (updates: Partial<SubSpace>) => {
    const next: SubSpace = { ...space, ...updates };
    const { vertices, subSpaces, zonePlacementMode: mode } = draft;
    const snapped =
      mode === 'vrij'
        ? next.position
        : getZoneWallSnapPosition(next.position.x, next.position.y, next.width, next.length, vertices, mode);
    const valid = isZonePlacementValid(
      snapped.x, snapped.y, next.width, next.length,
      vertices, subSpaces, next.id, mode,
    );
    if (!valid) return;
    updateSubSpace(space.id, { ...updates, position: snapped });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
      <div className="flex items-center gap-2">
        <Input
          id={`zone-name-${space.id}`}
          placeholder="bijv. Inloopkast"
          value={space.name}
          onChange={(e) => updateSubSpace(space.id, { name: e.target.value })}
          className="text-sm!"
        />
        <Button
          variant="danger"
          className="shrink-0 px-2! py-1! text-xs"
          onClick={() => removeSubSpace(space.id)}
        >
          ✕
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          id={`zone-w-${space.id}`}
          label="Breedte"
          suffix="m"
          type="number"
          min={0.1}
          step={0.01}
          value={cmToM(space.width)}
          onChange={(e) => {
            const m = parseFloat(e.target.value);
            const cm = Math.max(10, Number.isFinite(m) ? mToCm(m) : 0);
            applyDimUpdate({ width: cm });
          }}
        />
        <Input
          id={`zone-l-${space.id}`}
          label="Lengte"
          suffix="m"
          type="number"
          min={0.1}
          step={0.01}
          value={cmToM(space.length)}
          onChange={(e) => {
            const m = parseFloat(e.target.value);
            const cm = Math.max(10, Number.isFinite(m) ? mToCm(m) : 0);
            applyDimUpdate({ length: cm });
          }}
        />
      </div>
    </div>
  );
};
