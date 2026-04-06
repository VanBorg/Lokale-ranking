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
                ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-400'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50',
            ].join(' ')}
          >
            <span className="text-xs font-semibold text-gray-800">{label}</span>
            <span className="mt-0.5 text-[10px] leading-tight text-gray-400">{desc}</span>
          </button>
        );
      })}
    </div>
  );
};
