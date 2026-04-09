import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { useProjectStore } from '../../store/projectStore';
import { Button } from '../ui/Button';

export const WizardNavigation = () => {
  const wizardStep = useUiStore((s) => s.wizardStep);
  const setWizardStep = useUiStore((s) => s.setWizardStep);
  const closeWizard = useUiStore((s) => s.closeWizard);
  const editingRoomId = useRoomStore((s) => s.editingRoomId);
  const finaliseRoom = useRoomStore((s) => s.finaliseRoom);
  const resetDraft = useRoomStore((s) => s.resetDraft);
  const addRoom = useProjectStore((s) => s.addRoom);
  const updateRoom = useProjectStore((s) => s.updateRoom);

  const handleSave = () => {
    const room = finaliseRoom();
    if (editingRoomId) {
      updateRoom(editingRoomId, room);
    } else {
      addRoom(room);
    }
    resetDraft();
    closeWizard();
  };

  return (
    <div className="border-t border-line bg-surface p-4">
      <div className="flex justify-between">
        {wizardStep === 1 ? (
          <Button variant="primary" className="ml-auto" onClick={() => setWizardStep(2)}>
            Volgende →
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setWizardStep(1)}>
              ← Vorige
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingRoomId ? 'Opslaan' : 'Toevoegen'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
