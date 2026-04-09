import { useRoomStore } from '../../../../store/roomStore';
import { useUiStore } from '../../../../store/uiStore';

const SHAPES = [
  { corners: 3 as const, label: 'Driehoek', path: 'M20 4 L36 36 L4 36 Z' },
  { corners: 4 as const, label: 'Vierkant', path: 'M6 6 H34 V34 H6 Z' },
  { corners: 5 as const, label: 'Vijfhoek', path: 'M20 4 L36 16 L30 36 L10 36 L4 16 Z' },
];

export const ShapePicker = () => {
  const addSubRoom = useRoomStore((s) => s.addSubRoom);
  const selectSubRoom = useUiStore((s) => s.selectSubRoom);

  const handleAdd = (corners: 3 | 4 | 5) => {
    addSubRoom(corners);
    const subRooms = useRoomStore.getState().draft.subRooms;
    selectSubRoom(subRooms[subRooms.length - 1]!.id);
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ruimte toevoegen</p>
      <div className="grid grid-cols-3 gap-2">
        {SHAPES.map(({ corners, label, path }) => (
          <button
            key={corners}
            type="button"
            onClick={() => handleAdd(corners)}
            className="flex flex-col items-center gap-1 rounded-lg border border-line bg-app p-3 text-xs text-muted transition-colors hover:border-orange-400 hover:text-white"
          >
            <svg viewBox="0 0 40 40" className="h-8 w-8">
              <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
