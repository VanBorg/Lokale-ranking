import { create } from 'zustand';
import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../constants/canvas';

interface UiState {
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  /** Last measured floor-plan container size — used when placing the first room and toolbar zoom. */
  floorPlanViewportWidth: number;
  floorPlanViewportHeight: number;
  wizardOpen: boolean;
  gridVisible: boolean;
  hoveredWallIndex: number | null;

  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  setFloorPlanViewport: (width: number, height: number) => void;
  openWizard: () => void;
  closeWizard: () => void;
  toggleGrid: () => void;
  setHoveredWallIndex: (index: number | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  canvasZoom: DEFAULT_CANVAS_ZOOM,
  canvasPan: { x: 0, y: 0 },
  floorPlanViewportWidth: 0,
  floorPlanViewportHeight: 0,
  wizardOpen: false,
  gridVisible: true,
  hoveredWallIndex: null,

  setCanvasZoom: (zoom) =>
    set({ canvasZoom: Math.min(3, Math.max(MIN_CANVAS_ZOOM, zoom)) }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  setFloorPlanViewport: (width, height) =>
    set({ floorPlanViewportWidth: width, floorPlanViewportHeight: height }),
  openWizard: () => set({ wizardOpen: true }),
  closeWizard: () => set({ wizardOpen: false, hoveredWallIndex: null }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  setHoveredWallIndex: (index) => set({ hoveredWallIndex: index }),
}));
