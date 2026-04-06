/**
 * How the floor-plan canvas behaves during the room wizard.
 * Each step uses the same draft room, but interaction and emphasis differ.
 */
export type WizardCanvasMode =
  | 'idle'
  | 'room-outline'
  | 'sub-space-layout'
  | 'floor-ceiling-preview'
  | 'walls-preview'
  | 'overview-preview';

export function getWizardCanvasMode(
  wizardOpen: boolean,
  activeStep: number,
): WizardCanvasMode {
  if (!wizardOpen) return 'idle';
  switch (activeStep) {
    case 0:
      return 'room-outline';
    case 1:
      return 'sub-space-layout';
    case 2:
      return 'floor-ceiling-preview';
    case 3:
      return 'walls-preview';
    case 4:
      return 'overview-preview';
    default:
      return 'room-outline';
  }
}

/** Short label on the map preview (Konva) so the current step is obvious. */
export const WIZARD_CANVAS_OVERLAY: Record<WizardCanvasMode, string | null> = {
  idle: null,
  'room-outline': 'Stap 1 — kameromtrek (vorm & afmetingen)',
  'sub-space-layout': 'Stap 2 — zones in deze kamer slepen',
  'floor-ceiling-preview': 'Stap 3 — vloer & plafond (afwerking)',
  'walls-preview': 'Stap 4 — wanden (details in het paneel)',
  'overview-preview': 'Stap 5 — laatste controle',
};
