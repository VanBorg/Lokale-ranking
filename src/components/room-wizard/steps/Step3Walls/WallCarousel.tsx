import { useUiStore } from '../../../../store/uiStore';
import { useRoomStore } from '../../../../store/roomStore';
import { Button } from '../../../ui/Button';

export const WallCarousel = () => {
  const walls = useRoomStore((s) => s.draft.walls);
  const index = useUiStore((s) => s.activeWallIndex);
  const setIndex = useUiStore((s) => s.setActiveWallIndex);

  const total = walls.length;
  if (total === 0) return null;

  const wall = walls[index];

  const prev = () => setIndex((index - 1 + total) % total);
  const next = () => setIndex((index + 1) % total);

  return (
    <div className="flex items-center justify-between rounded-lg bg-app px-3 py-2">
      <Button variant="ghost" className="!px-2 !py-1" onClick={prev}>
        ◀
      </Button>
      <div className="text-center">
        <span className="text-sm font-semibold text-white">
          {wall.label}
        </span>
        <span className="ml-2 text-xs text-muted">
          Wand {index + 1} van {total}
        </span>
      </div>
      <Button variant="ghost" className="!px-2 !py-1" onClick={next}>
        ▶
      </Button>
    </div>
  );
};
