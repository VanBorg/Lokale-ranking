import { useRef, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import type Konva from 'konva';
import { Stage, Layer, Group, Line, Circle, Text } from 'react-konva';
import { useRoomStore } from '../../../../store/roomStore';
import { useUiStore } from '../../../../store/uiStore';
import {
  verticesToKonvaPoints,
  verticesBoundingBox,
  edgeLength,
  snapCmForRoomVertex,
  isVertexFrozen,
} from '../../../../utils/geometry';
import { KONVA_COLORS, KONVA_FONT_FAMILY } from '../../../../design/konva';

const PADDING = 56;
const HANDLE_RADIUS = 9;
const LABEL_FONT_SIZE = 12;

export const RoomMiniCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const vertices = useRoomStore((s) => s.draft.vertices);
  const walls = useRoomStore((s) => s.draft.walls);
  const lockedWallIds = useRoomStore((s) => s.draft.lockedWallIds);
  const updateVertex = useRoomStore((s) => s.updateVertex);
  const hoveredWallIndex = useUiStore((s) => s.hoveredWallIndex);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bb = useMemo(() => verticesBoundingBox(vertices), [vertices]);

  const { scale, groupX, groupY } = useMemo(() => {
    if (size.width === 0 || size.height === 0)
      return { scale: 1, groupX: 0, groupY: 0 };
    const w = bb.width || 1;
    const h = bb.height || 1;
    const s = Math.min(
      (size.width - PADDING * 2) / w,
      (size.height - PADDING * 2) / h,
    );
    return {
      scale: s,
      groupX: (size.width - w * s) / 2 - bb.minX * s,
      groupY: (size.height - h * s) / 2 - bb.minY * s,
    };
  }, [bb, size.width, size.height]);

  const points = useMemo(
    () => verticesToKonvaPoints(vertices, scale),
    [vertices, scale],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, index: number) => {
      e.cancelBubble = true;
      const cm = {
        x: snapCmForRoomVertex(e.target.x() / scale),
        y: snapCmForRoomVertex(e.target.y() / scale),
      };
      updateVertex(index, cm);
      e.target.position({ x: cm.x * scale, y: cm.y * scale });
    },
    [scale, updateVertex],
  );

  return (
    <div ref={containerRef} className="h-full w-full bg-app">
      {size.width > 0 && size.height > 0 && (
        <Stage width={size.width} height={size.height}>
          <Layer>
            <Group x={groupX} y={groupY}>
              <Line
                points={points}
                closed
                fill={KONVA_COLORS.previewFill}
                stroke={KONVA_COLORS.previewStroke}
                strokeWidth={2}
                dash={[8, 4]}
                listening={false}
              />

              {walls.map((wall, i) => {
                const locked = lockedWallIds.includes(wall.id);
                const hovered = hoveredWallIndex === i;
                if (!locked && !hovered) return null;
                const v1 = vertices[i]!;
                const v2 = vertices[(i + 1) % vertices.length]!;
                return (
                  <Line
                    key={`emph-${i}`}
                    listening={false}
                    points={[v1.x * scale, v1.y * scale, v2.x * scale, v2.y * scale]}
                    stroke={KONVA_COLORS.wallHoverStroke}
                    strokeWidth={5}
                    lineCap="round"
                  />
                );
              })}

              {walls.map((_, i) => {
                const v1 = vertices[i]!;
                const v2 = vertices[(i + 1) % vertices.length]!;
                const mx = ((v1.x + v2.x) / 2) * scale;
                const my = ((v1.y + v2.y) / 2) * scale;
                const dx = v2.x - v1.x;
                const dy = v2.y - v1.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = (-dy / len) * 18;
                const ny = (dx / len) * 18;
                const edgeCm = edgeLength(v1, v2);
                const label = `${(edgeCm / 100).toFixed(2)} m`;
                const halfW = label.length * LABEL_FONT_SIZE * 0.32;
                return (
                  <Text
                    key={`lbl-${i}`}
                    listening={false}
                    x={mx + nx}
                    y={my + ny}
                    text={label}
                    fontFamily={KONVA_FONT_FAMILY}
                    fontSize={LABEL_FONT_SIZE}
                    fill={KONVA_COLORS.dimensionLabelFill}
                    stroke={KONVA_COLORS.dimensionLabelStroke}
                    strokeWidth={3}
                    fillAfterStrokeEnabled
                    lineJoin="round"
                    fontStyle="bold"
                    align="center"
                    offsetX={halfW}
                    offsetY={LABEL_FONT_SIZE / 2}
                  />
                );
              })}

              {vertices.map((v, i) => {
                const frozen = isVertexFrozen(i, walls, lockedWallIds);
                return (
                  <Circle
                    key={i}
                    x={v.x * scale}
                    y={v.y * scale}
                    radius={HANDLE_RADIUS}
                    fill={frozen ? KONVA_COLORS.vertexHandleLocked : KONVA_COLORS.vertexHandle}
                    stroke={KONVA_COLORS.vertexHandleStroke}
                    strokeWidth={2}
                    draggable={!frozen}
                    onDragEnd={(e) => handleDragEnd(e, i)}
                  />
                );
              })}
            </Group>
          </Layer>
        </Stage>
      )}
    </div>
  );
};
