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

const PADDING = 40;
const HANDLE_RADIUS = 10;
const LABEL_FONT_SIZE = 13;

export const SubRoomMiniCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const selectedId = useUiStore((s) => s.selectedSubRoomId);
  const hoveredWallIdx = useUiStore((s) => s.hoveredSubRoomWallIndex);
  const subRoom = useRoomStore((s) => s.draft.subRooms.find((r) => r.id === selectedId));
  const updateVertex = useRoomStore((s) => s.updateSubRoomVertex);

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

  const vertexCmFromDrag = useCallback(
    (target: Konva.Node, scale: number) => ({
      x: snapCmForRoomVertex(target.x() / scale),
      y: snapCmForRoomVertex(target.y() / scale),
    }),
    [],
  );

  const { scale, offsetX, offsetY } = useMemo(() => {
    if (!subRoom || size.width === 0 || size.height === 0)
      return { scale: 1, offsetX: 0, offsetY: 0 };
    const bb = verticesBoundingBox(subRoom.vertices);
    const w = bb.width || 1;
    const h = bb.height || 1;
    const s = Math.min((size.width - PADDING * 2) / w, (size.height - PADDING * 2) / h, 1.5);
    return {
      scale: s,
      offsetX: (size.width - w * s) / 2,
      offsetY: (size.height - h * s) / 2,
    };
  }, [subRoom, size.width, size.height]);

  if (!subRoom || !selectedId) {
    return (
      <div ref={containerRef} className="flex min-h-[200px] flex-1 items-center justify-center text-sm text-muted">
        Selecteer of voeg een ruimte toe
      </div>
    );
  }

  const { vertices, walls, lockedWallIds } = subRoom;
  const points = verticesToKonvaPoints(vertices, scale);

  return (
    <div ref={containerRef} className="min-h-[200px] flex-1">
      {size.width > 0 && size.height > 0 && (
        <Stage width={size.width} height={size.height}>
          <Layer>
            <Group x={offsetX} y={offsetY}>
              <Line
                points={points}
                closed
                fill={KONVA_COLORS.previewFill}
                stroke={KONVA_COLORS.previewStroke}
                strokeWidth={2}
                dash={[6, 3]}
                listening={false}
              />

              {/* Hover / lock highlight */}
              {walls.map((wall, i) => {
                const locked = lockedWallIds.includes(wall.id);
                const hovered = hoveredWallIdx === i;
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

              {/* Vertex handles */}
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
                    onDragMove={(e) => {
                      updateVertex(selectedId, i, vertexCmFromDrag(e.target, scale));
                    }}
                    onDragEnd={(e) => {
                      updateVertex(selectedId, i, vertexCmFromDrag(e.target, scale));
                    }}
                  />
                );
              })}

              {/* Wall length labels */}
              {walls.map((_, i) => {
                const v1 = vertices[i]!;
                const v2 = vertices[(i + 1) % vertices.length]!;
                const mx = ((v1.x + v2.x) / 2) * scale;
                const my = ((v1.y + v2.y) / 2) * scale;
                const dx = v2.x - v1.x;
                const dy = v2.y - v1.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const pad = 14;
                const nx = (-dy / len) * pad;
                const ny = (dx / len) * pad;
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
            </Group>
          </Layer>
        </Stage>
      )}
    </div>
  );
};
