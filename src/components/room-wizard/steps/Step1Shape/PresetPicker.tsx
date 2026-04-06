import { useRoomStore } from '../../../../store/roomStore';
import { PRESET_LABELS } from '../../../../utils/presets';
import type { RoomPreset } from '../../../../types/room';

const PRESETS: RoomPreset[] = [
  'rectangle', 'l-shape', 'plus', 'u-shape',
  't-shape', 'trapezoid', 'pentagon', 'hexagon',
];

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
            className={[
              'flex flex-col items-center rounded-lg border px-2 py-2.5 text-center transition-colors',
              selected
                ? 'border-brand bg-brand-light ring-1 ring-brand'
                : 'border-line bg-app hover:border-brand/80 hover:bg-brand-light/50',
            ].join(' ')}
          >
            <span className="text-xs font-semibold text-white">{label}</span>
            <span className="mt-0.5 text-[10px] leading-tight text-muted">{desc}</span>
          </button>
        );
      })}
    </div>
  );
};
