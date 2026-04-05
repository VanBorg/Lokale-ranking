import { useUiStore } from '../store/uiStore';

const TOTAL_STEPS = 4;

export const useWizardStep = () => {
  const activeStep = useUiStore((s) => s.activeStep);
  const setActiveStep = useUiStore((s) => s.setActiveStep);
  const nextStep = useUiStore((s) => s.nextStep);
  const prevStep = useUiStore((s) => s.prevStep);

  const isFirst = activeStep === 0;
  const isLast = activeStep === TOTAL_STEPS - 1;

  const goTo = (step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) setActiveStep(step);
  };

  return { activeStep, nextStep, prevStep, goTo, isFirst, isLast, totalSteps: TOTAL_STEPS };
};
