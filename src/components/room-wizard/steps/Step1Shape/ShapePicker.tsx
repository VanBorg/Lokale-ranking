import { useRoomStore } from '../../../../store/roomStore';
import { Card } from '../../../ui/Card';
import { Input } from '../../../ui/Input';
import type { RoomShape } from '../../../../types/room';

const shapes: { value: RoomShape; label: string; desc: string }[] = [
  { value: 'rectangle', label: 'Rechthoek', desc: '4 wanden' },
  { value: 'l-shape', label: 'L-vorm', desc: '6 wanden' },
  { value: 'custom', label: 'Custom', desc: 'Zelf wanden bepalen' },
];

export const ShapePicker = () => {
  const current = useRoomStore((s) => s.draft.shape);
  const setShape = useRoomStore((s) => s.setShape);
  const customWallCount = useRoomStore((s) => s.draft.customWallCount);
  const setCustomWallCount = useRoomStore((s) => s.setCustomWallCount);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        {shapes.map(({ value, label, desc }) => (
          <Card
            key={value}
            selected={current === value}
            className="cursor-pointer text-center"
            onClick={() => setShape(value)}
          >
            <span className="block text-sm font-medium text-gray-700">
              {label}
            </span>
            <span className="mt-0.5 block text-xs text-gray-400">{desc}</span>
          </Card>
        ))}
      </div>
      {current === 'custom' && (
        <Input
          id="custom-wall-count"
          label="Aantal wanden"
          type="number"
          min={3}
          max={10}
          value={customWallCount}
          onChange={(e) => setCustomWallCount(Math.max(3, Math.min(10, parseInt(e.target.value, 10) || 3)))}
        />
      )}
    </div>
  );
};
