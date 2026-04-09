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
import {
  KONVA_COLORS,
  KONVA_EMOJI_FONT_FAMILY,
  KONVA_FONT_FAMILY,
  SPACE_TYPE_ICONS,
} from '../../design/konva';
import { useUiStore } from '../../store/uiStore';

/** Screen-px constants for outside dimension labels (inverse-scaled, like wall labels). */
const DIM_FONT = 13;
const DIM_STROKE = 3.5;
const DIM_PAD = 14; // px gap between zone edge and label centre

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

  const canvasZoom = useUiStore((s) => s.canvasZoom);
  const selectedZoneId = useUiStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useUiStore((s) => s.setSelectedZoneId);

  const z = Math.max(canvasZoom, 0.2);
  const invZ = 1 / z;

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

        const isSelected = selectedZoneId === s.id;
        const minSide = Math.min(zw, zh);
        const handleSize = Math.min(12, Math.max(8, minSide / 6));

        // Icon sizing: fits nicely for a 200cm zone at typical zoom
        const iconBoxSize = Math.min(44, Math.max(24, minSide * 0.4));
        const iconFontSize = iconBoxSize * 0.58;
        const icon = s.spaceType ? SPACE_TYPE_ICONS[s.spaceType] : '❓';

        // Outside dimension labels (shown when selected, inverse-scaled)
        const widthM = `${(s.width / 100).toFixed(2).replace('.', ',')} m`;
        const heightM = `${(s.length / 100).toFixed(2).replace('.', ',')} m`;

        return (
          <Group
            key={s.id}
            x={zx}
            y={zy}
            draggable={interactive}
            listening={interactive || isSelected}
            onClick={() => {
              if (interactive) setSelectedZoneId(isSelected ? null : s.id);
            }}
            onMouseEnter={(e) => {
              if (!interactive) return;
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = 'grab';
            }}
            onMouseLeave={(e) => {
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = '';
            }}
            onDragStart={(e) => {
              prevPositions.current.set(s.id, { ...s.position });
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = 'grabbing';
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
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = 'grab';
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
            {/* Zone fill + border */}
            <Rect
              width={zw}
              height={zh}
              fill={KONVA_COLORS.zoneFill}
              stroke={isSelected ? KONVA_COLORS.zoneStroke : KONVA_COLORS.zoneStroke}
              strokeWidth={isSelected ? 2.5 : 1}
              opacity={0.85}
              listening
            />

            {/* Selection highlight ring */}
            {isSelected && (
              <Rect
                width={zw}
                height={zh}
                stroke="#38bdf8"
                strokeWidth={2.5}
                fill="transparent"
                listening={false}
                dash={[6, 3]}
              />
            )}

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
                  const hx = cx === 0 ? 0 : cx - handleSize;
                  const hy = cy === 0 ? 0 : cy - handleSize;
                  const cornerPxX = (t: Konva.Node) =>
                    cx === 0 ? t.x() : t.x() + handleSize;
                  const cornerPxY = (t: Konva.Node) =>
                    cy === 0 ? t.y() : t.y() + handleSize;
                  const resizeCursor = (corner === 'tl' || corner === 'br') ? 'nwse-resize' : 'nesw-resize';
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
                      onMouseEnter={(e) => {
                        const c = e.target.getStage()?.container();
                        if (c) c.style.cursor = resizeCursor;
                      }}
                      onMouseLeave={(e) => {
                        const c = e.target.getStage()?.container();
                        if (c) c.style.cursor = 'grab';
                      }}
                      onDragStart={(e) => {
                        e.cancelBubble = true;
                        prevSizes.current.set(s.id, {
                          x: s.position.x,
                          y: s.position.y,
                          w: s.width,
                          h: s.length,
                        });
                        const c = e.target.getStage()?.container();
                        if (c) c.style.cursor = resizeCursor;
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
                        const c = e.target.getStage()?.container();
                        if (c) c.style.cursor = resizeCursor;
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

            {/* Space type icon in zone centre */}
            <Group listening={false}>
              <Rect
                x={zw / 2 - iconBoxSize / 2}
                y={zh / 2 - iconBoxSize / 2}
                width={iconBoxSize}
                height={iconBoxSize}
                fill="rgba(51,65,85,0.88)"
                cornerRadius={iconBoxSize * 0.2}
              />
              <Text
                x={zw / 2 - iconBoxSize / 2}
                y={zh / 2 - iconBoxSize / 2}
                width={iconBoxSize}
                height={iconBoxSize}
                text={icon}
                fontSize={iconFontSize}
                fontFamily={KONVA_EMOJI_FONT_FAMILY}
                align="center"
                verticalAlign="middle"
              />
            </Group>

            {/* Outside dimension labels — shown when zone is selected */}
            {isSelected && (
              <>
                {/* Width label — above the zone (negative y offset, inverse-scaled) */}
                <Group
                  x={zw / 2}
                  y={-(DIM_PAD / z)}
                  scaleX={invZ}
                  scaleY={invZ}
                  listening={false}
                >
                  <Text
                    x={0}
                    y={0}
                    text={widthM}
                    fontFamily={KONVA_FONT_FAMILY}
                    fontSize={DIM_FONT}
                    fontStyle="bold"
                    fill={KONVA_COLORS.dimensionLabelFill}
                    stroke={KONVA_COLORS.dimensionLabelStroke}
                    strokeWidth={DIM_STROKE}
                    fillAfterStrokeEnabled
                    lineJoin="round"
                    align="center"
                    offsetX={widthM.length * DIM_FONT * 0.32}
                    offsetY={DIM_FONT / 2}
                    listening={false}
                  />
                </Group>
                {/* Height label — left of the zone, rotated */}
                <Group
                  x={-(DIM_PAD / z)}
                  y={zh / 2}
                  scaleX={invZ}
                  scaleY={invZ}
                  rotation={-90}
                  listening={false}
                >
                  <Text
                    x={0}
                    y={0}
                    text={heightM}
                    fontFamily={KONVA_FONT_FAMILY}
                    fontSize={DIM_FONT}
                    fontStyle="bold"
                    fill={KONVA_COLORS.dimensionLabelFill}
                    stroke={KONVA_COLORS.dimensionLabelStroke}
                    strokeWidth={DIM_STROKE}
                    fillAfterStrokeEnabled
                    lineJoin="round"
                    align="center"
                    offsetX={heightM.length * DIM_FONT * 0.32}
                    offsetY={DIM_FONT / 2}
                    listening={false}
                  />
                </Group>
              </>
            )}
          </Group>
        );
      })}
    </>
  );
};
