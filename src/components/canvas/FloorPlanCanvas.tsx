import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import {
  DEFAULT_CANVAS_ZOOM,
  FLOOR_PLAN_CANVAS_H,
  FLOOR_PLAN_CANVAS_W,
} from '../../constants/canvas';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useRoomStore } from '../../store/roomStore';
import { useRoomCanvas } from '../../hooks/useRoomCanvas';
import {
  getDraftPreviewWorldPosition,
  panToCenterRoomOnViewport,
} from '../../utils/canvasView';
import {
  getWizardCanvasMode,
} from '../../utils/wizardCanvas';
import { CanvasGrid } from './CanvasGrid';
import { CanvasToolbar } from './CanvasToolbar';
import { RoomBlock } from './RoomBlock';
import { RoomPreview } from './RoomPreview';

export const FloorPlanCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const { zoom, pan, handleWheel, handleDragEnd } = useRoomCanvas();

  const setCanvasPan = useUiStore((s) => s.setCanvasPan);
  const setCanvasZoom = useUiStore((s) => s.setCanvasZoom);
  const wizardOpen = useUiStore((s) => s.wizardOpen);
  const activeStep = useUiStore((s) => s.activeStep);
  const gridVisible = useUiStore((s) => s.gridVisible);

  const wizardCanvasMode = useMemo(
    () => getWizardCanvasMode(wizardOpen, activeStep),
    [wizardOpen, activeStep],
  );
  /** Stap 2: sub-space layout — Stage pannen uit (anders breekt drag). Zoom: muiswiel. */
  const isSubSpaceLayoutStep = wizardCanvasMode === 'sub-space-layout';

  const rooms = useProjectStore((s) => s.project.rooms);

  const draft = useRoomStore((s) => s.draft);
  const editingRoomId = useRoomStore((s) => s.editingRoomId);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);

  const draftPreviewPos = useMemo(() => {
    if (!wizardOpen) return { x: 0, y: 0 };
    return getDraftPreviewWorldPosition(
      draft.shape,
      draft.width,
      draft.length,
      size.width,
      size.height,
      zoom,
      pan,
    );
  }, [
    wizardOpen,
    draft.shape,
    draft.width,
    draft.length,
    size.width,
    size.height,
    zoom,
    pan.x,
    pan.y,
  ]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /** Tracks previous room count so we only auto-centre when going from 0 → 1 (first kamer / nieuw project). */
  const prevRoomCountRef = useRef(0);

  useEffect(() => {
    const prev = prevRoomCountRef.current;
    prevRoomCountRef.current = rooms.length;
    if (rooms.length !== 1 || prev !== 0) return;
    const room = rooms[0];
    if (!room) return;
    setCanvasZoom(DEFAULT_CANVAS_ZOOM);
    setCanvasPan(
      panToCenterRoomOnViewport(
        room,
        size.width,
        size.height,
        DEFAULT_CANVAS_ZOOM,
      ),
    );
  }, [rooms, size.width, size.height, setCanvasPan, setCanvasZoom]);

  const handleResetView = useCallback(() => {
    setCanvasZoom(DEFAULT_CANVAS_ZOOM);
    if (rooms.length === 1 && rooms[0]) {
      setCanvasPan(
        panToCenterRoomOnViewport(
          rooms[0],
          size.width,
          size.height,
          DEFAULT_CANVAS_ZOOM,
        ),
      );
    } else {
      setCanvasPan({ x: 0, y: 0 });
    }
  }, [rooms, size.width, size.height, setCanvasPan, setCanvasZoom]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Stage
        width={size.width}
        height={size.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable={!isSubSpaceLayoutStep}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {gridVisible && (
            <CanvasGrid width={FLOOR_PLAN_CANVAS_W} height={FLOOR_PLAN_CANVAS_H} />
          )}
          {rooms.map((room) => (
            <RoomBlock
              key={room.id}
              room={room}
              dimmed={editingRoomId === room.id}
            />
          ))}
        </Layer>
        {wizardOpen && (
          <Layer>
            <RoomPreview
              draft={draft}
              x={draftPreviewPos.x}
              y={draftPreviewPos.y}
              canvasMode={wizardCanvasMode}
              onSubSpacePositionChange={(id, position) =>
                updateSubSpace(id, { position })
              }
            />
          </Layer>
        )}
      </Stage>
      <CanvasToolbar onResetView={handleResetView} />
    </div>
  );
};
