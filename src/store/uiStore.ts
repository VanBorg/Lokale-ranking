import { create } from 'zustand';

interface UiState {
  activeStep: number;
  activeWallIndex: number;
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  wizardOpen: boolean;
  gridVisible: boolean;

  setActiveStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setActiveWallIndex: (index: number) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  openWizard: () => void;
  closeWizard: () => void;
  toggleGrid: () => void;
  resetUi: () => void;
}

const TOTAL_STEPS = 4;

export const useUiStore = create<UiState>()((set) => ({
  activeStep: 0,
  activeWallIndex: 0,
  canvasZoom: 1,
  canvasPan: { x: 0, y: 0 },
  wizardOpen: false,
  gridVisible: true,

  setActiveStep: (step) => set({ activeStep: step }),
  nextStep: () =>
    set((s) => ({ activeStep: Math.min(s.activeStep + 1, TOTAL_STEPS - 1) })),
  prevStep: () =>
    set((s) => ({ activeStep: Math.max(s.activeStep - 1, 0) })),
  setActiveWallIndex: (index) => set({ activeWallIndex: index }),
  setCanvasZoom: (zoom) => set({ canvasZoom: zoom }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  openWizard: () => set({ wizardOpen: true, activeStep: 0, activeWallIndex: 0 }),
  closeWizard: () => set({ wizardOpen: false }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  resetUi: () =>
    set({ activeStep: 0, activeWallIndex: 0, wizardOpen: false }),
}));
