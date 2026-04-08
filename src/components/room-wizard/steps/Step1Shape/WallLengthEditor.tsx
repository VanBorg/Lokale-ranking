import { useRef } from 'react';
import { useRoomStore } from '../../../../store/roomStore';
import { useUiStore } from '../../../../store/uiStore';
import { cmToM, mToCm } from '../../../../utils/geometry';

export const WallLengthEditor = () => {
  const walls = useRoomStore((s) => s.draft.walls);
  const vertices = useRoomStore((s) => s.draft.vertices);
  const updateVertex = useRoomStore((s) => s.updateVertex);
  const lockedWallIds = useRoomStore((s) => s.draft.lockedWallIds);
  const toggleWallLock = useRoomStore((s) => s.toggleWallLock);
  const setHoveredWallIndex = useUiStore((s) => s.setHoveredWallIndex);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeat = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startRepeat = (action: () => void) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 80);
    }, 400);
  };

  const handleLengthChange = (wallIndex: number, newLengthCm: number) => {
    if (newLengthCm < 10) return;
    const n = vertices.length;
    const startIdx = wallIndex;
    const endIdx = (wallIndex + 1) % n;
    const start = vertices[startIdx]!;
    const end = vertices[endIdx]!;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const currentLen = Math.sqrt(dx * dx + dy * dy);
    if (currentLen === 0) return;
    const scale = newLengthCm / currentLen;
    updateVertex(endIdx, {
      x: Math.round(start.x + dx * scale),
      y: Math.round(start.y + dy * scale),
    });
  };

  if (walls.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Wanden</p>
      <div className="flex flex-col gap-1">
        {walls.map((wall, i) => {
          const locked = lockedWallIds.includes(wall.id);
          const lengthM = cmToM(wall.width);
          return (
            <div
              key={wall.id}
              onMouseEnter={() => setHoveredWallIndex(i)}
              onMouseLeave={() => setHoveredWallIndex(null)}
              className={`flex items-center gap-2 rounded-md border bg-app px-3 py-1.5 ${
                locked ? 'border-line' : 'hover:border-orange-400 border-line'
              }`}
            >
              <span className="w-12 text-xs font-medium text-white shrink-0">{wall.label}</span>
              <div className="flex flex-1 items-center gap-1">
                <button
                  type="button"
                  disabled={locked}
                  onMouseDown={() => startRepeat(() => handleLengthChange(i, wall.width - 10))}
                  onMouseUp={stopRepeat}
                  onMouseLeave={stopRepeat}
                  className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-muted hover:border-brand/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <input
                  type="number"
                  disabled={locked}
                  value={lengthM}
                  min={0.1}
                  step={0.01}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isFinite(v)) return;
                    handleLengthChange(i, mToCm(v));
                  }}
                  className="w-20 rounded border border-line bg-surface px-1.5 py-0.5 text-center text-xs text-white focus:border-brand focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                />
                <span className="text-xs text-muted">m</span>
                <button
                  type="button"
                  disabled={locked}
                  onMouseDown={() => startRepeat(() => handleLengthChange(i, wall.width + 10))}
                  onMouseUp={stopRepeat}
                  onMouseLeave={stopRepeat}
                  className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-muted hover:border-brand/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => toggleWallLock(wall.id)}
                title={locked ? 'Ontgrendelen' : 'Vergrendelen'}
                className={`shrink-0 rounded px-1.5 py-0.5 text-sm transition-colors ${
                  locked
                    ? 'text-brand-light hover:text-muted'
                    : 'text-muted hover:text-white'
                }`}
              >
                {locked ? '🔒' : '🔓'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
