import { useProjectStore } from '../../store/projectStore';
import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { Button } from '../ui/Button';

export const Header = () => {
  const projectName = useProjectStore((s) => s.project.name);
  const roomCount = useProjectStore((s) => s.project.rooms.length);
  const openWizard = useUiStore((s) => s.openWizard);
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
      <Button onClick={handleNewRoom}>+ Nieuwe Kamer</Button>
    </header>
  );
};
