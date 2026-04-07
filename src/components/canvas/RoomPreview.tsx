import { useCallback, useRef, useState } from 'react';
import type Konva from 'konva';
import { Group, Line, Rect, Circle, Text } from 'react-konva';
import type { RoomVertex, SubSpace } from '../../types/room';
import type { Wall } from '../../types/wall';
import {
  verticesToKonvaPoints,
  verticesBoundingBox,
  ROOM_CANVAS_SCALE,
  snapCmForRoomVertex,
} from '../../utils/geometry';
import { isZonePlacementValid } from '../../utils/subSpaceContainment';
import type { WizardCanvasMode } from '../../utils/wizardCanvas';
import { WIZARD_CANVAS_OVERLAY } from '../../utils/wizardCanvas';
import { KONVA_COLORS } from '../../design/konva';

interface RoomPreviewProps {
  x: number;
  y: number;
  vertices: RoomVertex[];
  walls: Wall[];
  subSpaces: SubSpace[];
  name: string;
  canvasMode: WizardCanvasMode;
  onVertexDrag?: (index: number, pos: { x: number; y: number }) => void;
  onVertexDragEnd?: () => void;
  onZoneDrag?: (id: string, pos: { x: number; y: number }) => void;
}

export const RoomPreview = ({
  x, y, vertices, walls, subSpaces, name, canvasMode, onVertexDrag, onVertexDragEnd, onZoneDrag,
}: RoomPreviewProps) => {
  const groupRef = useRef<Konva.Group | null>(null);
  const [invalidZones, setInvalidZones] = useState<Set<string>>(new Set());
  const prevPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  const isOutlineMode = canvasMode === 'room-outline';
  const isZoneMode = canvasMode === 'sub-space-layout';
  const isDimmed = canvasMode === 'walls-preview' || canvasMode === 'overview-preview';

  /**
   * Vertex handle position in cm, from the dragged node’s coordinates in the room Group.
   * Use parent-local x/y — not getAbsolutePosition()/stage.scale — so zoom/pan cannot skew the result.
   */
  const vertexCmFromDragTarget = useCallback((target: Konva.Node) => {
    const localX = target.x();
    const localY = target.y();
    return {
      x: snapCmForRoomVertex(localX / ROOM_CANVAS_SCALE),
      y: snapCmForRoomVertex(localY / ROOM_CANVAS_SCALE),
    };
  }, []);

  const points = verticesToKonvaPoints(vertices, ROOM_CANVAS_SCALE);
  const bb = verticesBoundingBox(vertices);
  const overlayLabel = WIZARD_CANVAS_OVERLAY[canvasMode];

  return (
    <Group ref={groupRef} x={x} y={y} opacity={isDimmed ? 0.4 : 0.85} listening>
      {/* Room outline */}
      <Line
        listening={false}
        points={points}
        closed
        fill={KONVA_COLORS.previewFill}
        stroke={KONVA_COLORS.previewStroke}
        strokeWidth={isOutlineMode ? 2.5 : 3}
        dash={isOutlineMode ? [8, 4] : undefined}
      />

      {/* Wall labels + afmetingen — visible in all canvas modes */}
      {walls.map((wall, i) => {
        const v1 = vertices[i]!;
        const v2 = vertices[(i + 1) % vertices.length]!;
        const mx = ((v1.x + v2.x) / 2) * ROOM_CANVAS_SCALE;
        const my = ((v1.y + v2.y) / 2) * ROOM_CANVAS_SCALE;
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = (-dy / len) * 14;
        const ny = (dx / len) * 14;
        const label = `${String.fromCharCode(65 + i)} ${(wall.width / 100).toFixed(2)}m`;
        return (
          <Text
            key={`wl-${i}`}
            listening={false}
            x={mx + nx}
            y={my + ny}
            text={label}
            fontSize={10}
            fill={KONVA_COLORS.wallText}
            fontStyle="bold"
            align="center"
            offsetX={label.length * 2.5}
          />
        );
      })}

      {/* Vertex drag handles — only in room-outline mode (large invisible hit area + live wall sync) */}
      {isOutlineMode &&
        vertices.map((v, i) => (
          <Group
            key={i}
            x={v.x * ROOM_CANVAS_SCALE}
            y={v.y * ROOM_CANVAS_SCALE}
            draggable
            dragDistance={3}
            onDragMove={(e) => {
              const cm = vertexCmFromDragTarget(e.target);
              onVertexDrag?.(i, cm);
            }}
            onDragEnd={(e) => {
              const cm = vertexCmFromDragTarget(e.target);
              onVertexDrag?.(i, cm);
              onVertexDragEnd?.();
            }}
          >
            <Circle
              radius={22}
              fill="rgba(0,0,0,0.001)"
              strokeWidth={0}
              listening
            />
            <Circle
              radius={10}
              fill={KONVA_COLORS.vertexHandle}
              stroke={KONVA_COLORS.vertexHandleStroke}
              strokeWidth={2}
              listening={false}
            />
          </Group>
        ))}

      {/* Zone rectangles — only in sub-space-layout mode */}
      {subSpaces.map((s) => {
        const isInvalid = invalidZones.has(s.id);
        const zx = s.position.x * ROOM_CANVAS_SCALE;
        const zy = s.position.y * ROOM_CANVAS_SCALE;
        const zw = s.width * ROOM_CANVAS_SCALE;
        const zh = s.length * ROOM_CANVAS_SCALE;
        const dimLabel = `${(s.width / 100).toFixed(2)} × ${(s.length / 100).toFixed(2)} m`;
        const nameLine = s.name?.trim() ? s.name.trim() : '';
        const minSide = Math.min(zw, zh);
        const labelFont = minSide < 56 ? 8 : 10;
        const lineCount = nameLine ? 2 : 1;
        const textBlockH = lineCount * labelFont * 1.15;
        const labelY = Math.max(2, zh / 2 - textBlockH / 2);
        return (
          <Group
            key={s.id}
            x={zx}
            y={zy}
            draggable={isZoneMode}
            listening={isZoneMode}
            onDragStart={() => {
              prevPositions.current.set(s.id, { ...s.position });
            }}
            onDragEnd={(e) => {
              if (!isZoneMode || !onZoneDrag) return;
              const cmX = snapCmForRoomVertex(e.target.x() / ROOM_CANVAS_SCALE);
              const cmY = snapCmForRoomVertex(e.target.y() / ROOM_CANVAS_SCALE);

              const valid = isZonePlacementValid(cmX, cmY, s.width, s.length, vertices, subSpaces, s.id);
              if (valid) {
                setInvalidZones((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
                onZoneDrag(s.id, { x: cmX, y: cmY });
              } else {
                const prev = prevPositions.current.get(s.id) ?? s.position;
                e.target.position({
                  x: prev.x * ROOM_CANVAS_SCALE,
                  y: prev.y * ROOM_CANVAS_SCALE,
                });
                setInvalidZones((p) => new Set(p).add(s.id));
                setTimeout(() => setInvalidZones((p) => { const n = new Set(p); n.delete(s.id); return n; }), 800);
              }
            }}
          >
            <Rect
              width={zw}
              height={zh}
              fill={KONVA_COLORS.zoneFill}
              stroke={isInvalid ? KONVA_COLORS.zoneStrokeInvalid : KONVA_COLORS.zoneStroke}
              strokeWidth={isInvalid ? 2 : 1}
              opacity={isZoneMode ? 0.85 : 0.5}
              listening={false}
            />
            {/* Meters op de plattegrond — zelfde cm→m-schaal als wandlabels (stap 1). */}
            <Text
              listening={false}
              x={0}
              y={labelY}
              width={zw}
              text={nameLine ? `${nameLine}\n${dimLabel}` : dimLabel}
              fontSize={labelFont}
              fontStyle="bold"
              fill={KONVA_COLORS.zoneLabel}
              align="center"
              lineHeight={1.15}
            />
          </Group>
        );
      })}

      {/* Name label */}
      <Text
        listening={false}
        text={name || 'Nieuwe kamer'}
        x={8}
        y={8}
        fontSize={15}
        fontStyle="italic"
        fill={KONVA_COLORS.previewLabel}
      />

      {/* Overlay step label */}
      {overlayLabel && (
        <Text
          listening={false}
          text={overlayLabel}
          x={8}
          y={Math.max(40, bb.height * ROOM_CANVAS_SCALE - 36)}
          width={Math.max(120, bb.width * ROOM_CANVAS_SCALE - 16)}
          fontSize={11}
          fill={KONVA_COLORS.previewOverlay}
        />
      )}
    </Group>
  );
};
