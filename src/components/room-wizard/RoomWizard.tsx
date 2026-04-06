import { useUiStore } from '../../store/uiStore';
import { WizardNavigation } from './WizardNavigation';
import { Step1Shape } from './steps/Step1Shape';
import { Step2Spaces } from './steps/Step2Spaces';
import { Step3Walls } from './steps/Step3Walls';
import { Step4Overview } from './steps/Step4Overview';

const steps = [Step1Shape, Step2Spaces, Step3Walls, Step4Overview];

export const RoomWizard = () => {
  const wizardOpen = useUiStore((s) => s.wizardOpen);
  const activeStep = useUiStore((s) => s.activeStep);

  if (!wizardOpen) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-400">
        <p className="text-lg font-medium">Geen actieve kamer</p>
        <p className="mt-1 text-sm">
          Klik op &quot;+ Nieuwe Kamer&quot; om te beginnen
        </p>
      </div>
    );
  }

  const StepComponent = steps[activeStep];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <StepComponent />
      </div>
      <WizardNavigation />
    </div>
  );
};
