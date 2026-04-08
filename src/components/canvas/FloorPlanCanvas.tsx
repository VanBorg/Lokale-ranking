import { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../../constants/canvas';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useRoomStore } from '../../store/roomStore';
import { useRoomCanvas } from '../../hooks/useRoomCanvas';
import { useAutoRoomPan } from '../../hooks/useAutoRoomPan';
import {
  centerDraftRoomInFloorPlan,
  getPanFloorPlanMapCentered,
  panToCenterRoomOnViewport,
} from '../../utils/canvasView';
import { getWizardCanvasMode } from '../../utils/wizardCanvas';
import { CanvasGrid } from './CanvasGrid';
import { CanvasToolbar } from './CanvasToolbar';
import { RoomBlock } from './RoomBlock';
import { RoomPreview } from './RoomPreview';
import {
  ROOM_CANVAS_SCALE,
  GRID_BUFFER_CELLS,
  GRID_MIN_CELLS,
  computeGridExtentCells,
} from '../../utils/geometry';

/**
 * Measures the plattegrond viewport from the nearest `<main>` element.
 * Using `main` avoids flex-layout timing issues when the wizard panel opens/closes.
 */
function measurePlattegrondViewport(
  el: HTMLDivElement | null,
  fallback: { width: number; height: number },
): { width: number; height: number } {
  if (!el) return fallback;
  const scope = (el.closest('main') ?? el) as HTMLElement;
  const r = scope.getBoundingClientRect();
  const w = Math.round(r.width);
  const h = Math.round(r.height);
  return w > 0 && h > 0 ? { width: w, height: h } : fallback;
}

export const FloorPlanCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAutoZoomRef = useRef<number | null>(null);
  const draftPreviewInitRef = useRef(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [draftPreviewPos, setDraftPreviewPos] = useState({ x: 0, y: 0 });
  const [isStagePanning, setIsStagePanning] = useState(false);

  const setCanvasPan = useUiStore((s) => s.setCanvasPan);
  const setCanvasZoom = useUiStore((s) => s.setCanvasZoom);
  const setFloorPlanViewport = useUiStore((s) => s.setFloorPlanViewport);
  const zoomValue = useUiStore((s) => s.canvasZoom);
  const wizardOpen = useUiStore((s) => s.wizardOpen);
  const activeStep = useUiStore((s) => s.activeStep);
  const gridVisible = useUiStore((s) => s.gridVisible);

  const rooms = useProjectStore((s) => s.project.rooms);
  const draft = useRoomStore((s) => s.draft);
  const editingRoomId = useRoomStore((s) => s.editingRoomId);
  const updateVertex = useRoomStore((s) => s.updateVertex);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);
  const zonePlacementMode = useRoomStore((s) => s.draft.zonePlacementMode);

  const editingRoom =
    wizardOpen && editingRoomId ? rooms.find((r) => r.id === editingRoomId) : undefined;
  /** New-room draft uses local state; editing uses the saved room position (avoids setState in an effect). */
  const roomPreviewWorldPos = editingRoom ? editingRoom.position : draftPreviewPos;

  const wizardCanvasMode = useMemo(
    () => getWizardCanvasMode(wizardOpen, activeStep),
    [wizardOpen, activeStep],
  );

  const vpW = Math.max(size.width, 1);
  const vpH = Math.max(size.height, 1);
  const defaultZoom = size.height > 0 ? size.height / (1600 * ROOM_CANVAS_SCALE) : DEFAULT_CANVAS_ZOOM;

  const { cols: gridCols, rows: gridRows, cellPx: gridCellSize } = computeGridExtentCells(
    vpW, vpH, MIN_CANVAS_ZOOM, GRID_BUFFER_CELLS, GRID_MIN_CELLS,
  );
  const gridWidth = gridCols * gridCellSize;
  const gridHeight = gridRows * gridCellSize;

  const { zoom, pan, handleWheel, handleDragMove, handleDragEnd } = useRoomCanvas({
    viewportWidth: vpW,
    viewportHeight: vpH,
    contentWidth: gridWidth,
    contentHeight: gridHeight,
    defaultZoom,
  });

  // Reset lastAutoZoomRef when the user manually zooms
  useEffect(() => {
    if (lastAutoZoomRef.current === null) return;
    if (Math.abs(zoomValue - lastAutoZoomRef.current) > 0.02) lastAutoZoomRef.current = null;
  }, [zoomValue]);

  // Auto-pan when rooms are added
  useAutoRoomPan(rooms, vpW, vpH, defaultZoom, lastAutoZoomRef);

  // First sync: measure the plattegrond column on mount
  useLayoutEffect(() => {
    const el = containerRef.current;
    const next = measurePlattegrondViewport(el, { width: 0, height: 0 });
    if (next.width <= 0 || next.height <= 0) return;
    setSize(next);
    setFloorPlanViewport(next.width, next.height);
  }, [setFloorPlanViewport]);

  // Reset draft init when wizard closes (preview is unmounted; position is re-applied on next open).
  useLayoutEffect(() => {
    if (!wizardOpen) draftPreviewInitRef.current = false;
  }, [wizardOpen]);

  // Centre new-room draft from measured viewport (ref); editing uses `roomPreviewWorldPos` from render.
  useLayoutEffect(() => {
    if (!wizardOpen || draftPreviewInitRef.current) return;
    const existing = editingRoomId ? rooms.find((r) => r.id === editingRoomId) : undefined;
    if (existing) {
      draftPreviewInitRef.current = true;
      return;
    }

    draftPreviewInitRef.current = true;
    const { width: vw, height: vh } = measurePlattegrondViewport(containerRef.current, {
      width: size.width,
      height: size.height,
    });
    const z = useUiStore.getState().canvasZoom;
    const { draftPos, pan } = centerDraftRoomInFloorPlan(draft.vertices, vw, vh, z);
    setDraftPreviewPos(draftPos);
    setCanvasPan(pan);
  }, [wizardOpen, editingRoomId, rooms, draft.vertices, size.width, size.height, setCanvasPan]);

  // ResizeObserver: update size + re-centre draft or auto-zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const target = entry.target as HTMLDivElement;
      const next = measurePlattegrondViewport(target, {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
      const { width: w, height: h } = next;
      setSize({ width: w, height: h });
      setFloorPlanViewport(w, h);
      if (w <= 0 || h <= 0) return;

      const st = useUiStore.getState();
      const rs = useRoomStore.getState();

      // Re-centre draft preview on resize (new rooms only, not when editing)
      if (st.wizardOpen && !rs.editingRoomId) {
        const z = st.canvasZoom;
        const { draftPos, pan } = centerDraftRoomInFloorPlan(rs.draft.vertices, w, h, z);
        setDraftPreviewPos(draftPos);
        setCanvasPan(pan);
      }

      if (st.wizardOpen) return;

      // Auto-fit zoom on resize when no manual zoom has been applied
      const dz = h / (1600 * ROOM_CANVAS_SCALE);
      const zNow = st.canvasZoom;
      const storeStillBootstrap = zNow === DEFAULT_CANVAS_ZOOM;
      const stillOnAutoZoom =
        lastAutoZoomRef.current !== null && Math.abs(zNow - lastAutoZoomRef.current) < 0.008;

      if (storeStillBootstrap || stillOnAutoZoom) {
        setCanvasZoom(dz);
        setCanvasPan(getPanFloorPlanMapCentered(w, h, dz));
        lastAutoZoomRef.current = dz;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [setCanvasZoom, setCanvasPan, setFloorPlanViewport]);

  const z = zoom > 0 ? zoom : 1;
  const worldLeft = -pan.x / z;
  const worldTop = -pan.y / z;
  const worldRight = worldLeft + vpW / z;
  const worldBottom = worldTop + vpH / z;

  const handleResetView = () => {
    setCanvasZoom(defaultZoom);
    if (rooms.length === 1 && rooms[0]) {
      setCanvasPan(panToCenterRoomOnViewport(rooms[0], vpW, vpH, defaultZoom));
      lastAutoZoomRef.current = null;
    } else {
      setCanvasPan(getPanFloorPlanMapCentered(vpW, vpH, defaultZoom));
      lastAutoZoomRef.current = defaultZoom;
    }
  };

  return (
    <div
      ref={containerRef}
      data-debug-floor-canvas
      className="h-full w-full bg-app"
      style={{ cursor: isStagePanning ? 'grabbing' : 'grab' }}
    >
      <Stage
        width={vpW}
        height={vpH}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable
        onWheel={handleWheel}
        onDragStart={(e) => {
          if (e.target.draggable() && e.target !== e.target.getStage()) return;
          setIsStagePanning(true);
        }}
        onDragMove={handleDragMove}
        onDragEnd={(e) => {
          handleDragEnd(e);
          setIsStagePanning(false);
        }}
      >
        <Layer>
          {gridVisible && (
            <CanvasGrid
              cellSize={gridCellSize}
              worldLeft={worldLeft}
              worldTop={worldTop}
              worldRight={worldRight}
              worldBottom={worldBottom}
            />
          )}
          {rooms.map((room) => (
            <RoomBlock key={room.id} room={room} dimmed={editingRoomId === room.id} />
          ))}
        </Layer>
        {wizardOpen && (
          <Layer>
            <RoomPreview
              x={roomPreviewWorldPos.x}
              y={roomPreviewWorldPos.y}
              vertices={draft.vertices}
              walls={draft.walls}
              subSpaces={draft.subSpaces}
              roomType={draft.roomType}
              canvasMode={wizardCanvasMode}
              zonePlacementMode={zonePlacementMode}
              onVertexDrag={(index, pos) => updateVertex(index, pos)}
              onZoneChange={(id, updates) => updateSubSpace(id, updates)}
            />
          </Layer>
        )}
      </Stage>
      <CanvasToolbar onResetView={handleResetView} />
    </div>
  );
};
