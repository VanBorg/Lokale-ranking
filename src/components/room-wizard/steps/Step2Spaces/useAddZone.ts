import { useRoomStore } from '../../../../store/roomStore';
import { generateId } from '../../../../utils/idGenerator';
import { isZonePlacementValid, getZoneWallSnapPosition } from '../../../../utils/subSpaceContainment';
import type { SubSpace } from '../../../../types/room';

const DEFAULT_ZONE_CM = 100;

const getNextZoneName = (spaces: SubSpace[]): string => {
  let maxIndex = 0;
  spaces.forEach((s) => {
    const match = /^Zone(\d+)$/i.exec(s.name.trim());
    if (match) {
      const n = parseInt(match[1]!, 10);
      if (n > maxIndex) maxIndex = n;
    }
  });
  return `Zone${maxIndex + 1}`;
};

export const useAddZone = () => {
  const draft = useRoomStore((s) => s.draft);
  const addSubSpace = useRoomStore((s) => s.addSubSpace);

  const addZone = () => {
    const { vertices, subSpaces, zonePlacementMode: mode } = draft;
    const w = DEFAULT_ZONE_CM;
    const len = DEFAULT_ZONE_CM;

    const minX = vertices.length ? Math.min(...vertices.map((v) => v.x)) : 0;
    const minY = vertices.length ? Math.min(...vertices.map((v) => v.y)) : 0;
    const maxX = vertices.length ? Math.max(...vertices.map((v) => v.x)) : 400;
    const maxY = vertices.length ? Math.max(...vertices.map((v) => v.y)) : 400;
    const centroidX = vertices.length
      ? vertices.reduce((s, v) => s + v.x, 0) / vertices.length - w / 2
      : 10;
    const centroidY = vertices.length
      ? vertices.reduce((s, v) => s + v.y, 0) / vertices.length - len / 2
      : 10;

    const gridCandidates: { x: number; y: number }[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        gridCandidates.push({
          x: minX + ((maxX - minX) * (col + 0.5)) / 5 - w / 2,
          y: minY + ((maxY - minY) * (row + 0.5)) / 5 - len / 2,
        });
      }
    }

    const candidates = [{ x: centroidX, y: centroidY }, ...gridCandidates, { x: 10, y: 10 }];
    let finalPosition: { x: number; y: number } | null = null;

    for (const pos of candidates) {
      const snapped =
        mode === 'vrij' ? pos : getZoneWallSnapPosition(pos.x, pos.y, w, len, vertices, mode);
      if (isZonePlacementValid(snapped.x, snapped.y, w, len, vertices, subSpaces, undefined, mode)) {
        finalPosition = snapped;
        break;
      }
    }

    if (!finalPosition) return;
    addSubSpace({ id: generateId(), name: getNextZoneName(subSpaces), width: w, length: len, position: finalPosition });
  };

  return addZone;
};
