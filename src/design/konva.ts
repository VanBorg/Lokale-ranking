import type { RoomType } from '../types/room';

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  bathroom: '🛁',
  kitchen:  '🍳',
  bedroom:  '🛏',
  living:   '🛋',
  hallway:  '🚪',
  toilet:   '🚽',
  laundry:  '🧺',
  garage:   '🚗',
  attic:    '📦',
  basement: '🔧',
  other:    '🏠',
};

export const KONVA_COLORS = {
  roomFill: 'rgba(42, 169, 237, 0.32)',
  roomStroke: '#2aa9ed',
  roomLabel: '#89d9fa',
  roomLabelSub: '#5cc8f5',

  previewFill: 'rgba(42, 169, 237, 0.26)',
  previewStroke: '#2aa9ed',
  previewLabel: '#89d9fa',
  previewOverlay: '#135d8c',

  vertexHandle: '#2aa9ed',
  vertexHandleStroke: '#ffffff',

  zoneFill: '#b8ecfd',
  zoneStroke: '#2aa9ed',
  zoneStrokeInvalid: '#ef4444',
  zoneLabel: '#0f4a6e',

  wallFill: '#f8fafc',
  wallStroke: '#cbd5e1',
  wallText: '#64748b',

  wallElementColors: {
    door: '#135d8c',
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
