import { useRoomStore } from '../store/roomStore';

/**
 * Wall count and labels derived from the current draft.
 * Walls are re-generated in roomStore whenever vertices or height change.
 */
export const useWallDetection = () => {
  const walls = useRoomStore((s) => s.draft.walls);
  return {
    wallCount: walls.length,
    wallLabels: walls.map((w) => w.label),
  };
};
