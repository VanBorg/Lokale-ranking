import { useRef, useCallback } from 'react';
import type Konva from 'konva';
import { Group, Rect, Text } from 'react-konva';
import type { RoomVertex, SubSpace, ZonePlacementMode } from '../../types/room';
import { ROOM_CANVAS_SCALE, snapCmForRoomVertex } from '../../utils/geometry';
import {
  getZoneWallSnapPosition,
  getZoneEdgeSnapPosition,
  isZonePlacementValid,
  getResizeUpdate,
} from '../../utils/subSpaceContainment';
import { KONVA_COLORS, KONVA_FONT_FAMILY } from '../../design/konva';

interface ZoneLayerProps {
  subSpaces: SubSpace[];
  vertices: RoomVertex[];
  zonePlacementMode: ZonePlacementMode;
  interactive: boolean;
  onZoneChange?: (id: string, updates: Partial<SubSpace>) => void;
}

export const ZoneLayer = ({
  subSpaces,
  vertices,
  zonePlacementMode,
  interactive,
  onZoneChange,
}: ZoneLayerProps) => {
  const prevPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const prevSizes = useRef<Map<string, { x: number; y: number; w: number; h: number }>>(new Map());

  const snapZonePosition = useCallback(
    (id: string, zoneX: number, zoneY: number, zoneW: number, zoneH: number) => {
      const wallSnapped = getZoneWallSnapPosition(zoneX, zoneY, zoneW, zoneH, vertices, zonePlacementMode);
      if (zonePlacementMode === 'vrij') return wallSnapped;
      return getZoneEdgeSnapPosition(wallSnapped.x, wallSnapped.y, zoneW, zoneH, subSpaces, id);
    },
    [vertices, zonePlacementMode, subSpaces],
  );

  return (
    <>
      {subSpaces.map((s) => {
        const zx = s.position.x * ROOM_CANVAS_SCALE;
        const zy = s.position.y * ROOM_CANVAS_SCALE;
        const zw = s.width * ROOM_CANVAS_SCALE;
        const zh = s.length * ROOM_CANVAS_SCALE;
        const fmt = (cm: number) => (cm / 100).toFixed(2).replace('.', ',');
        const dimLabel = `${fmt(s.width)} × ${fmt(s.length)}`;
        const nameLine = s.name?.trim() ?? '';
        const minSide = Math.min(zw, zh);
        const labelFont = minSide < 56 ? 11 : 13;
        const lineCount = nameLine ? 2 : 1;
        const textBlockH = lineCount * labelFont * 1.3;
        const labelY = Math.max(2, zh / 2 - textBlockH / 2);
        const handleSize = Math.min(12, Math.max(8, minSide / 6));

        return (
          <Group
            key={s.id}
            x={zx}
            y={zy}
            draggable={interactive}
            listening={interactive}
            onDragStart={() => {
              prevPositions.current.set(s.id, { ...s.position });
            }}
            onDragMove={(e) => {
              const cmX = snapCmForRoomVertex(e.target.x() / ROOM_CANVAS_SCALE);
              const cmY = snapCmForRoomVertex(e.target.y() / ROOM_CANVAS_SCALE);
              const snapped = snapZonePosition(s.id, cmX, cmY, s.width, s.length);
              e.target.position({
                x: snapped.x * ROOM_CANVAS_SCALE,
                y: snapped.y * ROOM_CANVAS_SCALE,
              });
            }}
            onDragEnd={(e) => {
              if (!onZoneChange) return;
              const cmX = snapCmForRoomVertex(e.target.x() / ROOM_CANVAS_SCALE);
              const cmY = snapCmForRoomVertex(e.target.y() / ROOM_CANVAS_SCALE);
              const snapped = snapZonePosition(s.id, cmX, cmY, s.width, s.length);
              const valid = isZonePlacementValid(
                snapped.x, snapped.y, s.width, s.length,
                vertices, subSpaces, s.id, zonePlacementMode,
              );
              if (valid) {
                onZoneChange(s.id, { position: snapped });
              } else {
                const prev = prevPositions.current.get(s.id) ?? s.position;
                e.target.position({
                  x: prev.x * ROOM_CANVAS_SCALE,
                  y: prev.y * ROOM_CANVAS_SCALE,
                });
                onZoneChange(s.id, { position: prev });
              }
            }}
          >
            <Rect
              width={zw}
              height={zh}
              fill={KONVA_COLORS.zoneFill}
              stroke={KONVA_COLORS.zoneStroke}
              strokeWidth={1}
              opacity={0.85}
              listening
            />

            {/* Corner resize handles — only in interactive mode */}
            {interactive && (
              <>
                {(
                  [
                    ['tl', 0, 0],
                    ['tr', zw, 0],
                    ['bl', 0, zh],
                    ['br', zw, zh],
                  ] as const
                ).map(([corner, cx, cy]) => {
                  // Place handle fully inside the zone corner
                  const hx = cx === 0 ? 0 : cx - handleSize;
                  const hy = cy === 0 ? 0 : cy - handleSize;
                  // Recover the corner pixel coordinate from the dragged handle position
                  const cornerPxX = (t: Konva.Node) =>
                    cx === 0 ? t.x() : t.x() + handleSize;
                  const cornerPxY = (t: Konva.Node) =>
                    cy === 0 ? t.y() : t.y() + handleSize;
                  return (
                  <Rect
                    key={`${s.id}-${corner}`}
                    x={hx}
                    y={hy}
                    width={handleSize}
                    height={handleSize}
                    fill="#ffffff"
                    stroke={KONVA_COLORS.zoneStroke}
                    strokeWidth={1}
                    cornerRadius={2}
                    draggable
                    dragDistance={2}
                    onDragStart={(e) => {
                      e.cancelBubble = true;
                      prevSizes.current.set(s.id, {
                        x: s.position.x,
                        y: s.position.y,
                        w: s.width,
                        h: s.length,
                      });
                    }}
                    onDragMove={(e) => {
                      e.cancelBubble = true;
                      if (!onZoneChange) return;
                      const localX = snapCmForRoomVertex(cornerPxX(e.target) / ROOM_CANVAS_SCALE);
                      const localY = snapCmForRoomVertex(cornerPxY(e.target) / ROOM_CANVAS_SCALE);
                      const next = getResizeUpdate(s, localX, localY, corner);
                      if (next.width >= 10 && next.length >= 10) onZoneChange(s.id, next);
                    }}
                    onDragEnd={(e) => {
                      e.cancelBubble = true;
                      if (!onZoneChange) return;
                      const localX = snapCmForRoomVertex(cornerPxX(e.target) / ROOM_CANVAS_SCALE);
                      const localY = snapCmForRoomVertex(cornerPxY(e.target) / ROOM_CANVAS_SCALE);
                      const next = getResizeUpdate(s, localX, localY, corner);
                      const valid = isZonePlacementValid(
                        next.position.x, next.position.y, next.width, next.length,
                        vertices, subSpaces, s.id, zonePlacementMode,
                      );
                      if (valid) {
                        onZoneChange(s.id, next);
                      } else {
                        const prev = prevSizes.current.get(s.id) ?? {
                          x: s.position.x, y: s.position.y, w: s.width, h: s.length,
                        };
                        onZoneChange(s.id, {
                          position: { x: prev.x, y: prev.y },
                          width: prev.w,
                          length: prev.h,
                        });
                      }
                      e.target.position({ x: hx, y: hy });
                    }}
                  />
                  );
                })}
              </>
            )}

            <Text
              listening={false}
              x={0}
              y={labelY}
              width={zw}
              text={nameLine ? `${nameLine}\n${dimLabel}` : dimLabel}
              fontFamily={KONVA_FONT_FAMILY}
              fontSize={labelFont}
              fontStyle="bold"
              fill={KONVA_COLORS.zoneLabel}
              align="center"
              lineHeight={1.15}
            />
          </Group>
        );
      })}
    </>
  );
};
