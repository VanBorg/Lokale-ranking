import type { ReactElement } from 'react';
import { useRoomStore } from '../../../../store/roomStore';
import { PRESET_LABELS } from '../../../../utils/presets';
import type { RoomPreset } from '../../../../types/room';

const PRESETS: RoomPreset[] = [
  'rectangle', 'l-shape', 'u-shape', 't-shape',
  'trapezoid', 'pentagon', 'hexagon', 'plus',
];

const PRESET_ICONS: Record<RoomPreset, ReactElement> = {
  rectangle: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><rect x="4" y="8" width="32" height="24" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2" rx="1"/></svg>
  ),
  'l-shape': (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,4 20,4 20,20 36,20 36,36 4,36" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  plus: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="15,4 25,4 25,15 36,15 36,25 25,25 25,36 15,36 15,25 4,25 4,15 15,15" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  'u-shape': (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,4 15,4 15,20 25,20 25,4 36,4 36,36 4,36" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  't-shape': (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,4 36,4 36,20 25,20 25,36 15,36 15,20 4,20" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  trapezoid: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="12,8 28,8 36,36 4,36" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  pentagon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="20,4 36,20 36,36 4,36 4,20" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  hexagon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="20,4 36,12 36,28 20,36 4,28 4,12" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
};

export const PresetPicker = () => {
  const current = useRoomStore((s) => s.draft.preset);
  const loadPreset = useRoomStore((s) => s.loadPreset);

  return (
    <div className="grid grid-cols-4 gap-2">
      {PRESETS.map((preset) => {
        const { label, desc } = PRESET_LABELS[preset];
        const selected = current === preset;
        return (
          <button
            key={preset}
            type="button"
            onClick={() => loadPreset(preset)}
            title={`${label} — ${desc}`}
            className={[
              'flex flex-col items-center gap-1 rounded-lg border px-1 py-2.5 text-center transition-colors',
              selected
                ? 'border-brand bg-brand/20 text-brand-light ring-1 ring-brand'
                : 'border-line bg-app text-muted hover:border-brand/80 hover:bg-brand/10 hover:text-white',
            ].join(' ')}
          >
            {PRESET_ICONS[preset]}
            <span className="text-[10px] font-semibold leading-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
