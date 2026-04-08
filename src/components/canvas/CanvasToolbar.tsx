import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../../constants/canvas';
import { useUiStore } from '../../store/uiStore';
import { getPanFloorPlanMapCentered, panAfterZoomToViewportCentre } from '../../utils/canvasView';
import { Button } from '../ui/Button';

interface CanvasToolbarProps {
  /** When set, replaces default reset (e.g. centre on single room). */
  onResetView?: () => void;
}

export const CanvasToolbar = ({ onResetView }: CanvasToolbarProps) => {
  const zoom = useUiStore((s) => s.canvasZoom);
  const setZoom = useUiStore((s) => s.setCanvasZoom);
  const setPan = useUiStore((s) => s.setCanvasPan);
  const vw = useUiStore((s) => s.floorPlanViewportWidth);
  const vh = useUiStore((s) => s.floorPlanViewportHeight);
  const gridVisible = useUiStore((s) => s.gridVisible);
  const toggleGrid = useUiStore((s) => s.toggleGrid);

  const safeW = vw > 0 ? vw : 800;
  const safeH = vh > 0 ? vh : 600;

  const zoomIn = () => {
    const st = useUiStore.getState();
    const oldZ = st.canvasZoom;
    const newZ = Math.min(oldZ + 0.15, 3);
    setZoom(newZ);
    setPan(panAfterZoomToViewportCentre(oldZ, newZ, st.canvasPan, safeW, safeH));
  };
  const zoomOut = () => {
    const st = useUiStore.getState();
    const oldZ = st.canvasZoom;
    const newZ = Math.max(oldZ - 0.15, MIN_CANVAS_ZOOM);
    setZoom(newZ);
    setPan(panAfterZoomToViewportCentre(oldZ, newZ, st.canvasPan, safeW, safeH));
  };
  const resetView = () => {
    if (onResetView) {
      onResetView();
      return;
    }
    setZoom(DEFAULT_CANVAS_ZOOM);
    setPan(getPanFloorPlanMapCentered(safeW, safeH, DEFAULT_CANVAS_ZOOM));
  };

  return (
    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-lg border border-line bg-surface p-1 shadow-sm">
      <Button variant="ghost" className="h-8 w-8 p-0! text-lg" onClick={zoomOut}>
        −
      </Button>
      <span className="min-w-[48px] text-center text-xs font-medium text-muted">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" className="h-8 w-8 p-0! text-lg" onClick={zoomIn}>
        +
      </Button>
      <div className="mx-1 h-4 w-px bg-line" />
      <Button
        variant={gridVisible ? 'secondary' : 'ghost'}
        className="h-8 px-2! py-0! text-xs"
        onClick={toggleGrid}
      >
        Raster
      </Button>
      <div className="mx-1 h-4 w-px bg-line" />
      <Button variant="ghost" className="h-8 px-2! py-0! text-xs" onClick={resetView}>
        Reset
      </Button>
    </div>
  );
};
