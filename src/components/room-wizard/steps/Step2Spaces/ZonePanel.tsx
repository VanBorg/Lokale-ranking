import { useRoomStore } from '../../../../store/roomStore';
import { Button } from '../../../ui/Button';
import { ZoneListItem } from './ZoneListItem';
import { useAddZone } from './useAddZone';

const PLACEMENT_MODES = [
  { id: 'binnen', label: 'Binnen' },
  { id: 'buiten', label: 'Buiten' },
  { id: 'vrij', label: 'Vrij' },
] as const;

export const ZonePanel = () => {
  const subSpaces = useRoomStore((s) => s.draft.subSpaces);
  const zonePlacementMode = useRoomStore((s) => s.draft.zonePlacementMode);
  const setZonePlacementMode = useRoomStore((s) => s.setZonePlacementMode);
  const addZone = useAddZone();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Zones in de kamer</h2>
        <p className="mt-1 text-xs leading-snug text-muted">
          Sleep zones op de plattegrond. Gebruik de hoekhandvatten om formaat aan te passen.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Plaatsing</span>
        <div className="inline-flex rounded-lg border border-line bg-panel p-1">
          {PLACEMENT_MODES.map((m) => {
            const active = zonePlacementMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setZonePlacementMode(m.id)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  active ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-foreground'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {subSpaces.length === 0 && (
          <p className="text-xs text-muted">Nog geen zones. Voeg er een toe via de knop hieronder.</p>
        )}
        {subSpaces.map((space) => (
          <ZoneListItem key={space.id} space={space} />
        ))}
      </div>

      <Button variant="secondary" onClick={addZone}>
        + Zone toevoegen
      </Button>
    </div>
  );
};
