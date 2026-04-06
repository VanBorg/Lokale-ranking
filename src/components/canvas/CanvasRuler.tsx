import type { ReactElement } from 'react';
import { ROOM_CANVAS_SCALE } from '../../utils/geometry';

interface CanvasRulerProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  pan: { x: number; y: number };
}

const RULER_SIZE = 24;

function RulerTicks({
  length,
  blockSize,
  offset,
  vertical,
}: {
  length: number;
  blockSize: number;
  offset: number;
  vertical: boolean;
}) {
  const blocks: ReactElement[] = [];
  const startOffset = ((offset % blockSize) + blockSize) % blockSize;
  const firstMetre = Math.floor(-offset / blockSize);

  let pos = startOffset - blockSize;
  let metre = firstMetre - 1;

  while (pos < length) {
    const blockStart = pos;
    const blockEnd = Math.min(pos + blockSize, length);
    const blockWidth = blockEnd - blockStart;
    if (blockWidth > 0) {
      const isOrange = Math.abs(metre) % 2 === 1;
      const showLabel = metre !== 0 && metre % 2 === 0;
      blocks.push(
        <div
          key={metre}
          className={`absolute flex items-center overflow-hidden ${isOrange ? 'bg-brand-light' : 'bg-app'}`}
          style={
            vertical
              ? { top: blockStart, left: 0, width: RULER_SIZE, height: blockWidth }
              : { left: blockStart, top: 0, height: RULER_SIZE, width: blockWidth }
          }
        >
          {showLabel && (
            <span
              className="select-none text-[9px] font-medium leading-none text-muted"
              style={
                vertical
                  ? { writingMode: 'vertical-lr', transform: 'rotate(180deg)', marginLeft: 4 }
                  : { marginLeft: 2 }
              }
            >
              {metre}m
            </span>
          )}
        </div>,
      );
    }
    pos += blockSize;
    metre += 1;
  }

  return <>{blocks}</>;
}

export const CanvasRuler = ({ canvasWidth, canvasHeight, zoom, pan }: CanvasRulerProps) => {
  const blockSize = 100 * ROOM_CANVAS_SCALE * zoom;

  return (
    <>
      {/* Corner square */}
      <div
        className="absolute z-20 bg-surface"
        style={{ top: 0, left: 0, width: RULER_SIZE, height: RULER_SIZE }}
      />

      {/* Horizontal ruler (top) */}
      <div
        className="absolute z-10 overflow-hidden border-b border-line"
        style={{ top: 0, left: RULER_SIZE, height: RULER_SIZE, width: canvasWidth - RULER_SIZE }}
      >
        <div className="relative h-full w-full">
          <RulerTicks
            length={canvasWidth - RULER_SIZE}
            blockSize={blockSize}
            offset={pan.x}
            vertical={false}
          />
        </div>
      </div>

      {/* Vertical ruler (left) */}
      <div
        className="absolute z-10 overflow-hidden border-r border-line"
        style={{ top: RULER_SIZE, left: 0, width: RULER_SIZE, height: canvasHeight - RULER_SIZE }}
      >
        <div className="relative h-full w-full">
          <RulerTicks
            length={canvasHeight - RULER_SIZE}
            blockSize={blockSize}
            offset={pan.y}
            vertical
          />
        </div>
      </div>
    </>
  );
};
