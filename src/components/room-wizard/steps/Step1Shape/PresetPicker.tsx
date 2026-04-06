import { useRoomStore } from '../../../../store/roomStore';
import { PRESET_LABELS } from '../../../../utils/presets';
import type { RoomPreset } from '../../../../types/room';

const PRESETS: RoomPreset[] = [
  'rectangle', 'l-shape', 'plus', 'u-shape',
  't-shape', 'trapezoid', 'pentagon', 'hexagon',
];

const PRESET_ICONS: Record<RoomPreset, JSX.Element> = {
  rectangle: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><rect x="4" y="8" width="32" height="24" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2" rx="1"/></svg>
  ),
  'l-shape': (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,4 22,4 22,22 36,22 36,36 4,36" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  plus: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="14,4 26,4 26,14 36,14 36,26 26,26 26,36 14,36 14,26 4,26 4,14 14,14" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  'u-shape': (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,4 14,4 14,28 26,28 26,4 36,4 36,36 4,36" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  't-shape': (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,4 36,4 36,16 24,16 24,36 16,36 16,16 4,16" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  trapezoid: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="10,8 30,8 36,32 4,32" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  pentagon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,8 36,8 36,28 20,36 4,28" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  hexagon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8"><polygon points="4,8 20,4 36,8 36,32 20,36 4,32" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/></svg>
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
