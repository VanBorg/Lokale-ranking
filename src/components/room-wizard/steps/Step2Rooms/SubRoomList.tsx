import { useRoomStore } from '../../../../store/roomStore';
import { useUiStore } from '../../../../store/uiStore';
import { roomTypeLabels } from '../../../../utils/roomNaming';

export const SubRoomList = () => {
  const subRooms = useRoomStore((s) => s.draft.subRooms);
  const removeSubRoom = useRoomStore((s) => s.removeSubRoom);
  const selectedId = useUiStore((s) => s.selectedSubRoomId);
  const selectSubRoom = useUiStore((s) => s.selectSubRoom);

  if (subRooms.length === 0) return null;

  const handleRemove = (id: string) => {
    removeSubRoom(id);
    if (selectedId === id) selectSubRoom(null);
  };

  return (
    <div className="flex flex-col gap-1 px-4 pb-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Geplaatste ruimtes</p>
      <div className="flex flex-col gap-1">
        {subRooms.map((sr) => {
          const label = sr.name || roomTypeLabels[sr.roomType] || 'Ruimte';
          const isActive = sr.id === selectedId;
          return (
            <div
              key={sr.id}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? 'border-orange-400 bg-orange-400/10'
                  : 'border-line bg-app hover:border-orange-400/50'
              }`}
            >
              <button
                type="button"
                onClick={() => selectSubRoom(sr.id)}
                className="flex flex-1 items-center gap-2 text-left min-w-0"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: isActive ? '#fb923c' : '#64748b' }}
                />
                <span className={`truncate ${isActive ? 'text-white' : 'text-muted'}`}>
                  {label}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Verwijder ${label}`}
                onClick={() => handleRemove(sr.id)}
                className="shrink-0 text-red-500 hover:text-red-300 transition-colors text-base font-bold leading-none"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
