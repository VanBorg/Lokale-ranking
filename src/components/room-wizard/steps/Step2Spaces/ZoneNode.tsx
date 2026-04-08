import { useRef } from 'react';
import type Konva from 'konva';
import { Group, Rect, Text } from 'react-konva';
import type { SubSpace, RoomVertex, ZonePlacementMode } from '../../../../types/room';
import { KONVA_COLORS } from '../../../../design/konva';
import { cmToM, snapCmForRoomVertex } from '../../../../utils/geometry';
import { isZonePlacementValid, getZoneWallSnapPosition } from '../../../../utils/subSpaceContainment';

const HANDLE_SIZE = 8;
const MIN_ZONE_CM = 10;

interface ZoneNodeProps {
  space: SubSpace;
  allSpaces: SubSpace[];
  vertices: RoomVertex[];
  mode: ZonePlacementMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  onUpdate: (id: string, updates: Partial<SubSpace>) => void;
}

type Corner = 'tl' | 'tr' | 'br' | 'bl';

export const ZoneNode = ({
  space, allSpaces, vertices, mode, scale, offsetX, offsetY, onUpdate,
}: ZoneNodeProps) => {
  const groupRef = useRef<Konva.Group>(null);
  const prevPos = useRef({ x: space.position.x, y: space.position.y });

  const sx = offsetX + space.position.x * scale;
  const sy = offsetY + space.position.y * scale;
  const sw = space.width * scale;
  const sh = space.length * scale;

  const commitMove = (pxX: number, pxY: number) => {
    const cmX = snapCmForRoomVertex((pxX - offsetX) / scale);
    const cmY = snapCmForRoomVertex((pxY - offsetY) / scale);
    const snapped = getZoneWallSnapPosition(cmX, cmY, space.width, space.length, vertices, mode);
    const valid = isZonePlacementValid(
      snapped.x, snapped.y, space.width, space.length,
      vertices, allSpaces, space.id, mode,
    );
    if (valid) {
      prevPos.current = snapped;
      onUpdate(space.id, { position: snapped });
    } else {
      groupRef.current?.position({ x: offsetX + prevPos.current.x * scale, y: offsetY + prevPos.current.y * scale });
      groupRef.current?.getLayer()?.batchDraw();
    }
  };

  const commitResize = (corner: Corner, handleLocalPx: { x: number; y: number }) => {
    const ox = space.position.x;
    const oy = space.position.y;
    const anchorX = ox + space.width;
    const anchorY = oy + space.length;
    const hx = handleLocalPx.x / scale;
    const hy = handleLocalPx.y / scale;

    let nx = ox, ny = oy, nw = space.width, nh = space.length;
    if (corner === 'tl') { nx = snapCmForRoomVertex(ox + hx); ny = snapCmForRoomVertex(oy + hy); nw = anchorX - nx; nh = anchorY - ny; }
    else if (corner === 'tr') { ny = snapCmForRoomVertex(oy + hy); nw = snapCmForRoomVertex(hx); nh = anchorY - ny; }
    else if (corner === 'br') { nw = snapCmForRoomVertex(hx); nh = snapCmForRoomVertex(hy); }
    else if (corner === 'bl') { nx = snapCmForRoomVertex(ox + hx); nw = anchorX - nx; nh = snapCmForRoomVertex(hy); }

    if (nw < MIN_ZONE_CM || nh < MIN_ZONE_CM) return;
    const snapped = getZoneWallSnapPosition(nx, ny, nw, nh, vertices, mode);
    if (isZonePlacementValid(snapped.x, snapped.y, nw, nh, vertices, allSpaces, space.id, mode)) {
      onUpdate(space.id, { position: snapped, width: nw, length: nh });
    }
  };

  const handles: { corner: Corner; hx: number; hy: number }[] = [
    { corner: 'tl', hx: 0, hy: 0 },
    { corner: 'tr', hx: sw, hy: 0 },
    { corner: 'br', hx: sw, hy: sh },
    { corner: 'bl', hx: 0, hy: sh },
  ];

  return (
    <Group ref={groupRef} x={sx} y={sy} draggable
      onDragEnd={(e) => commitMove(e.target.x(), e.target.y())}
    >
      <Rect
        width={sw} height={sh}
        fill={KONVA_COLORS.zoneFill} stroke={KONVA_COLORS.zoneStroke} strokeWidth={1.5}
        cornerRadius={3}
      />
      <Text
        x={4} y={4} width={sw - 8} height={sh - 8}
        text={`${space.name}\n${cmToM(space.width).toFixed(2)} × ${cmToM(space.length).toFixed(2)} m`}
        fontSize={11} fill={KONVA_COLORS.zoneLabel} align="center" verticalAlign="middle"
      />
      {handles.map(({ corner, hx, hy }) => (
        <Rect
          key={corner}
          x={hx - HANDLE_SIZE / 2} y={hy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE} height={HANDLE_SIZE}
          fill="#ffffff" stroke={KONVA_COLORS.zoneStroke} strokeWidth={1.5}
          cornerRadius={2} draggable
          onDragEnd={(e) => {
            // e.target.x/y = rect left/top in group coords; add half-size to get centre
            const lx = e.target.x() + HANDLE_SIZE / 2;
            const ly = e.target.y() + HANDLE_SIZE / 2;
            e.target.position({ x: 0, y: 0 });
            commitResize(corner, { x: lx, y: ly });
          }}
        />
      ))}
    </Group>
  );
};
