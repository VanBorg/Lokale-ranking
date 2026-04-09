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
} as const;
