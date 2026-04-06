import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useRoomStore } from '../../store/roomStore';
import { useWizardValidation } from '../../hooks/useWizardValidation';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

const STEP_LABELS = ['Vorm', 'Zones', 'Wanden', 'Overzicht'];
const TOTAL = STEP_LABELS.length;

export const WizardNavigation = () => {
  const step = useUiStore((s) => s.activeStep);
  const next = useUiStore((s) => s.nextStep);
  const prev = useUiStore((s) => s.prevStep);
  const closeWizard = useUiStore((s) => s.closeWizard);
  const resetDraft = useRoomStore((s) => s.resetDraft);
  const { canAdvance } = useWizardValidation();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    resetDraft();
    closeWizard();
  };

  const handleNext = () => {
    const result = canAdvance();
    if (!result.ok) {
      setError(result.message ?? 'Controleer de invoer.');
      return;
    }
    setError(null);
    next();
  };

  return (
    <div className="border-t border-line bg-surface p-4">
      <ProgressBar current={step + 1} total={TOTAL} />
      <p className="mt-2 mb-3 text-center text-xs text-muted">
        Stap {step + 1} van {TOTAL}: {STEP_LABELS[step]}
      </p>
      {error && (
        <p className="mb-2 rounded-md bg-red-950/50 px-3 py-1.5 text-center text-xs text-red-400">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={handleCancel}>
          Annuleren
        </Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => { setError(null); prev(); }}>
              Vorige
            </Button>
          )}
          {step < TOTAL - 1 && <Button onClick={handleNext}>Volgende</Button>}
        </div>
      </div>
    </div>
  );
};
