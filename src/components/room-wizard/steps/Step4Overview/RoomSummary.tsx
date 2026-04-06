import { useRoomStore } from '../../../../store/roomStore';
import { cmToM, calcPolygonArea, verticesBoundingBox } from '../../../../utils/geometry';
import { roomTypeLabels } from '../../../../utils/roomNaming';
import { PRESET_LABELS } from '../../../../utils/presets';

const floorTypeLabels: Record<string, string> = {
  tiles: 'Tegels', wood: 'Hout', laminate: 'Laminaat',
  concrete: 'Beton', vinyl: 'Vinyl', other: 'Overig',
};

const ceilingTypeLabels: Record<string, string> = {
  plaster: 'Stucwerk', suspended: 'Verlaagd', wood: 'Hout',
  concrete: 'Beton', other: 'Overig',
};

export const RoomSummary = () => {
  const draft = useRoomStore((s) => s.draft);
  const floorArea = calcPolygonArea(draft.vertices);
  const bb = verticesBoundingBox(draft.vertices);
  const totalNetWall = draft.walls.reduce((sum, w) => sum + w.netArea, 0);
  const totalElements = draft.walls.reduce((sum, w) => sum + w.elements.length, 0);
  const totalPhotos = draft.walls.reduce((sum, w) => sum + w.photos.length, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg bg-brand-light/60 p-3">
        <h3 className="text-base font-semibold text-white">
          {draft.name || 'Naamloze kamer'}
        </h3>
        <p className="text-sm text-muted">
          {roomTypeLabels[draft.roomType] ?? draft.roomType} —{' '}
          {PRESET_LABELS[draft.preset].label}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Breedte" value={`${cmToM(bb.width).toFixed(2)} m`} />
        <Stat label="Lengte" value={`${cmToM(bb.height).toFixed(2)} m`} />
        <Stat label="Hoogte" value={`${cmToM(draft.height).toFixed(2)} m`} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <Stat label="Vloeroppervlak" value={`${floorArea} m²`} />
        <Stat label="Netto wand" value={`${totalNetWall.toFixed(2)} m²`} />
      </div>

      {(draft.floorType || draft.ceilingType) && (
        <div className="grid grid-cols-2 gap-2 text-center">
          <Stat
            label="Vloer"
            value={draft.floorType ? (floorTypeLabels[draft.floorType] ?? draft.floorType) : '—'}
          />
          <Stat
            label="Plafond"
            value={draft.ceilingType ? (ceilingTypeLabels[draft.ceilingType] ?? draft.ceilingType) : '—'}
          />
        </div>
      )}

      <div>
        <p className="mb-1 text-sm font-medium text-white">
          Wanden ({draft.walls.length})
        </p>
        <ul className="flex flex-col gap-1.5">
          {draft.walls.map((wall) => (
            <li
              key={wall.id}
              className="rounded-md border border-white/10 bg-app px-3 py-2 text-xs text-muted"
            >
              <span className="font-medium text-white">{wall.label}</span>
              {' — '}
              {wall.width}×{wall.height} cm ({wall.surfaceArea} m²)
              {wall.elements.length > 0 && (
                <span className="ml-1 text-muted">
                  · {wall.elements.length} element{wall.elements.length > 1 ? 'en' : ''}
                </span>
              )}
              {wall.details.length > 0 && (
                <span className="ml-1 text-muted">
                  · {wall.details.length} detail{wall.details.length > 1 ? 's' : ''}
                </span>
              )}
              {wall.photos.length > 0 && (
                <span className="ml-1 text-muted">
                  · {wall.photos.length} foto{wall.photos.length > 1 ? '\'s' : ''}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {draft.subSpaces.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium text-white">
            Sub-ruimtes ({draft.subSpaces.length})
          </p>
          <ul className="flex flex-col gap-1">
            {draft.subSpaces.map((s) => (
              <li key={s.id} className="text-xs text-muted">
                {s.name || 'Naamloos'} — {s.width}×{s.length} cm
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted/80">
        Totaal: {totalElements} elementen · {totalPhotos} foto&apos;s
      </p>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-app p-2">
    <p className="text-xs text-muted">{label}</p>
    <p className="text-sm font-semibold text-white">{value}</p>
  </div>
);
