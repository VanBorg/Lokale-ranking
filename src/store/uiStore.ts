import { create } from 'zustand';
import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../constants/canvas';

interface UiState {
  activeStep: number;
  activeWallIndex: number;
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  /** Last measured floor-plan container size — used when placing the first room and toolbar zoom. */
  floorPlanViewportWidth: number;
  floorPlanViewportHeight: number;
  wizardOpen: boolean;
  gridVisible: boolean;
  hoveredWallIndex: number | null;

  setActiveStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setActiveWallIndex: (index: number) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  setFloorPlanViewport: (width: number, height: number) => void;
  openWizard: () => void;
  closeWizard: () => void;
  toggleGrid: () => void;
  resetUi: () => void;
  setHoveredWallIndex: (index: number | null) => void;
}

const TOTAL_STEPS = 4;

export const useUiStore = create<UiState>()((set) => ({
  activeStep: 0,
  activeWallIndex: 0,
  canvasZoom: DEFAULT_CANVAS_ZOOM,
  canvasPan: { x: 0, y: 0 },
  floorPlanViewportWidth: 0,
  floorPlanViewportHeight: 0,
  wizardOpen: false,
  gridVisible: true,
  hoveredWallIndex: null,

  setActiveStep: (step) => set({ activeStep: step }),
  nextStep: () =>
    set((s) => ({ activeStep: Math.min(s.activeStep + 1, TOTAL_STEPS - 1) })),
  prevStep: () =>
    set((s) => ({ activeStep: Math.max(s.activeStep - 1, 0) })),
  setActiveWallIndex: (index) => set({ activeWallIndex: index }),
  setCanvasZoom: (zoom) =>
    set({ canvasZoom: Math.min(3, Math.max(MIN_CANVAS_ZOOM, zoom)) }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  setFloorPlanViewport: (width, height) =>
    set({ floorPlanViewportWidth: width, floorPlanViewportHeight: height }),
  openWizard: () => set({ wizardOpen: true, activeStep: 0, activeWallIndex: 0 }),
  closeWizard: () => set({ wizardOpen: false }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  resetUi: () =>
    set({ activeStep: 0, activeWallIndex: 0, wizardOpen: false }),
  setHoveredWallIndex: (index) => set({ hoveredWallIndex: index }),
}));
