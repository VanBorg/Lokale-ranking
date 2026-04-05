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
      <p className="mb-1 text-sm font-medium text-gray-700">
        Elementen op deze wand ({wall.elements.length})
      </p>
      <ul className="flex flex-col gap-1">
        {wall.elements.map((el) => (
          <li
            key={el.id}
            className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700"
          >
            <span>
              {el.type} — {el.width}×{el.height} cm @ ({el.x}, {el.y})
            </span>
            <button
              className="text-gray-400 hover:text-red-500"
              onClick={() => removeElement(wall.id, el.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-gray-400">
        Netto oppervlak: {wall.netArea} m²
      </p>
    </div>
  );
};
