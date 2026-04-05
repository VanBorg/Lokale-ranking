import { useRoomStore } from '../store/roomStore';

/**
 * Provides wall count and wall labels derived from the current draft shape.
 * The actual wall generation happens inside roomStore when shape/dimensions change.
 */
export const useWallDetection = () => {
  const walls = useRoomStore((s) => s.draft.walls);
  const shape = useRoomStore((s) => s.draft.shape);

  return {
    wallCount: walls.length,
    wallLabels: walls.map((w) => w.label),
    shape,
  };
};
