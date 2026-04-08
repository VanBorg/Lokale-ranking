import { useCallback, useMemo } from 'react';
import type Konva from 'konva';
import { Group, Line, Circle, Text } from 'react-konva';
import type { RoomType, RoomVertex, SubSpace, ZonePlacementMode } from '../../types/room';
import type { Wall } from '../../types/wall';
import {
  verticesToKonvaPoints,
  verticesBoundingBox,
  polygonVertexInteriorAnglesDeg,
  isPolygonCCW,
  ROOM_CANVAS_SCALE,
  snapCmForRoomVertex,
} from '../../utils/geometry';
import type { WizardCanvasMode } from '../../utils/wizardCanvas';
import { useRoomStore } from '../../store/roomStore';
import { useUiStore } from '../../store/uiStore';
import { KONVA_COLORS } from '../../design/konva';
import { ZoneLayer } from './ZoneLayer';
import { RoomTypeIconBox } from './RoomTypeIconBox';

const WALL_LABEL_FONT_SIZE = 13;
const ANGLE_LABEL_FONT_SIZE = 12;

interface RoomPreviewProps {
  x: number;
  y: number;
  vertices: RoomVertex[];
  walls: Wall[];
  subSpaces: SubSpace[];
  roomType: RoomType;
  canvasMode: WizardCanvasMode;
  zonePlacementMode: ZonePlacementMode;
  onVertexDrag?: (index: number, pos: { x: number; y: number }) => void;
  onVertexDragEnd?: () => void;
  onZoneChange?: (id: string, updates: Partial<SubSpace>) => void;
}

/** Wizard draft room on the floor-plan canvas: polygon, dimensions, corner angles, zones, handles. */
export const RoomPreview = ({
  x,
  y,
  vertices,
  walls,
  subSpaces,
  roomType,
  canvasMode,
  zonePlacementMode,
  onVertexDrag,
  onVertexDragEnd,
  onZoneChange,
}: RoomPreviewProps) => {
  const hoveredWallIndex = useUiStore((s) => s.hoveredWallIndex);
  const lockedWallIds = useRoomStore((s) => s.draft.lockedWallIds);

  const isOutlineMode = canvasMode === 'room-outline';
  const isZoneMode = canvasMode === 'sub-space-layout';
  const isDimmed = canvasMode === 'walls-preview' || canvasMode === 'overview-preview';

  /** Vertex position in cm from the dragged node's parent-local coordinates. */
  const vertexCmFromDragTarget = useCallback(
    (target: Konva.Node) => ({
      x: snapCmForRoomVertex(target.x() / ROOM_CANVAS_SCALE),
      y: snapCmForRoomVertex(target.y() / ROOM_CANVAS_SCALE),
    }),
    [],
  );

  const points = useMemo(
    () => verticesToKonvaPoints(vertices, ROOM_CANVAS_SCALE),
    [vertices],
  );

  const wallStates = useMemo(
    () =>
      walls.map((wall, i) => {
        const locked = lockedWallIds.includes(wall.id);
        const hovered = hoveredWallIndex === i;
        return {
          locked,
          hovered,
          emphasise: locked || hovered,
        };
      }),
    [walls, lockedWallIds, hoveredWallIndex],
  );

  const interiorAnglesDeg = useMemo(() => polygonVertexInteriorAnglesDeg(vertices), [vertices]);

  const iconCentre = useMemo(() => {
    if (vertices.length < 3) return null;
    const bb = verticesBoundingBox(vertices);
    const s = ROOM_CANVAS_SCALE;
    return { cx: ((bb.minX + bb.maxX) / 2) * s, cy: ((bb.minY + bb.maxY) / 2) * s };
  }, [vertices]);

  /** Inward offset from each vertex along the interior angle bisector (works for convex + reflex corners). */
  const angleLabelCentres = useMemo(() => {
    const n = vertices.length;
    if (n < 3) return [];

    const ccw = isPolygonCCW(vertices);
    const s = ROOM_CANVAS_SCALE;
    const inward = 28;

    return vertices.map((curr, i) => {
      const prev = vertices[(i - 1 + n) % n]!;
      const next = vertices[(i + 1) % n]!;
      const e1x = curr.x - prev.x;
      const e1y = curr.y - prev.y;
      const e2x = next.x - curr.x;
      const e2y = next.y - curr.y;
      const z = e1x * e2y - e1y * e2x;
      const convex = ccw ? z > 0 : z < 0;

      const ax = prev.x - curr.x;
      const ay = prev.y - curr.y;
      const bx = next.x - curr.x;
      const by = next.y - curr.y;
      const la = Math.hypot(ax, ay);
      const lb = Math.hypot(bx, by);
      if (la < 1e-9 || lb < 1e-9) {
        return { x: curr.x * s, y: curr.y * s };
      }
      let nx = ax / la + bx / lb;
      let ny = ay / la + by / lb;
      const len = Math.hypot(nx, ny);
      if (len < 1e-9) {
        return { x: curr.x * s, y: curr.y * s };
      }
      nx /= len;
      ny /= len;
      if (!convex) {
        nx = -nx;
        ny = -ny;
      }
      return {
        x: curr.x * s + nx * inward,
        y: curr.y * s + ny * inward,
      };
    });
  }, [vertices]);

  return (
    <Group x={x} y={y} opacity={isDimmed ? 0.4 : 0.85} listening>
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

      {/* Sidebar hover + slot: zelfde rand als “Wand A”, “Wand B”, …; vergrendeld blijft oranje */}
      {isOutlineMode &&
        walls.map((_, i) => {
          const st = wallStates[i];
          if (!st?.emphasise) return null;
          const v1 = vertices[i]!;
          const v2 = vertices[(i + 1) % vertices.length]!;
          const s = ROOM_CANVAS_SCALE;
          return (
            <Line
              key={`wall-emph-${i}`}
              listening={false}
              points={[v1.x * s, v1.y * s, v2.x * s, v2.y * s]}
              stroke={KONVA_COLORS.wallHoverStroke}
              strokeWidth={7}
              lineCap="round"
              lineJoin="round"
            />
          );
        })}

      {/* Wall length labels — visible in all modes */}
      {walls.map((wall, i) => {
        const v1 = vertices[i]!;
        const v2 = vertices[(i + 1) % vertices.length]!;
        const mx = ((v1.x + v2.x) / 2) * ROOM_CANVAS_SCALE;
        const my = ((v1.y + v2.y) / 2) * ROOM_CANVAS_SCALE;
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = (-dy / len) * 20;
        const ny = (dx / len) * 20;
        const label = `${String.fromCharCode(65 + i)} ${(wall.width / 100).toFixed(2)} m`;
        const approxHalfW = label.length * WALL_LABEL_FONT_SIZE * 0.32;
        const emphasise = wallStates[i]?.emphasise ?? false;
        return (
          <Text
            key={`wl-${i}`}
            listening={false}
            x={mx + nx}
            y={my + ny}
            text={label}
            fontSize={WALL_LABEL_FONT_SIZE}
            fill={emphasise ? '#fff7ed' : KONVA_COLORS.dimensionLabelFill}
            stroke={emphasise ? '#9a3412' : KONVA_COLORS.dimensionLabelStroke}
            strokeWidth={emphasise ? 5 : 4}
            lineJoin="round"
            fontStyle="bold"
            align="center"
            offsetX={approxHalfW}
            offsetY={WALL_LABEL_FONT_SIZE / 2}
          />
        );
      })}

      {/* Interior angle at each corner (degrees) */}
      {vertices.map((_, i) => {
        const deg = interiorAnglesDeg[i] ?? 0;
        const pos = angleLabelCentres[i];
        if (!pos) return null;
        const text =
          Math.abs(deg - Math.round(deg)) < 0.05 ? `${Math.round(deg)}°` : `${deg.toFixed(1)}°`;
        const approxHalfW = text.length * ANGLE_LABEL_FONT_SIZE * 0.3;
        return (
          <Text
            key={`ang-${i}`}
            listening={false}
            x={pos.x}
            y={pos.y}
            text={text}
            fontSize={ANGLE_LABEL_FONT_SIZE}
            fill={KONVA_COLORS.angleLabelFill}
            stroke={KONVA_COLORS.angleLabelStroke}
            strokeWidth={3}
            lineJoin="round"
            fontStyle="bold"
            align="center"
            offsetX={approxHalfW}
            offsetY={ANGLE_LABEL_FONT_SIZE / 2}
          />
        );
      })}

      {/* Vertex drag handles — only in room-outline mode; key=index: RoomVertex has no id, drag uses index */}
      {isOutlineMode &&
        vertices.map((v, i) => (
          <Group
            key={i}
            x={v.x * ROOM_CANVAS_SCALE}
            y={v.y * ROOM_CANVAS_SCALE}
            draggable
            dragDistance={3}
            onDragMove={(e) => onVertexDrag?.(i, vertexCmFromDragTarget(e.target))}
            onDragEnd={(e) => {
              onVertexDrag?.(i, vertexCmFromDragTarget(e.target));
              onVertexDragEnd?.();
            }}
          >
            {/* Large invisible hit area */}
            <Circle radius={22} fill="rgba(0,0,0,0.001)" strokeWidth={0} listening />
            <Circle
              radius={10}
              fill={KONVA_COLORS.vertexHandle}
              stroke={KONVA_COLORS.vertexHandleStroke}
              strokeWidth={2}
              listening={false}
            />
          </Group>
        ))}

      {/* Zone rectangles — always visible, interactive only in sub-space-layout mode */}
      <ZoneLayer
        subSpaces={subSpaces}
        vertices={vertices}
        zonePlacementMode={zonePlacementMode}
        interactive={isZoneMode}
        onZoneChange={onZoneChange}
      />

      {iconCentre && <RoomTypeIconBox cx={iconCentre.cx} cy={iconCentre.cy} roomType={roomType} />}
    </Group>
  );
};
