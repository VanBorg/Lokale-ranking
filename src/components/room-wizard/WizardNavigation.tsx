import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { Button } from '../ui/Button';

export const WizardNavigation = () => {
  const closeWizard = useUiStore((s) => s.closeWizard);
  const resetDraft = useRoomStore((s) => s.resetDraft);

  const handleCancel = () => {
    resetDraft();
    closeWizard();
  };

  return (
    <div className="border-t border-line bg-surface p-4">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={handleCancel}>
          Annuleren
        </Button>
      </div>
    </div>
  );
};
