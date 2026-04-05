import { useRoomStore } from '../store/roomStore';
import { useUiStore } from '../store/uiStore';

export const useWizardValidation = () => {
  const draft = useRoomStore((s) => s.draft);
  const activeStep = useUiStore((s) => s.activeStep);

  const step0Valid =
    draft.name.trim().length > 0 &&
    draft.width > 0 &&
    draft.length > 0 &&
    draft.height > 0;

  const step3Valid = draft.walls.length > 0;

  const canSave = step0Valid;

  const canAdvance = (): { ok: boolean; message?: string } => {
    if (activeStep === 0) {
      if (!draft.name.trim()) return { ok: false, message: 'Vul een kamernaam in.' };
      if (draft.width <= 0 || draft.length <= 0 || draft.height <= 0)
        return { ok: false, message: 'Alle afmetingen moeten groter dan 0 zijn.' };
    }
    return { ok: true };
  };

  return { canAdvance, canSave, step0Valid, step3Valid };
};
