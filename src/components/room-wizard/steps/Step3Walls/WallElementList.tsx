import { useUiStore } from '../../../../store/uiStore';
import { useRoomStore } from '../../../../store/roomStore';

export const WallElementList = () => {
  const wallIndex = useUiStore((s) => s.activeWallIndex);
  const walls = useRoomStore((s) => s.draft.walls);
  const removeElement = useRoomStore((s) => s.removeWallElement);

  const wall = walls[wallIndex];
  if (!wall || wall.elements.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
        Elementen op deze wand ({wall.elements.length})
      </p>
      <ul className="flex flex-col gap-1">
        {wall.elements.map((el) => (
          <li
            key={el.id}
            className="flex items-center justify-between rounded-md border border-line bg-app px-3 py-1.5 text-xs text-muted"
          >
            <span>
              {el.type} — {el.width}×{el.height} cm @ ({el.x}, {el.y})
            </span>
            <button
              className="text-muted hover:text-red-400"
              onClick={() => removeElement(wall.id, el.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-muted/80">
        Netto oppervlak: {wall.netArea} m²
      </p>
    </div>
  );
};
