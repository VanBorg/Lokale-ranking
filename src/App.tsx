import type { ReactNode } from 'react';
import { useUiStore } from './store/uiStore';
import { AppLayout } from './components/layout/AppLayout';
import { FloorPlanCanvas } from './components/canvas/FloorPlanCanvas';
import { RoomWizard } from './components/room-wizard/RoomWizard';
import { WizardNavigation } from './components/room-wizard/WizardNavigation';
import { Step2Spaces } from './components/room-wizard/steps/Step2Spaces';

const FULLSCREEN_STEPS: Record<number, ReactNode> = {
  1: <Step2Spaces />,
};

export const App = () => {
  const activeStep = useUiStore((s) => s.activeStep);
  const wizardOpen = useUiStore((s) => s.wizardOpen);

  const stepContent = FULLSCREEN_STEPS[activeStep];
  const fullscreenContent =
    wizardOpen && stepContent != null ? (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">{stepContent}</div>
        <WizardNavigation />
      </div>
    ) : undefined;

  return (
    <AppLayout
      canvas={<FloorPlanCanvas />}
      wizard={<RoomWizard />}
      fullscreenContent={fullscreenContent}
    />
  );
};
