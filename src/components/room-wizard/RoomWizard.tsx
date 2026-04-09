import { useUiStore } from '../../store/uiStore';
import { WizardNavigation } from './WizardNavigation';
import { Step1Shape } from './steps/Step1Shape';
import { Step2Rooms } from './steps/Step2Rooms';

export const RoomWizard = () => {
  const wizardOpen = useUiStore((s) => s.wizardOpen);
  const wizardStep = useUiStore((s) => s.wizardStep);

  if (!wizardOpen) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted">
        <p className="text-lg font-medium text-white">Geen actieve kamer</p>
        <p className="mt-1 text-sm">
          Klik op &quot;+ Nieuwe Kamer&quot; om te beginnen
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {wizardStep === 1 ? <Step1Shape /> : <Step2Rooms />}
      </div>
      <WizardNavigation />
    </div>
  );
};
