import { useCallback, useRef } from 'react';
import type Konva from 'konva';
import { Group, Line, Rect, Circle, Text } from 'react-konva';
import type { RoomVertex, SubSpace, ZonePlacementMode } from '../../types/room';
import type { Wall } from '../../types/wall';
import {
  verticesToKonvaPoints,
  verticesBoundingBox,
  ROOM_CANVAS_SCALE,
  snapCmForRoomVertex,
} from '../../utils/geometry';
import { getZoneWallSnapPosition, isZonePlacementValid } from '../../utils/subSpaceContainment';
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
  zonePlacementMode: ZonePlacementMode;
  onVertexDrag?: (index: number, pos: { x: number; y: number }) => void;
  onVertexDragEnd?: () => void;
  onZoneChange?: (id: string, updates: Partial<SubSpace>) => void;
}

export const RoomPreview = ({
  x,
  y,
  vertices,
  walls,
  subSpaces,
  name,
  canvasMode,
  zonePlacementMode,
  onVertexDrag,
  onVertexDragEnd,
  onZoneChange,
}: RoomPreviewProps) => {
  const groupRef = useRef<Konva.Group | null>(null);
  const invalidFlashRef = useRef<Set<string>>(new Set());
  const prevPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const prevSizes = useRef<Map<string, { x: number; y: number; w: number; h: number }>>(new Map());

  const isOutlineMode = canvasMode === 'room-outline';
  const isZoneMode = canvasMode === 'sub-space-layout';
  const isDimmed = canvasMode === 'walls-preview' || canvasMode === 'overview-preview';
  const minZoneSize = 10;

  /**
   * Vertex handle position in cm, from the dragged node's coordinates in the room Group.
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

  const snapZonePosition = useCallback(
    (zoneX: number, zoneY: number, zoneW: number, zoneH: number) =>
      getZoneWallSnapPosition(zoneX, zoneY, zoneW, zoneH, vertices, zonePlacementMode),
    [vertices, zonePlacementMode],
  );

  /**
   * Compute new position/size for a resize drag.
   * handleLocalX/Y = handle center position in cm within the zone group's local coordinate space.
   */
  const getResizeUpdate = useCallback(
    (
      space: SubSpace,
      handleLocalX: number,
      handleLocalY: number,
      corner: 'tl' | 'tr' | 'bl' | 'br',
    ) => {
      const originX = space.position.x;
      const originY = space.position.y;
      const anchorX = originX + space.width;
      const anchorY = originY + space.length;
      let nextX = originX;
      let nextY = originY;
      let nextW = space.width;
      let nextH = space.length;

      if (corner === 'tl') {
        nextX = originX + handleLocalX;
        nextY = originY + handleLocalY;
        nextW = anchorX - nextX;
        nextH = anchorY - nextY;
      } else if (corner === 'tr') {
        nextY = originY + handleLocalY;
        nextW = handleLocalX;
        nextH = anchorY - nextY;
      } else if (corner === 'bl') {
        nextX = originX + handleLocalX;
        nextW = anchorX - nextX;
        nextH = handleLocalY;
      } else {
        nextW = handleLocalX;
        nextH = handleLocalY;
      }

      if (nextW < minZoneSize) {
        nextW = minZoneSize;
        if (corner === 'tl' || corner === 'bl') nextX = anchorX - nextW;
      }
      if (nextH < minZoneSize) {
        nextH = minZoneSize;
        if (corner === 'tl' || corner === 'tr') nextY = anchorY - nextH;
      }

      const snapped = snapZonePosition(nextX, nextY, nextW, nextH);
      return { position: snapped, width: nextW, length: nextH };
    },
    [minZoneSize, snapZonePosition],
  );

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

      {/* Wall labels + dimensions — visible in all canvas modes */}
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

      {/* Vertex drag handles — only in room-outline mode */}
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

      {/* Zone rectangles — visible in all modes, interactive only in sub-space-layout */}
      {subSpaces.map((s) => {
        const zx = s.position.x * ROOM_CANVAS_SCALE;
        const zy = s.position.y * ROOM_CANVAS_SCALE;
        const zw = s.width * ROOM_CANVAS_SCALE;
        const zh = s.length * ROOM_CANVAS_SCALE;
        const dimLabel = `${(s.width / 100).toFixed(2)} × ${(s.length / 100).toFixed(2)} m`;
        const nameLine = s.name?.trim() ?? '';
        const minSide = Math.min(zw, zh);
        const labelFont = minSide < 56 ? 8 : 10;
        const lineCount = nameLine ? 2 : 1;
        const textBlockH = lineCount * labelFont * 1.15;
        const labelY = Math.max(2, zh / 2 - textBlockH / 2);
        const handleSize = Math.min(12, Math.max(8, minSide / 6));
        const handleHalf = handleSize / 2;

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
            onDragMove={(e) => {
              const cmX = snapCmForRoomVertex(e.target.x() / ROOM_CANVAS_SCALE);
              const cmY = snapCmForRoomVertex(e.target.y() / ROOM_CANVAS_SCALE);
              const snapped = snapZonePosition(cmX, cmY, s.width, s.length);
              // Imperatively reposition so the snap is visible during drag
              // without triggering a React re-render mid-drag.
              e.target.position({
                x: snapped.x * ROOM_CANVAS_SCALE,
                y: snapped.y * ROOM_CANVAS_SCALE,
              });
            }}
            onDragEnd={(e) => {
              if (!onZoneChange) return;
              const cmX = snapCmForRoomVertex(e.target.x() / ROOM_CANVAS_SCALE);
              const cmY = snapCmForRoomVertex(e.target.y() / ROOM_CANVAS_SCALE);
              const snapped = snapZonePosition(cmX, cmY, s.width, s.length);
              const valid = isZonePlacementValid(
                snapped.x, snapped.y, s.width, s.length,
                vertices, subSpaces, s.id, zonePlacementMode,
              );
              if (valid) {
                onZoneChange(s.id, { position: snapped });
              } else {
                // Snap back to last valid position
                const prev = prevPositions.current.get(s.id) ?? s.position;
                e.target.position({
                  x: prev.x * ROOM_CANVAS_SCALE,
                  y: prev.y * ROOM_CANVAS_SCALE,
                });
                onZoneChange(s.id, { position: prev });
              }
            }}
          >
            {/*
             * Body rect — listening=true so the zone group has a hit area for drag.
             * Without this the group has no surface to receive mousedown and cannot be dragged.
             */}
            <Rect
              width={zw}
              height={zh}
              fill={KONVA_COLORS.zoneFill}
              stroke={KONVA_COLORS.zoneStroke}
              strokeWidth={1}
              opacity={0.85}
              listening
            />

            {/* Corner resize handles — only shown and active in zone mode */}
            {isZoneMode && (
              <>
                {(
                  [
                    ['tl', 0, 0],
                    ['tr', zw, 0],
                    ['bl', 0, zh],
                    ['br', zw, zh],
                  ] as const
                ).map(([corner, cx, cy]) => (
                  <Rect
                    key={`${s.id}-${corner}`}
                    x={cx - handleHalf}
                    y={cy - handleHalf}
                    width={handleSize}
                    height={handleSize}
                    fill="#ffffff"
                    stroke={KONVA_COLORS.zoneStroke}
                    strokeWidth={1}
                    cornerRadius={2}
                    draggable
                    dragDistance={2}
                    onDragStart={() => {
                      prevSizes.current.set(s.id, {
                        x: s.position.x,
                        y: s.position.y,
                        w: s.width,
                        h: s.length,
                      });
                    }}
                    /*
                     * onDragMove intentionally omitted.
                     * Calling onZoneChange here triggers a React re-render mid-drag which
                     * repositions the zone Group (parent) while Konva is still tracking the
                     * child handle drag — causing the handle to jump on every mouse move.
                     * Instead we commit the new size in onDragEnd only (one re-render at the end).
                     */
                    onDragEnd={(e) => {
                      if (!onZoneChange) return;
                      const localX = snapCmForRoomVertex(
                        (e.target.x() + handleHalf) / ROOM_CANVAS_SCALE,
                      );
                      const localY = snapCmForRoomVertex(
                        (e.target.y() + handleHalf) / ROOM_CANVAS_SCALE,
                      );
                      const next = getResizeUpdate(s, localX, localY, corner);
                      const valid = isZonePlacementValid(
                        next.position.x, next.position.y, next.width, next.length,
                        vertices, subSpaces, s.id, zonePlacementMode,
                      );
                      if (valid) {
                        onZoneChange(s.id, next);
                      } else {
                        // Roll back to size before drag started
                        const prev = prevSizes.current.get(s.id) ?? {
                          x: s.position.x, y: s.position.y, w: s.width, h: s.length,
                        };
                        onZoneChange(s.id, {
                          position: { x: prev.x, y: prev.y },
                          width: prev.w,
                          length: prev.h,
                        });
                      }
                      void invalidFlashRef; // suppress unused-ref lint warning
                    }}
                  />
                ))}
              </>
            )}

            {/* Zone label — dimensions in metres, same scale as wall labels */}
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

      {/* Room name label */}
      <Text
        listening={false}
        text={name || 'Nieuwe kamer'}
        x={8}
        y={8}
        fontSize={15}
        fontStyle="italic"
        fill={KONVA_COLORS.previewLabel}
      />

      {/* Step overlay label */}
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
