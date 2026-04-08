import { useEffect, useRef, useState } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Tracks the pixel size of a container element via ResizeObserver.
 * Returns a stable ref to attach to the container div and the current size.
 */
export const useViewportSize = (initialWidth = 800, initialHeight = 600) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ViewportSize>({ width: initialWidth, height: initialHeight });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
};
