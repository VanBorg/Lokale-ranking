import { Line } from 'react-konva';
import { CANVAS_COLORS } from '../../constants/canvas';

interface CanvasGridProps {
  cellSize: number;
  /** Visible floor-plan bounds in layer (world) pixels — lines align to global 2m grid. */
  worldLeft: number;
  worldTop: number;
  worldRight: number;
  worldBottom: number;
}

export const CanvasGrid = ({
  cellSize,
  worldLeft,
  worldTop,
  worldRight,
  worldBottom,
}: CanvasGridProps) => {
  const pad = cellSize;
  const startX = Math.floor((worldLeft - pad) / cellSize) * cellSize;
  const endX = Math.ceil((worldRight + pad) / cellSize) * cellSize;
  const startY = Math.floor((worldTop - pad) / cellSize) * cellSize;
  const endY = Math.ceil((worldBottom + pad) / cellSize) * cellSize;

  const lines: { points: number[]; key: string }[] = [];

  for (let x = startX; x <= endX; x += cellSize) {
    lines.push({ points: [x, startY, x, endY], key: `v-${x}` });
  }
  for (let y = startY; y <= endY; y += cellSize) {
    lines.push({ points: [startX, y, endX, y], key: `h-${y}` });
  }

  return (
    <>
      {lines.map(({ points, key }) => (
        <Line
          key={key}
          points={points}
          stroke={CANVAS_COLORS.grid}
          strokeWidth={1}
          listening={false}
        />
      ))}
    </>
  );
};
