/**
 * How the floor-plan canvas behaves during the room wizard.
 * Each step uses the same draft room, but interaction differs.
 */
export type WizardCanvasMode =
  | 'idle'
  | 'room-outline'      // step 0: drag vertex handles, dashed outline
  | 'sub-space-layout'  // step 1: drag zones inside locked outline
  | 'walls-preview'     // step 2: read-only, dimmed
  | 'overview-preview'; // step 3: read-only, dimmed

export function getWizardCanvasMode(
  wizardOpen: boolean,
  activeStep: number,
): WizardCanvasMode {
  if (!wizardOpen) return 'idle';
  switch (activeStep) {
    case 0: return 'room-outline';
    case 1: return 'sub-space-layout';
    case 2: return 'walls-preview';
    case 3: return 'overview-preview';
    default: return 'room-outline';
  }
}
