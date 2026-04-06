import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../../constants/canvas';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';

interface CanvasToolbarProps {
  /** When set, replaces default reset (e.g. centre on single room). */
  onResetView?: () => void;
}

export const CanvasToolbar = ({ onResetView }: CanvasToolbarProps) => {
  const zoom = useUiStore((s) => s.canvasZoom);
  const setZoom = useUiStore((s) => s.setCanvasZoom);
  const setPan = useUiStore((s) => s.setCanvasPan);
  const gridVisible = useUiStore((s) => s.gridVisible);
  const toggleGrid = useUiStore((s) => s.toggleGrid);

  const zoomIn = () => setZoom(Math.min(zoom + 0.1, 3));
  const zoomOut = () => setZoom(Math.max(zoom - 0.1, MIN_CANVAS_ZOOM));
  const resetView = () => {
    if (onResetView) {
      onResetView();
      return;
    }
    setZoom(DEFAULT_CANVAS_ZOOM);
    setPan({ x: 0, y: 0 });
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
