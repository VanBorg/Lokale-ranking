import { useRoomStore } from '../../../../store/roomStore';
import { ROOM_SHAPE_LABELS } from '../../../../utils/shapeLabels';

/** Read-only: the room shell is defined in step 1; step 2 only places zones inside it. */
export const RoomOutlineSummary = () => {
  const draft = useRoomStore((s) => s.draft);

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50/90 p-3 text-sm text-gray-800">
      <p className="font-semibold text-gray-900">Kamer uit stap 1</p>
      <p className="mt-1 text-gray-800">
        {ROOM_SHAPE_LABELS[draft.shape]} · {draft.width}×{draft.length} cm ·
        hoogte {draft.height} cm
      </p>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">
        Vorm en buitenafmetingen staan vast. Wil je die wijzigen, ga naar{' '}
        <strong>Vorige</strong>. In deze stap plaats je alleen sub-ruimtes (zones)
        binnen deze kamer.
      </p>
    </div>
  );
};
