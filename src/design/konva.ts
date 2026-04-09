import type { RoomType, SpaceType } from '../types/room';

/** Ensures colour emoji render on Windows instead of invisible glyphs with a text font. */
export const KONVA_EMOJI_FONT_FAMILY =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

/** Matches app UI — use for Konva dimensions, angles, zone labels (not emoji glyphs). */
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

export const SPACE_TYPE_ICONS: Record<SpaceType, string> = {
  // Natte ruimtes
  wc:         '🚽',
  douche:     '🚿',
  badkamer:   '🛁',
  // Wasruimte
  washok:     '🧺',
  // Opslag & technisch
  berging:     '📦',
  inloopkast:  '👗',
  kledingkast: '🚪',
  meterkast:   '⚡',
  'cv-ruimte': '🔥',
  bijkeuken:   '🧹',
  // Leefruimtes
  woonkamer:  '📺',
  keuken:     '🍽️',
  eetkamer:   '🍴',
  slaapkamer: '🌙',
  kinderkamer:'🧸',
  werkkamer:  '💻',
  // Overig
  entree:     '🚪',
  gang:       '🏃',
  hobbyruimte:'🎨',
  garage:     '🚗',
  overig:     '📌',
};

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  // Natte ruimtes
  wc:         'WC',
  douche:     'Douche',
  badkamer:   'Badkamer',
  // Wasruimte
  washok:     'Washok',
  // Opslag & technisch
  berging:     'Berging',
  inloopkast:  'Inloopkast',
  kledingkast: 'Kledingkast',
  meterkast:   'Meterkast',
  'cv-ruimte': 'CV-ruimte',
  bijkeuken:   'Bijkeuken',
  // Leefruimtes
  woonkamer:  'Woonkamer',
  keuken:     'Keuken',
  eetkamer:   'Eetkamer',
  slaapkamer: 'Slaapkamer',
  kinderkamer:'Kinderkamer',
  werkkamer:  'Werkkamer',
  // Overig
  entree:     'Entree',
  gang:       'Gang',
  hobbyruimte:'Hobbyruimte',
  garage:     'Garage',
  overig:     'Overig',
};

export const SPACE_TYPE_GROUPS: { label: string; types: SpaceType[] }[] = [
  { label: 'Natte ruimtes',    types: ['wc', 'douche', 'badkamer'] },
  { label: 'Wasruimte',        types: ['washok'] },
  { label: 'Opslag & technisch', types: ['berging', 'inloopkast', 'kledingkast', 'meterkast', 'cv-ruimte', 'bijkeuken'] },
  { label: 'Leefruimtes',      types: ['woonkamer', 'keuken', 'eetkamer', 'slaapkamer', 'kinderkamer', 'werkkamer'] },
  { label: 'Overig',           types: ['entree', 'gang', 'hobbyruimte', 'garage', 'overig'] },
];

export const KONVA_COLORS = {
  roomFill: 'rgba(42, 169, 237, 0.32)',
  roomStroke: '#2aa9ed',
  roomLabel: '#89d9fa',
  roomLabelSub: '#5cc8f5',

  previewFill: 'rgba(42, 169, 237, 0.26)',
  previewStroke: '#2aa9ed',
  /** Highlight edge when the matching row is hovered in the wall list (step 1). */
  wallHoverStroke: '#fb923c',

  vertexHandle: '#2aa9ed',
  vertexHandleStroke: '#ffffff',
  vertexHandleLocked: '#f97316',

  zoneFill: '#b8ecfd',
  zoneStroke: '#2aa9ed',
  zoneStrokeInvalid: '#ef4444',
  zoneLabel: '#082f49',

  wallFill: '#f8fafc',
  wallStroke: '#cbd5e1',
  wallText: '#64748b',
  /** Floor-plan overlay: wall length + angle — white text, dark halo for contrast on blue preview. */
  dimensionLabelFill: '#ffffff',
  dimensionLabelStroke: '#060b14',
  dimensionLabelEmphasiseFill: '#ffffff',
  dimensionLabelEmphasiseStroke: '#ea580c',
  angleLabelFill: '#ffffff',
  angleLabelStroke: '#060b14',

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
