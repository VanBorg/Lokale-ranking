import { useRoomStore } from '../../../../store/roomStore';
import { PRESET_LABELS } from '../../../../utils/presets';
import { calcPolygonArea } from '../../../../utils/geometry';

/** Read-only: the room shell is defined in step 1; step 2 only places zones inside it. */
export const RoomOutlineSummary = () => {
  const draft = useRoomStore((s) => s.draft);
  const area = calcPolygonArea(draft.vertices);

  return (
    <div className="rounded-lg border border-brand/35 bg-brand-light/70 p-3 text-sm text-muted">
      <p className="font-semibold text-white">Kamer uit stap 1</p>
      <p className="mt-1 text-muted">
        {PRESET_LABELS[draft.preset].label} · {draft.vertices.length} hoekpunten ·{' '}
        {area} m² · hoogte {draft.height} cm
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Vorm en buitenafmetingen staan vast. Wil je die wijzigen, ga naar{' '}
        <strong>Vorige</strong>. In deze stap plaats je alleen sub-ruimtes (zones) binnen
        deze kamer.
      </p>
    </div>
  );
};
