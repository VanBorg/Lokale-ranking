import { useRoomStore } from '../../../../store/roomStore';
import { useProjectStore } from '../../../../store/projectStore';
import { useUiStore } from '../../../../store/uiStore';
import { useWizardValidation } from '../../../../hooks/useWizardValidation';
import { Button } from '../../../ui/Button';

export const SaveActions = () => {
  const finaliseRoom = useRoomStore((s) => s.finaliseRoom);
  const resetDraft = useRoomStore((s) => s.resetDraft);
  const editingRoomId = useRoomStore((s) => s.editingRoomId);

  const addRoom = useProjectStore((s) => s.addRoom);
  const updateRoom = useProjectStore((s) => s.updateRoom);

  const closeWizard = useUiStore((s) => s.closeWizard);
  const resetUi = useUiStore((s) => s.resetUi);
  const { canSave } = useWizardValidation();

  const handleSave = () => {
    const room = finaliseRoom();

    if (editingRoomId) {
      updateRoom(editingRoomId, room);
    } else {
      addRoom(room);
    }

    resetDraft();
    resetUi();
    closeWizard();
  };

  return (
    <div className="flex flex-col gap-2">
      {!canSave && (
        <p className="text-center text-xs text-red-400">
          Vul minimaal een kamernaam en geldige afmetingen in om op te slaan.
        </p>
      )}
      <Button className="w-full" onClick={handleSave} disabled={!canSave}>
        {editingRoomId
          ? 'Kamer bijwerken'
          : 'Kamer opslaan en op plattegrond plaatsen'}
      </Button>
    </div>
  );
};
