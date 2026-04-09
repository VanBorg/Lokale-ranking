import type { RoomType } from '../types/room';

/** Ensures colour emoji render on Windows instead of invisible glyphs with a text font. */
export const KONVA_EMOJI_FONT_FAMILY =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

/** Matches app UI — use for Konva dimensions and angles (not emoji glyphs). */
export const KONVA_FONT_FAMILY = '"Roboto Mono", ui-monospace, monospace';

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  bathroom: '🛁',
  kitchen:  '🍽️',
  bedroom:  '🌙',
  living:   '📺',
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

  previewFill: 'rgba(42, 169, 237, 0.26)',
  previewStroke: '#2aa9ed',
  /** Highlight edge when the matching row is hovered in the wall list. */
  wallHoverStroke: '#fb923c',

  vertexHandle: '#2aa9ed',
  vertexHandleStroke: '#ffffff',
  vertexHandleLocked: '#f97316',

  wallStroke: '#cbd5e1',
  /** Floor-plan overlay: wall length + angle — white text, dark halo for contrast on blue preview. */
  dimensionLabelFill: '#ffffff',
  dimensionLabelStroke: '#060b14',
  dimensionLabelEmphasiseFill: '#ffffff',
  dimensionLabelEmphasiseStroke: '#ea580c',
  angleLabelFill: '#ffffff',
  angleLabelStroke: '#060b14',

  /** Step 2: parent room shown as static backdrop. */
  parentRoomFill: 'rgba(42, 169, 237, 0.12)',
  parentRoomStroke: '#2aa9ed',
  /** Step 2: selected sub-room border. */
  subRoomSelectedStroke: '#fb923c',
  subRoomStroke: '#94a3b8',
} as const;

/** Fill colours per room type for sub-rooms on the floor plan. */
export const SUB_ROOM_TYPE_FILLS: Record<RoomType, string> = {
  bathroom: 'rgba(59,130,246,0.35)',
  kitchen:  'rgba(234,179,8,0.30)',
  bedroom:  'rgba(168,85,247,0.30)',
  living:   'rgba(34,197,94,0.30)',
  hallway:  'rgba(156,163,175,0.30)',
  toilet:   'rgba(99,102,241,0.30)',
  laundry:  'rgba(14,165,233,0.30)',
  garage:   'rgba(107,114,128,0.30)',
  attic:    'rgba(217,119,6,0.30)',
  basement: 'rgba(120,113,108,0.30)',
  other:    'rgba(251,146,60,0.25)',
};
