import { useUiStore } from '../../../../store/uiStore';
import { useRoomStore } from '../../../../store/roomStore';
import { Button } from '../../../ui/Button';
import { generateId } from '../../../../utils/idGenerator';
import type { WallDetailType } from '../../../../types/wall';

const detailTypes: { value: WallDetailType; label: string }[] = [
  { value: 'tiled', label: 'Betegeld' },
  { value: 'half-tiled', label: 'Half betegeld' },
  { value: 'painted', label: 'Geschilderd' },
  { value: 'wallpaper', label: 'Behang' },
  { value: 'damaged', label: 'Beschadigd' },
  { value: 'hole', label: 'Gat' },
  { value: 'moisture', label: 'Vochtplek' },
  { value: 'crack', label: 'Scheur' },
  { value: 'insulated', label: 'Geïsoleerd' },
  { value: 'other', label: 'Overig' },
];

export const WallDetailEditor = () => {
  const wallIndex = useUiStore((s) => s.activeWallIndex);
  const walls = useRoomStore((s) => s.draft.walls);
  const addDetail = useRoomStore((s) => s.addWallDetail);
  const removeDetail = useRoomStore((s) => s.removeWallDetail);

  const wall = walls[wallIndex];
  if (!wall) return null;

  const handleAdd = (type: WallDetailType) => {
    addDetail(wall.id, {
      id: generateId(),
      type,
    });
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Details & Bijzonderheden</p>

      {wall.details.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {wall.details.map((d) => {
            const label = detailTypes.find((t) => t.value === d.type)?.label ?? d.type;
            return (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 text-xs text-muted"
              >
                {label}
                <button
                  className="ml-0.5 text-muted hover:text-red-400"
                  onClick={() => removeDetail(wall.id, d.id)}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {detailTypes.map(({ value, label }) => (
          <Button
            key={value}
            variant="ghost"
            className="!px-2 !py-1 text-xs"
            onClick={() => handleAdd(value)}
          >
            + {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
