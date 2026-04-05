import { useUiStore } from '../../../../store/uiStore';
import { useRoomStore } from '../../../../store/roomStore';
import { Button } from '../../../ui/Button';
import { generateId } from '../../../../utils/idGenerator';
import type { WallElementType } from '../../../../types/wall';

interface ElementDef {
  type: WallElementType;
  label: string;
  defaultW: number;
  defaultH: number;
}

const elements: ElementDef[] = [
  { type: 'door', label: 'Deur', defaultW: 90, defaultH: 210 },
  { type: 'window', label: 'Raam', defaultW: 120, defaultH: 100 },
  { type: 'radiator', label: 'Radiator', defaultW: 100, defaultH: 60 },
  { type: 'outlet', label: 'Stopcontact', defaultW: 8, defaultH: 8 },
  { type: 'switch', label: 'Schakelaar', defaultW: 8, defaultH: 8 },
  { type: 'vent', label: 'Ventilatie', defaultW: 30, defaultH: 30 },
  { type: 'pipe', label: 'Leiding', defaultW: 10, defaultH: 200 },
  { type: 'beam', label: 'Balk', defaultW: 200, defaultH: 30 },
  { type: 'niche', label: 'Nis', defaultW: 60, defaultH: 80 },
];

export const WallElementPicker = () => {
  const wallIndex = useUiStore((s) => s.activeWallIndex);
  const walls = useRoomStore((s) => s.draft.walls);
  const addElement = useRoomStore((s) => s.addWallElement);

  const wall = walls[wallIndex];
  if (!wall) return null;

  const handleAdd = (def: ElementDef) => {
    addElement(wall.id, {
      id: generateId(),
      type: def.type,
      x: Math.round((wall.width - def.defaultW) / 2),
      y: Math.round((wall.height - def.defaultH) / 2),
      width: def.defaultW,
      height: def.defaultH,
    });
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">Element toevoegen</p>
      <div className="flex flex-wrap gap-1.5">
        {elements.map((def) => (
          <Button
            key={def.type}
            variant="secondary"
            className="!px-2.5 !py-1 text-xs"
            onClick={() => handleAdd(def)}
          >
            {def.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
