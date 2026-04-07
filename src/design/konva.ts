export const KONVA_COLORS = {
  roomFill: 'rgba(37, 99, 235, 0.32)',
  roomStroke: '#2563eb',
  roomLabel: '#93c5fd',
  roomLabelSub: '#60a5fa',

  previewFill: 'rgba(37, 99, 235, 0.26)',
  previewStroke: '#3b82f6',
  previewLabel: '#93c5fd',
  previewOverlay: '#1e40af',

  vertexHandle: '#2563eb',
  vertexHandleStroke: '#ffffff',

  zoneFill: '#bfdbfe',
  zoneStroke: '#3b82f6',
  zoneStrokeInvalid: '#ef4444',
  zoneLabel: '#1e3a8a',

  wallFill: '#f8fafc',
  wallStroke: '#cbd5e1',
  wallText: '#64748b',

  wallElementColors: {
    door: '#1e40af',
    window: '#0ea5e9',
    radiator: '#ef4444',
    outlet: '#f59e0b',
    switch: '#f59e0b',
    vent: '#6b7280',
    pipe: '#6b7280',
    beam: '#78716c',
    niche: '#a78bfa',
  } as Record<string, string>,
} as const;
