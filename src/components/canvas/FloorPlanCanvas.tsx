import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import { DEFAULT_CANVAS_ZOOM } from '../../constants/canvas';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useRoomStore } from '../../store/roomStore';
import { useRoomCanvas } from '../../hooks/useRoomCanvas';
import { getDraftPreviewWorldPosition, panToCenterRoomOnViewport } from '../../utils/canvasView';
import { getWizardCanvasMode } from '../../utils/wizardCanvas';
import { CanvasGrid } from './CanvasGrid';
import { CanvasToolbar } from './CanvasToolbar';
import { RoomBlock } from './RoomBlock';
import { RoomPreview } from './RoomPreview';
import { ROOM_CANVAS_SCALE } from '../../utils/geometry';

export const FloorPlanCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const zoomValue = useUiStore((s) => s.canvasZoom);
  const gridCellSize = 200 * ROOM_CANVAS_SCALE; // 2m per box
  const gridRows = 13; // 26m tall
  const visibleWorldW = zoomValue > 0 ? size.width / zoomValue : size.width;
  const gridCols = Math.max(1, Math.ceil(visibleWorldW / gridCellSize));
  const gridWidth = gridCols * gridCellSize;
  const gridHeight = gridRows * gridCellSize;

  const { zoom, pan, handleWheel, handleDragEnd } = useRoomCanvas({
    viewportWidth: size.width,
    viewportHeight: size.height,
    contentWidth: gridWidth,
    contentHeight: gridHeight,
  });
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

  // Keep the floor-plan position fixed. The room preview is centered inside the current
  // viewport without changing pan/zoom, then locked while editing.
  const [draftPreviewPos, setDraftPreviewPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!wizardOpen) return;
    setDraftPreviewPos(
      getDraftPreviewWorldPosition(draft.vertices, size.width, size.height, zoom, pan),
    );
    // Intentionally only on wizardOpen change — vertices/zoom/pan during
    // vertex dragging must NOT shift the preview position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardOpen]);


  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const prevRoomCountRef = useRef(0);
  useEffect(() => {
    const prev = prevRoomCountRef.current;
    prevRoomCountRef.current = rooms.length;
    if (rooms.length !== 1 || prev !== 0) return;
    const room = rooms[0];
    if (!room) return;
    setCanvasZoom(DEFAULT_CANVAS_ZOOM);
    setCanvasPan(panToCenterRoomOnViewport(room, size.width, size.height, DEFAULT_CANVAS_ZOOM));
  }, [rooms, size.width, size.height, setCanvasPan, setCanvasZoom]);

  const handleResetView = useCallback(() => {
    setCanvasZoom(DEFAULT_CANVAS_ZOOM);
    if (rooms.length === 1 && rooms[0]) {
      setCanvasPan(panToCenterRoomOnViewport(rooms[0], size.width, size.height, DEFAULT_CANVAS_ZOOM));
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
            <CanvasGrid width={gridWidth} height={gridHeight} cellSize={gridCellSize} />
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
