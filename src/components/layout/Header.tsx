import { useProjectStore } from '../../store/projectStore';
import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { Button } from '../ui/Button';

export const Header = () => {
  const projectName = useProjectStore((s) => s.project.name);
  const roomCount = useProjectStore((s) => s.project.rooms.length);
  const openWizard = useUiStore((s) => s.openWizard);
  const floorPlanOpen = useUiStore((s) => s.floorPlanOpen);
  const openFloorPlan = useUiStore((s) => s.openFloorPlan);
  const closeFloorPlan = useUiStore((s) => s.closeFloorPlan);
  const resetDraft = useRoomStore((s) => s.resetDraft);

  const handleNewRoom = () => {
    resetDraft();
    openWizard();
  };

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
          PB
        </div>
        <h1 className="text-lg font-semibold text-white">{projectName}</h1>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">
          {roomCount} {roomCount === 1 ? 'kamer' : 'kamers'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {floorPlanOpen ? (
          <button
            onClick={closeFloorPlan}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Terug
          </button>
        ) : (
          <button
            onClick={openFloorPlan}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/10 hover:text-white"
          >
            Plattegrond
          </button>
        )}
        <Button onClick={handleNewRoom}>+ Nieuwe Kamer</Button>
      </div>
    </header>
  );
};
