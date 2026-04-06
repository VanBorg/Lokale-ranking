import { useRoomStore } from '../store/roomStore';
import { useUiStore } from '../store/uiStore';

export const useWizardValidation = () => {
  const draft = useRoomStore((s) => s.draft);
  const activeStep = useUiStore((s) => s.activeStep);

  const step0Valid =
    draft.name.trim().length > 0 &&
    draft.vertices.length >= 3 &&
    draft.height > 0;

  const canSave = step0Valid;

  const canAdvance = (): { ok: boolean; message?: string } => {
    if (activeStep === 0) {
      if (!draft.name.trim()) return { ok: false, message: 'Vul een kamernaam in.' };
      if (draft.vertices.length < 3) return { ok: false, message: 'De kamer heeft minimaal 3 hoekpunten nodig.' };
      if (draft.height <= 0) return { ok: false, message: 'Hoogte moet groter dan 0 zijn.' };
    }
    return { ok: true };
  };

  return { canAdvance, canSave, step0Valid };
};
