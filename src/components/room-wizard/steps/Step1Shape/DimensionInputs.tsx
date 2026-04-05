import { useRoomStore } from '../../../../store/roomStore';
import { Input } from '../../../ui/Input';

export const DimensionInputs = () => {
  const width = useRoomStore((s) => s.draft.width);
  const length = useRoomStore((s) => s.draft.length);
  const height = useRoomStore((s) => s.draft.height);
  const setDimensions = useRoomStore((s) => s.setDimensions);

  const update = (field: 'w' | 'l' | 'h', raw: string) => {
    const val = parseInt(raw, 10) || 0;
    setDimensions(
      field === 'w' ? val : width,
      field === 'l' ? val : length,
      field === 'h' ? val : height,
    );
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <Input
        id="dim-width"
        label="Breedte"
        suffix="cm"
        type="number"
        min={10}
        value={width}
        onChange={(e) => update('w', e.target.value)}
      />
      <Input
        id="dim-length"
        label="Lengte"
        suffix="cm"
        type="number"
        min={10}
        value={length}
        onChange={(e) => update('l', e.target.value)}
      />
      <Input
        id="dim-height"
        label="Hoogte"
        suffix="cm"
        type="number"
        min={10}
        value={height}
        onChange={(e) => update('h', e.target.value)}
      />
    </div>
  );
};
