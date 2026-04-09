import { create } from 'zustand';
import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../constants/canvas';

interface UiState {
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  /** Last measured floor-plan container size — used when placing the first room and toolbar zoom. */
  floorPlanViewportWidth: number;
  floorPlanViewportHeight: number;
  wizardOpen: boolean;
  wizardStep: 1 | 2;
  gridVisible: boolean;
  hoveredWallIndex: number | null;
  selectedSubRoomId: string | null;
  hoveredSubRoomWallIndex: number | null;
  /** Whether the full-screen floor plan view is active. */
  floorPlanOpen: boolean;

  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  setFloorPlanViewport: (width: number, height: number) => void;
  openWizard: () => void;
  closeWizard: () => void;
  setWizardStep: (step: 1 | 2) => void;
  toggleGrid: () => void;
  setHoveredWallIndex: (index: number | null) => void;
  selectSubRoom: (id: string | null) => void;
  setHoveredSubRoomWallIndex: (index: number | null) => void;
  openFloorPlan: () => void;
  closeFloorPlan: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  canvasZoom: DEFAULT_CANVAS_ZOOM,
  canvasPan: { x: 0, y: 0 },
  floorPlanViewportWidth: 0,
  floorPlanViewportHeight: 0,
  wizardOpen: false,
  wizardStep: 1,
  gridVisible: true,
  hoveredWallIndex: null,
  selectedSubRoomId: null,
  hoveredSubRoomWallIndex: null,
  floorPlanOpen: false,

  setCanvasZoom: (zoom) =>
    set({ canvasZoom: Math.min(3, Math.max(MIN_CANVAS_ZOOM, zoom)) }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  setFloorPlanViewport: (width, height) =>
    set({ floorPlanViewportWidth: width, floorPlanViewportHeight: height }),
  openWizard: () => set({ wizardOpen: true }),
  closeWizard: () =>
    set({ wizardOpen: false, wizardStep: 1, hoveredWallIndex: null, selectedSubRoomId: null, hoveredSubRoomWallIndex: null }),
  setWizardStep: (step) => set({ wizardStep: step, selectedSubRoomId: null, hoveredSubRoomWallIndex: null }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  setHoveredWallIndex: (index) => set({ hoveredWallIndex: index }),
  selectSubRoom: (id) => set({ selectedSubRoomId: id, hoveredSubRoomWallIndex: null }),
  setHoveredSubRoomWallIndex: (index) => set({ hoveredSubRoomWallIndex: index }),
  openFloorPlan: () => set({ floorPlanOpen: true }),
  closeFloorPlan: () => set({ floorPlanOpen: false }),
}));
