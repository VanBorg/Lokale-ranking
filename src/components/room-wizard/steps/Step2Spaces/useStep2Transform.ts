import { useEffect, useRef, useState } from 'react';
import type { RoomVertex } from '../../../../types/room';
import { verticesBoundingBox } from '../../../../utils/geometry';

const PADDING = 40;

interface Step2Transform {
  containerRef: React.RefObject<HTMLDivElement | null>;
  stageW: number;
  stageH: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const useStep2Transform = (vertices: RoomVertex[]): Step2Transform => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 600, h: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    observer.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => observer.disconnect();
  }, []);

  const { w: stageW, h: stageH } = size;

  if (vertices.length < 2) {
    return { containerRef, stageW, stageH, scale: 1, offsetX: 0, offsetY: 0 };
  }

  const bb = verticesBoundingBox(vertices);
  const availW = Math.max(1, stageW - PADDING * 2);
  const availH = Math.max(1, stageH - PADDING * 2);
  const scale = Math.min(availW / bb.width, availH / bb.height);
  const offsetX = (stageW - bb.width * scale) / 2 - bb.minX * scale;
  const offsetY = (stageH - bb.height * scale) / 2 - bb.minY * scale;

  return { containerRef, stageW, stageH, scale, offsetX, offsetY };
};
