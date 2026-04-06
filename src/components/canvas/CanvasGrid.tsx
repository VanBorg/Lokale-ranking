import { Line } from 'react-konva';

interface CanvasGridProps {
  width: number;
  height: number;
  cellSize: number;
}

export const CanvasGrid = ({ width, height, cellSize }: CanvasGridProps) => {
  const lines: { points: number[]; key: string }[] = [];

  for (let x = 0; x <= width; x += cellSize) {
    lines.push({ points: [x, 0, x, height], key: `v-${x}` });
  }
  for (let y = 0; y <= height; y += cellSize) {
    lines.push({ points: [0, y, width, y], key: `h-${y}` });
  }

  return (
    <>
      {lines.map(({ points, key }) => (
        <Line
          key={key}
          points={points}
          stroke="#c8cdd4"
          strokeWidth={0.7}
          listening={false}
        />
      ))}
    </>
  );
};
