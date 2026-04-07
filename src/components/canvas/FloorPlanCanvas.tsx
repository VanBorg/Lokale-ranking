import { useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import { DEFAULT_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from '../../constants/canvas';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useRoomStore } from '../../store/roomStore';
import { clampStagePan, useRoomCanvas } from '../../hooks/useRoomCanvas';
import { getDraftPositionCenteredOnMap, panToCenterRoomOnViewport } from '../../utils/canvasView';
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

/** Same pan as when opening the room wizard: virtual map centred in the viewport. */
function panFloorPlanMapCentered(
  viewportW: number,
  viewportH: number,
  zoom: number,
  gridW: number,
  gridH: number,
) {
  return clampStagePan(
    {
      x: viewportW / 2 - (gridW / 2) * zoom,
      y: viewportH / 2 - (gridH / 2) * zoom,
    },
    zoom,
    viewportW,
    viewportH,
    gridW,
    gridH,
  );
}

export const FloorPlanCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appliedInitialZoomRef = useRef(false);
  const draftPreviewInitRef = useRef(false);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const zoomValue = useUiStore((s) => s.canvasZoom);
  const defaultZoom =
    size.height > 0 ? size.height / (1600 * ROOM_CANVAS_SCALE) : DEFAULT_CANVAS_ZOOM;
  // Pan clamp bounds must not track live zoom — otherwise content size jumps every wheel step.
  const { cols: gridCols, rows: gridRows, cellPx: gridCellSize } = computeGridExtentCells(
    size.width,
    size.height,
    MIN_CANVAS_ZOOM,
    GRID_BUFFER_CELLS,
    GRID_MIN_CELLS,
  );
  const gridWidth = gridCols * gridCellSize;
  const gridHeight = gridRows * gridCellSize;

  const { zoom, pan, handleWheel, handleDragMove, handleDragEnd } = useRoomCanvas({
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
  /** Pan the canvas everywhere except step 2 (zone layout), where the stage must stay fixed. */
  const stageDraggable = wizardCanvasMode !== 'sub-space-layout';

  const [isStagePanning, setIsStagePanning] = useState(false);

  const rooms = useProjectStore((s) => s.project.rooms);
  const draft = useRoomStore((s) => s.draft);
  const editingRoomId = useRoomStore((s) => s.editingRoomId);
  const updateVertex = useRoomStore((s) => s.updateVertex);
  const updateSubSpace = useRoomStore((s) => s.updateSubSpace);

  /**
   * Fixed Konva world position for the draft room (same coordinate system as `Room.position`).
   * Must NOT be recomputed on pan/zoom — that used to pin the preview to the viewport centre.
   */
  const [draftPreviewPos, setDraftPreviewPos] = useState({ x: 0, y: 0 });

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
    if (!wizardOpen) {
      draftPreviewInitRef.current = false;
      setDraftPreviewPos({ x: 0, y: 0 });
    }
  }, [wizardOpen]);

  useLayoutEffect(() => {
    if (!wizardOpen || draftPreviewInitRef.current) return;
    draftPreviewInitRef.current = true;

    const existing = editingRoomId ? rooms.find((r) => r.id === editingRoomId) : undefined;
    if (existing) {
      setDraftPreviewPos({ ...existing.position });
    } else {
      setDraftPreviewPos(
        getDraftPositionCenteredOnMap(draft.vertices, gridWidth, gridHeight),
      );
      const z = useUiStore.getState().canvasZoom;
      setCanvasPan(panFloorPlanMapCentered(size.width, size.height, z, gridWidth, gridHeight));
    }
  }, [
    wizardOpen,
    editingRoomId,
    rooms,
    draft.vertices,
    gridWidth,
    gridHeight,
    size.width,
    size.height,
    setCanvasPan,
  ]);

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
    setCanvasPan(
      panFloorPlanMapCentered(size.width, size.height, defaultZoom, gridWidth, gridHeight),
    );
    appliedInitialZoomRef.current = true;
  }, [
    defaultZoom,
    size.width,
    size.height,
    gridWidth,
    gridHeight,
    zoomValue,
    setCanvasZoom,
    setCanvasPan,
  ]);

  /** Skip first run so persisted rooms are not mistaken for a live 0→1 / N→N+1 transition. */
  const prevRoomCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevRoomCountRef.current === null) {
      prevRoomCountRef.current = rooms.length;
      return;
    }
    const prev = prevRoomCountRef.current;
    prevRoomCountRef.current = rooms.length;
    if (rooms.length !== 1 || prev !== 0) return;
    const room = rooms[0];
    if (!room) return;
    setCanvasZoom(defaultZoom);
    setCanvasPan(panToCenterRoomOnViewport(room, size.width, size.height, defaultZoom));
  }, [rooms, size.width, size.height, defaultZoom, setCanvasPan, setCanvasZoom]);

  const prevRoomIdsRef = useRef<string[] | null>(null);
  useEffect(() => {
    const nextIds = rooms.map((room) => room.id);
    if (prevRoomIdsRef.current === null) {
      prevRoomIdsRef.current = nextIds;
      return;
    }
    const prevIds = prevRoomIdsRef.current;
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
      setCanvasPan(
        panFloorPlanMapCentered(size.width, size.height, defaultZoom, gridWidth, gridHeight),
      );
    }
  }, [rooms, size.width, size.height, gridWidth, gridHeight, defaultZoom, setCanvasPan, setCanvasZoom]);

  return (
    <div
      ref={containerRef}
      data-debug-floor-canvas
      className="h-full w-full bg-app"
      style={{
        cursor: !stageDraggable
          ? 'default'
          : isStagePanning
            ? 'grabbing'
            : 'grab',
      }}
    >
      <Stage
        width={size.width}
        height={size.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable={stageDraggable}
        onWheel={handleWheel}
        onDragStart={(e) => {
          const t = e.target;
          // Hoeken/zones zijn eigen draggable nodes; alleen plattegrond-pannen toont "grabbing".
          if (t.draggable() && t !== t.getStage()) return;
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
