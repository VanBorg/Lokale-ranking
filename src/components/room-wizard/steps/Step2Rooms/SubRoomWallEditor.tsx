import { useEffect, useRef } from 'react';
import { useRoomStore } from '../../../../store/roomStore';
import { useUiStore } from '../../../../store/uiStore';
import { cmToM, mToCm } from '../../../../utils/geometry';

export const SubRoomWallEditor = () => {
  const selectedId = useUiStore((s) => s.selectedSubRoomId);
  const setHoveredIdx = useUiStore((s) => s.setHoveredSubRoomWallIndex);
  const subRoom = useRoomStore((s) => s.draft.subRooms.find((r) => r.id === selectedId));
  const updateVertex = useRoomStore((s) => s.updateSubRoomVertex);
  const toggleLock = useRoomStore((s) => s.toggleSubRoomWallLock);

  useEffect(() => () => setHoveredIdx(null), [setHoveredIdx]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeat = () => {
    if (timeoutRef.current !== null) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const startRepeat = (action: () => void) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 80);
    }, 400);
  };

  if (!subRoom || !selectedId) return null;

  const { walls, lockedWallIds, vertices } = subRoom;
  if (walls.length === 0) return null;

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

    const endLocked =
      lockedWallIds.includes(walls[endIdx % n]?.id ?? '') ||
      lockedWallIds.includes(walls[(endIdx - 1 + n) % n]?.id ?? '');

    if (!endLocked) {
      updateVertex(selectedId, endIdx, {
        x: Math.round(start.x + dx * scale),
        y: Math.round(start.y + dy * scale),
      });
      return;
    }

    const startLocked =
      lockedWallIds.includes(walls[startIdx % n]?.id ?? '') ||
      lockedWallIds.includes(walls[(startIdx - 1 + n) % n]?.id ?? '');
    if (startLocked) return;

    updateVertex(selectedId, startIdx, {
      x: Math.round(end.x - dx * scale),
      y: Math.round(end.y - dy * scale),
    });
  };

  const stepLength = (wallIndex: number, deltaCm: number) => {
    const sr = useRoomStore.getState().draft.subRooms.find((r) => r.id === selectedId);
    const w = sr?.walls[wallIndex];
    if (!w) return;
    handleLengthChange(wallIndex, w.width + deltaCm);
  };

  return (
    <div className="flex flex-col gap-1 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Wanden</p>
      <div className="flex flex-col gap-1">
        {walls.map((wall, i) => {
          const locked = lockedWallIds.includes(wall.id);
          const lengthM = cmToM(wall.width);
          return (
            <div
              key={wall.id}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center gap-2 rounded-md border bg-app px-3 py-1.5 ${
                locked ? 'border-line' : 'hover:border-orange-400 border-line'
              }`}
            >
              <span className="w-12 text-xs font-medium text-white shrink-0">{wall.label}</span>
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <button
                  type="button"
                  disabled={locked}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    startRepeat(() => stepLength(i, -10));
                  }}
                  onPointerUp={stopRepeat}
                  onPointerLeave={stopRepeat}
                  onPointerCancel={stopRepeat}
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
                  className="w-20 rounded border border-line bg-surface px-1.5 py-0.5 text-center text-xs text-white focus:border-brand focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-xs text-muted">m</span>
                <button
                  type="button"
                  disabled={locked}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    startRepeat(() => stepLength(i, 10));
                  }}
                  onPointerUp={stopRepeat}
                  onPointerLeave={stopRepeat}
                  onPointerCancel={stopRepeat}
                  className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-muted hover:border-brand/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => toggleLock(selectedId, wall.id)}
                  title={locked ? 'Ontgrendelen' : 'Vergrendelen'}
                  className={`inline-flex min-w-9 flex-1 items-center justify-center rounded border bg-surface px-2 py-0.5 text-sm leading-none transition-colors ${
                    locked
                      ? 'border-orange-400 text-brand-light hover:border-orange-300 hover:text-brand-light'
                      : 'border-line text-muted hover:border-brand/60 hover:text-white'
                  }`}
                >
                  {locked ? '🔒' : '🔓'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
