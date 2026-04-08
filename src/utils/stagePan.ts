/**
 * Keeps the scaled map in view. When the map is smaller than the viewport on both axes,
 * pan must still be clamped to a range — not forced to one centre point — or drag/scroll feels broken.
 */
export const clampStagePan = (
  pan: { x: number; y: number },
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
): { x: number; y: number } => {
  const contentW = contentWidth * zoom;
  const contentH = contentHeight * zoom;

  if (contentW <= viewportWidth) {
    const maxX = Math.max(0, viewportWidth - contentW);
    if (contentH <= viewportHeight) {
      const maxY = Math.max(0, viewportHeight - contentH);
      return {
        x: Math.min(Math.max(pan.x, 0), maxX),
        y: Math.min(Math.max(pan.y, 0), maxY),
      };
    }
    return {
      x: Math.min(Math.max(pan.x, 0), maxX),
      y: Math.min(0, Math.max(viewportHeight - contentH, pan.y)),
    };
  }

  if (contentH <= viewportHeight) {
    return {
      x: Math.min(0, Math.max(viewportWidth - contentW, pan.x)),
      y: Math.min(Math.max(pan.y, 0), Math.max(0, viewportHeight - contentH)),
    };
  }

  return {
    x: Math.min(0, Math.max(viewportWidth - contentW, pan.x)),
    y: Math.min(0, Math.max(viewportHeight - contentH, pan.y)),
  };
};
