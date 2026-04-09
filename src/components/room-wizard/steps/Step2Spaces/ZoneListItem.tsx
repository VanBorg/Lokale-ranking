import { useRoomStore } from '../../../../store/roomStore';
import { useUiStore } from '../../../../store/uiStore';
import { Input } from '../../../ui/Input';
import { Button } from '../../../ui/Button';
import { cmToM, mToCm } from '../../../../utils/geometry';
import { isZonePlacementValid, getZoneWallSnapPosition } from '../../../../utils/subSpaceContainment';
import type { SubSpace, SpaceType } from '../../../../types/room';
import {
  SPACE_TYPE_ICONS,
  SPACE_TYPE_LABELS,
  SPACE_TYPE_GROUPS,
} from '../../../../design/konva';

interface ZoneListItemProps {
  space: SubSpace;
}

export const ZoneListItem = ({ space }: ZoneListItemProps) => {
  const draft = useRoomStore((s) => s.draft);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);
  const removeSubSpace = useRoomStore((s) => s.removeSubSpace);
  const selectedZoneId = useUiStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useUiStore((s) => s.setSelectedZoneId);

  const isSelected = selectedZoneId === space.id;
  const m2 = ((space.width / 100) * (space.length / 100)).toFixed(2).replace('.', ',');

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
    <div
      className={`flex flex-col gap-2 rounded-lg border p-3 transition-colors cursor-pointer ${
        isSelected
          ? 'border-brand bg-brand/10'
          : 'border-line hover:border-brand/40'
      }`}
      onClick={() => setSelectedZoneId(isSelected ? null : space.id)}
    >
      {/* Header: icon + name + m² + delete */}
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none select-none">
          {space.spaceType ? SPACE_TYPE_ICONS[space.spaceType] : '❓'}
        </span>
        <div className="flex-1 min-w-0">
          <Input
            id={`zone-name-${space.id}`}
            placeholder="bijv. Inloopkast"
            value={space.name}
            onChange={(e) => updateSubSpace(space.id, { name: e.target.value })}
            className="text-sm!"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <span className="shrink-0 text-xs text-muted font-mono whitespace-nowrap">
          {m2} m²
        </span>
        <Button
          variant="danger"
          className="shrink-0 px-2! py-1! text-xs"
          onClick={(e) => { e.stopPropagation(); removeSubSpace(space.id); }}
        >
          ✕
        </Button>
      </div>

      {/* Type picker */}
      <div onClick={(e) => e.stopPropagation()}>
        <label
          htmlFor={`zone-type-${space.id}`}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Type ruimte
        </label>
        <select
          id={`zone-type-${space.id}`}
          value={space.spaceType ?? ''}
          onChange={(e) =>
            updateSubSpace(space.id, {
              spaceType: e.target.value ? (e.target.value as SpaceType) : undefined,
            })
          }
          className="w-full rounded-md border border-line bg-panel px-2 py-1.5 text-sm text-foreground focus:border-brand focus:outline-none"
        >
          <option value="">— Kies type —</option>
          {SPACE_TYPE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.types.map((t) => (
                <option key={t} value={t}>
                  {SPACE_TYPE_ICONS[t]} {SPACE_TYPE_LABELS[t]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
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
