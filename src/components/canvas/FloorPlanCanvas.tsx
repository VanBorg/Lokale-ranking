import { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useRoomStore } from '../../store/roomStore';
import { useRoomCanvas } from '../../hooks/useRoomCanvas';
import { CanvasGrid } from './CanvasGrid';
import { CanvasToolbar } from './CanvasToolbar';
import { RoomBlock } from './RoomBlock';
import { RoomPreview } from './RoomPreview';

const CANVAS_W = 3000;
const CANVAS_H = 3000;

export const FloorPlanCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const { zoom, pan, handleWheel, handleDragEnd } = useRoomCanvas();
  const wizardOpen = useUiStore((s) => s.wizardOpen);
  const gridVisible = useUiStore((s) => s.gridVisible);

  const rooms = useProjectStore((s) => s.project.rooms);

  const draft = useRoomStore((s) => s.draft);
  const editingRoomId = useRoomStore((s) => s.editingRoomId);

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

  return (
    <div ref={containerRef} className="h-full w-full">
      <Stage
        width={size.width}
        height={size.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {gridVisible && <CanvasGrid width={CANVAS_W} height={CANVAS_H} />}
          {rooms.map((room) => (
            <RoomBlock
              key={room.id}
              room={room}
              dimmed={editingRoomId === room.id}
            />
          ))}
          {wizardOpen && <RoomPreview draft={draft} />}
        </Layer>
      </Stage>
      <CanvasToolbar />
    </div>
  );
};
