import { useProjectStore } from '../../store/projectStore';
import { useUiStore } from '../../store/uiStore';

export const Statusbar = () => {
  const zoom = useUiStore((s) => s.canvasZoom);
  const roomCount = useProjectStore((s) => s.project.rooms.length);

  return (
    <footer className="flex items-center justify-between border-t border-line bg-app px-4 py-1 text-xs text-muted">
      <span>Kamers: {roomCount}</span>
      <span>Zoom: {Math.round(zoom * 100)}%</span>
    </footer>
  );
};
