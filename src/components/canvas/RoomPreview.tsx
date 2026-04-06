import { useRef, useState } from 'react';
import type Konva from 'konva';
import { Group, Line, Rect, Circle, Text } from 'react-konva';
import type { RoomVertex, SubSpace } from '../../types/room';
import type { Wall } from '../../types/wall';
import { verticesToKonvaPoints, verticesBoundingBox, ROOM_CANVAS_SCALE } from '../../utils/geometry';
import { isZonePlacementValid } from '../../utils/subSpaceContainment';
import type { WizardCanvasMode } from '../../utils/wizardCanvas';
import { WIZARD_CANVAS_OVERLAY } from '../../utils/wizardCanvas';

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

  const points = verticesToKonvaPoints(vertices, ROOM_CANVAS_SCALE);
  const bb = verticesBoundingBox(vertices);
  const overlayLabel = WIZARD_CANVAS_OVERLAY[canvasMode];

  const snap10 = (v: number) => Math.round(v / 10) * 10;

  return (
    <Group ref={groupRef} x={x} y={y} opacity={isDimmed ? 0.4 : 0.85} listening>
      {/* Room outline */}
      <Line
        listening={false}
        points={points}
        closed
        fill="#fef3c7"
        stroke="#f59e0b"
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
            fill="#9a3412"
            fontStyle="bold"
            align="center"
            offsetX={label.length * 2.5}
          />
        );
      })}

      {/* Vertex drag handles — only in room-outline mode */}
      {isOutlineMode && vertices.map((v, i) => (
        <Circle
          key={i}
          x={v.x * ROOM_CANVAS_SCALE}
          y={v.y * ROOM_CANVAS_SCALE}
          radius={7}
          fill="#f97316"
          stroke="white"
          strokeWidth={2}
          draggable
          onDragEnd={(e) => {
            const stage = groupRef.current?.getStage();
            const scaleX = stage?.scaleX() ?? 1;
            const scaleY = stage?.scaleY() ?? 1;
            const groupAbs = groupRef.current?.getAbsolutePosition() ?? { x: 0, y: 0 };
            const absPos = e.target.getAbsolutePosition();
            const localX = (absPos.x - groupAbs.x) / scaleX;
            const localY = (absPos.y - groupAbs.y) / scaleY;
            const cmX = snap10(localX / ROOM_CANVAS_SCALE);
            const cmY = snap10(localY / ROOM_CANVAS_SCALE);
            onVertexDrag?.(i, { x: cmX, y: cmY });
            onVertexDragEnd?.();
          }}
        />
      ))}

      {/* Zone rectangles — only in sub-space-layout mode */}
      {subSpaces.map((s) => {
        const isInvalid = invalidZones.has(s.id);
        return (
          <Rect
            key={s.id}
            x={s.position.x * ROOM_CANVAS_SCALE}
            y={s.position.y * ROOM_CANVAS_SCALE}
            width={s.width * ROOM_CANVAS_SCALE}
            height={s.length * ROOM_CANVAS_SCALE}
            fill="#fde68a"
            stroke={isInvalid ? '#ef4444' : '#d97706'}
            strokeWidth={isInvalid ? 2 : 1}
            opacity={isZoneMode ? 0.85 : 0.5}
            listening={isZoneMode}
            draggable={isZoneMode}
            onDragStart={() => {
              prevPositions.current.set(s.id, { ...s.position });
            }}
            onDragEnd={(e) => {
              if (!isZoneMode || !onZoneDrag) return;
              const stage = groupRef.current?.getStage();
              const scaleX = stage?.scaleX() ?? 1;
              const scaleY = stage?.scaleY() ?? 1;
              const groupAbs = groupRef.current?.getAbsolutePosition() ?? { x: 0, y: 0 };
              const absPos = e.target.getAbsolutePosition();
              const localX = (absPos.x - groupAbs.x) / scaleX;
              const localY = (absPos.y - groupAbs.y) / scaleY;
              const cmX = localX / ROOM_CANVAS_SCALE;
              const cmY = localY / ROOM_CANVAS_SCALE;

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
          />
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
        fill="#92400e"
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
          fill="#9a3412"
        />
      )}
    </Group>
  );
};
