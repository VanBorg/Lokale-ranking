import { useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../../constants/canvas';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useRoomStore } from '../../store/roomStore';
import { useRoomCanvas } from '../../hooks/useRoomCanvas';
import { useAutoZoom } from '../../hooks/useAutoZoom';
import { getDraftPreviewWorldPosition, panToCenterRoomOnViewport } from '../../utils/canvasView';
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
  symmetricGridPanForViewport,
} from '../../utils/geometry';

export const FloorPlanCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appliedInitialZoomRef = useRef(false);
  const pendingPreviewSyncRef = useRef(false);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const zoomValue = useUiStore((s) => s.canvasZoom);
  const defaultZoom =
    size.height > 0 ? size.height / (1600 * ROOM_CANVAS_SCALE) : DEFAULT_CANVAS_ZOOM;
  // Pan clamp bounds must not track live zoom — otherwise content size jumps every wheel step.
  const { cols: gridCols, rows: _gridRows, cellPx: gridCellSize } = computeGridExtentCells(
    size.width,
    size.height,
    MIN_CANVAS_ZOOM,
    GRID_BUFFER_CELLS,
    GRID_MIN_CELLS,
  );
  const gridRows = 26; // 52 m visible at max zoom-out (3× the 16 m default view)
  const gridWidth = gridCols * gridCellSize;
  const gridHeight = gridRows * gridCellSize;

  const { zoom, pan, handleWheel, handleDragEnd } = useRoomCanvas({
    viewportWidth: size.width,
    viewportHeight: size.height,
    contentWidth: gridWidth,
    contentHeight: gridHeight,
    defaultZoom,
  });

  const z = zoom > 0 ? zoom : 1;
  const worldLeft = -pan.x / z;
  const worldTop = -pan.y / z;
  const worldRight = worldLeft + size.width / z;
  const worldBottom = worldTop + size.height / z;
  const setCanvasPan = useUiStore((s) => s.setCanvasPan);
  const setCanvasZoom = useUiStore((s) => s.setCanvasZoom);
  const wizardOpen = useUiStore((s) => s.wizardOpen);
  const activeStep = useUiStore((s) => s.activeStep);
  const gridVisible = useUiStore((s) => s.gridVisible);

  const wizardCanvasMode = useMemo(
    () => getWizardCanvasMode(wizardOpen, activeStep),
    [wizardOpen, activeStep],
  );
  const isSubSpaceLayoutStep = wizardCanvasMode === 'sub-space-layout';

  const rooms = useProjectStore((s) => s.project.rooms);
  const draft = useRoomStore((s) => s.draft);
  const editingRoomId = useRoomStore((s) => s.editingRoomId);
  const updateVertex = useRoomStore((s) => s.updateVertex);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);
  const shouldAutoZoom = wizardCanvasMode === 'room-outline' && Boolean(editingRoomId);

  useAutoZoom(draft.vertices, size.width, size.height, shouldAutoZoom);

  // Draft room: keep it centred in the viewport whenever zoom/pan/size change (clampPan
  // after zoom can move the view — without this, the room drifts). Vertex drags do not
  // change zoom/pan, so the preview stays put while dragging handles.
  const [draftPreviewPos, setDraftPreviewPos] = useState({ x: 0, y: 0 });

  const readViewportSize = useCallback(() => {
    const el = containerRef.current;
    const r = el?.getBoundingClientRect();
    const vw = r && r.width > 0 ? r.width : size.width;
    const vh = r && r.height > 0 ? r.height : size.height;
    return { vw, vh };
  }, [size.width, size.height]);

  // Sync state width/height with the real canvas pane (left column only — not the whole window).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      setSize({ width: r.width, height: r.height });
    }
  }, []);

  useLayoutEffect(() => {
    if (!wizardOpen) return;
    if (shouldAutoZoom) {
      pendingPreviewSyncRef.current = true;
      return;
    }
    const { vw, vh } = readViewportSize();
    setDraftPreviewPos(getDraftPreviewWorldPosition(draft.vertices, vw, vh, zoom, pan));
  }, [
    wizardOpen,
    shouldAutoZoom,
    readViewportSize,
    size.width,
    size.height,
    zoom,
    pan.x,
    pan.y,
    draft.preset,
  ]);

  useLayoutEffect(() => {
    if (!wizardOpen) return;
    if (!pendingPreviewSyncRef.current) return;
    const { vw, vh } = readViewportSize();
    setDraftPreviewPos(getDraftPreviewWorldPosition(draft.vertices, vw, vh, zoom, pan));
    pendingPreviewSyncRef.current = false;
  }, [wizardOpen, readViewportSize, zoom, pan.x, pan.y, size.width, size.height]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (appliedInitialZoomRef.current) return;
    if (zoomValue !== DEFAULT_CANVAS_ZOOM) return;
    if (size.width <= 0 || size.height <= 0) return;
    setCanvasZoom(defaultZoom);
    setCanvasPan(symmetricGridPanForViewport(size.width, size.height, defaultZoom));
    appliedInitialZoomRef.current = true;
  }, [defaultZoom, size.width, size.height, zoomValue, setCanvasZoom, setCanvasPan]);

  const prevRoomCountRef = useRef(0);
  useEffect(() => {
    const prev = prevRoomCountRef.current;
    prevRoomCountRef.current = rooms.length;
    if (rooms.length !== 1 || prev !== 0) return;
    const room = rooms[0];
    if (!room) return;
    setCanvasZoom(defaultZoom);
    setCanvasPan(panToCenterRoomOnViewport(room, size.width, size.height, defaultZoom));
  }, [rooms, size.width, size.height, defaultZoom, setCanvasPan, setCanvasZoom]);

  const prevRoomIdsRef = useRef<string[]>([]);
  useEffect(() => {
    const prevIds = prevRoomIdsRef.current;
    const nextIds = rooms.map((room) => room.id);
    prevRoomIdsRef.current = nextIds;
    if (nextIds.length <= prevIds.length) return;
    if (prevIds.length === 0 && nextIds.length === 1) return;
    const newRoom = rooms[rooms.length - 1];
    if (!newRoom) return;
    setCanvasPan(panToCenterRoomOnViewport(newRoom, size.width, size.height, zoomValue));
  }, [rooms, size.width, size.height, zoomValue, setCanvasPan]);

  const handleResetView = useCallback(() => {
    setCanvasZoom(defaultZoom);
    if (rooms.length === 1 && rooms[0]) {
      setCanvasPan(panToCenterRoomOnViewport(rooms[0], size.width, size.height, defaultZoom));
    } else {
      setCanvasPan(symmetricGridPanForViewport(size.width, size.height, defaultZoom));
    }
  }, [rooms, size.width, size.height, defaultZoom, setCanvasPan, setCanvasZoom]);

  return (
    <div ref={containerRef} className="h-full w-full bg-app" style={{ cursor: isSubSpaceLayoutStep ? 'default' : 'grab' }}>
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
              x={draftPreviewPos.x}
              y={draftPreviewPos.y}
              vertices={draft.vertices}
              walls={draft.walls}
              subSpaces={draft.subSpaces}
              name={draft.name}
              canvasMode={wizardCanvasMode}
              onVertexDrag={(index, pos) => updateVertex(index, pos)}
              onZoneDrag={(id, pos) => updateSubSpace(id, { position: pos })}
            />
          </Layer>
        )}
      </Stage>
      <CanvasToolbar onResetView={handleResetView} />
    </div>
  );
};
