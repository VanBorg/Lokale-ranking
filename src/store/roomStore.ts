import { create } from 'zustand';
import type {
  Room, RoomType, RoomPreset, RoomVertex, SubSpace, FloorType, CeilingType, ZonePlacementMode,
} from '../types/room';
import type { Wall, WallElement, WallDetail } from '../types/wall';
import { generateWallsFromVertices } from '../utils/wallGenerator';
import {
  calcNetArea,
  verticesBoundingBox,
  ROOM_CANVAS_SCALE,
  rotateVertices90CW,
  rotateVertices90CCW,
  snapCmForRoomVertex,
  snapVertexCmToGrid,
  snapVerticesCmToGrid,
  isVertexFrozen,
} from '../utils/geometry';
import { calcPolygonArea, midpoint } from '../utils/geometry';
import { createPresetVertices } from '../utils/presets';
import { generateId } from '../utils/idGenerator';
import { suggestNextRoomName } from '../utils/roomNaming';
import { isZonePlacementValid, getZoneWallSnapPosition } from '../utils/subSpaceContainment';
import { useProjectStore } from './projectStore';
import { useUiStore } from './uiStore';
import { getFloorPlanMapSizePx } from '../utils/geometry';

interface RoomDraft {
  id: string;
  name: string;
  roomType: RoomType;
  preset: RoomPreset;
  vertices: RoomVertex[];
  height: number;
  walls: Wall[];
  subSpaces: SubSpace[];
  zonePlacementMode: ZonePlacementMode;
  lockedWallIds: string[];
  floorType?: FloorType;
  ceilingType?: CeilingType;
  floorNotes: string;
  ceilingNotes: string;
}

interface RoomStoreState {
  draft: RoomDraft;
  editingRoomId: string | null;

  loadPreset: (preset: RoomPreset) => void;
  updateVertex: (index: number, pos: { x: number; y: number }) => void;
  addVertex: (afterIndex: number) => void;
  removeVertex: (index: number) => void;
  setVertices: (vertices: RoomVertex[]) => void;
  setHeight: (height: number) => void;
  setName: (name: string) => void;
  setRoomType: (roomType: RoomType) => void;
  setFloorType: (type: FloorType | undefined) => void;
  setCeilingType: (type: CeilingType | undefined) => void;
  setFloorNotes: (notes: string) => void;
  setCeilingNotes: (notes: string) => void;
  setZonePlacementMode: (mode: ZonePlacementMode) => void;

  rotateRoom: () => void;
  rotateRoomCCW: () => void;

  addSubSpace: (subSpace: SubSpace) => void;
  removeSubSpace: (id: string) => void;
  updateSubSpace: (id: string, updates: Partial<SubSpace>) => void;

  addWallElement: (wallId: string, element: WallElement) => void;
  updateWallElement: (wallId: string, elementId: string, updates: Partial<WallElement>) => void;
  removeWallElement: (wallId: string, elementId: string) => void;
  addWallDetail: (wallId: string, detail: WallDetail) => void;
  removeWallDetail: (wallId: string, detailId: string) => void;
  addWallPhoto: (wallId: string, dataUrl: string) => void;
  removeWallPhoto: (wallId: string, index: number) => void;
  toggleWallLock: (wallId: string) => void;

  loadRoom: (room: Room) => void;
  resetDraft: () => void;
  finaliseRoom: () => Room;
}

/** Default floor footprint for new rooms: 10 m × 10 m (vertices in cm). */
const DEFAULT_ROOM_W_CM = 1000;
const DEFAULT_ROOM_L_CM = 1000;

const createEmptyDraft = (): RoomDraft => {
  const preset: RoomPreset = 'rectangle';
  const vertices = snapVerticesCmToGrid(
    createPresetVertices(preset, DEFAULT_ROOM_W_CM, DEFAULT_ROOM_L_CM),
  );
  const height = 260;
  return {
    id: generateId(),
    name: '',
    roomType: 'other',
    preset,
    vertices,
    height,
    walls: generateWallsFromVertices(vertices, height),
    subSpaces: [],
    zonePlacementMode: 'binnen',
    lockedWallIds: [],
    floorType: undefined,
    ceilingType: undefined,
    floorNotes: '',
    ceilingNotes: '',
  };
};

const recalcWallNetAreas = (walls: Wall[]): Wall[] =>
  walls.map((w) => ({ ...w, netArea: calcNetArea(w) }));

/** Re-validate sub-spaces after vertex/height change. Keeps valid ones, marks invalid. */
const revalidateSubSpaces = (
  subSpaces: SubSpace[],
  vertices: RoomVertex[],
  mode: ZonePlacementMode,
): SubSpace[] =>
  subSpaces.filter((s) =>
    isZonePlacementValid(
      s.position.x, s.position.y, s.width, s.length,
      vertices,
      subSpaces,
      s.id,
      mode,
    ),
  );

export const useRoomStore = create<RoomStoreState>()((set, get) => ({
  draft: createEmptyDraft(),
  editingRoomId: null,

  loadPreset: (preset) =>
    set((state) => {
      const d = state.draft;
      // Always use default 10 m × 10 m footprint when picking a shape — not the previous
      // polygon’s bbox (icon-based presets used to end up smaller than W×L and then shrank each switch).
      const vertices = snapVerticesCmToGrid(
        createPresetVertices(preset, DEFAULT_ROOM_W_CM, DEFAULT_ROOM_L_CM),
      );
      // Completely new shape — fresh wall IDs; clear any stale locks.
      const walls = generateWallsFromVertices(vertices, d.height);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices, d.zonePlacementMode);
      return { draft: { ...d, preset, vertices, walls, subSpaces, lockedWallIds: [] } };
    }),

  updateVertex: (index, pos) =>
    set((state) => {
      const d = state.draft;
      if (isVertexFrozen(index, d.walls, d.lockedWallIds)) return state;
      const snapped = { x: snapCmForRoomVertex(pos.x), y: snapCmForRoomVertex(pos.y) };
      const vertices = d.vertices.map((v, i) => (i === index ? snapped : v));
      const walls = generateWallsFromVertices(vertices, d.height, d.walls);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices, d.zonePlacementMode);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  addVertex: (afterIndex) =>
    set((state) => {
      const d = state.draft;
      const n = d.vertices.length;
      const a = d.vertices[afterIndex]!;
      const b = d.vertices[(afterIndex + 1) % n]!;
      const mp = snapVertexCmToGrid(midpoint(a, b));
      const vertices = [
        ...d.vertices.slice(0, afterIndex + 1),
        mp,
        ...d.vertices.slice(afterIndex + 1),
      ];
      const walls = generateWallsFromVertices(vertices, d.height);
      return { draft: { ...d, vertices, walls } };
    }),

  removeVertex: (index) =>
    set((state) => {
      const d = state.draft;
      if (d.vertices.length <= 3) return state;
      const vertices = d.vertices.filter((_, i) => i !== index);
      const walls = generateWallsFromVertices(vertices, d.height);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices, d.zonePlacementMode);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  setVertices: (vertices) =>
    set((state) => {
      const d = state.draft;
      vertices = snapVerticesCmToGrid(vertices);
      const walls = generateWallsFromVertices(vertices, d.height, d.walls);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices, d.zonePlacementMode);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  setHeight: (height) =>
    set((state) => {
      const d = state.draft;
      const walls = generateWallsFromVertices(d.vertices, height, d.walls);
      return { draft: { ...d, height, walls } };
    }),

  setName: (name) =>
    set((state) => ({ draft: { ...state.draft, name } })),

  setRoomType: (roomType) =>
    set((state) => {
      const rooms = useProjectStore.getState().project.rooms;
      const name = suggestNextRoomName(roomType, rooms, state.editingRoomId);
      return { draft: { ...state.draft, roomType, name } };
    }),

  setFloorType: (type) =>
    set((state) => ({ draft: { ...state.draft, floorType: type } })),

  setCeilingType: (type) =>
    set((state) => ({ draft: { ...state.draft, ceilingType: type } })),

  setFloorNotes: (notes) =>
    set((state) => ({ draft: { ...state.draft, floorNotes: notes } })),

  setCeilingNotes: (notes) =>
    set((state) => ({ draft: { ...state.draft, ceilingNotes: notes } })),

  setZonePlacementMode: (mode) =>
    set((state) => {
      const d = state.draft;
      // Re-snap every zone to the new wall side so the mode change is immediately visible
      // and zones are valid for the next drag operation.
      const snappedSubSpaces = d.subSpaces.map((s) => {
        const pos = getZoneWallSnapPosition(
          s.position.x, s.position.y, s.width, s.length, d.vertices, mode,
        );
        return { ...s, position: pos };
      });
      return { draft: { ...d, zonePlacementMode: mode, subSpaces: snappedSubSpaces } };
    }),

  rotateRoom: () =>
    set((state) => {
      const d = state.draft;
      const vertices = snapVerticesCmToGrid(rotateVertices90CW(d.vertices));
      const walls = generateWallsFromVertices(vertices, d.height, d.walls);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices, d.zonePlacementMode);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  rotateRoomCCW: () =>
    set((state) => {
      const d = state.draft;
      const vertices = snapVerticesCmToGrid(rotateVertices90CCW(d.vertices));
      const walls = generateWallsFromVertices(vertices, d.height, d.walls);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices, d.zonePlacementMode);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  addSubSpace: (subSpace) =>
    set((state) => ({
      draft: { ...state.draft, subSpaces: [...state.draft.subSpaces, subSpace] },
    })),

  removeSubSpace: (id) =>
    set((state) => ({
      draft: { ...state.draft, subSpaces: state.draft.subSpaces.filter((s) => s.id !== id) },
    })),

  updateSubSpace: (id, updates) =>
    set((state) => ({
      draft: {
        ...state.draft,
        subSpaces: state.draft.subSpaces.map((s) =>
          s.id === id ? { ...s, ...updates } : s,
        ),
      },
    })),

  addWallElement: (wallId, element) =>
    set((state) => {
      const walls = state.draft.walls.map((w) =>
        w.id === wallId ? { ...w, elements: [...w.elements, element] } : w,
      );
      return { draft: { ...state.draft, walls: recalcWallNetAreas(walls) } };
    }),

  updateWallElement: (wallId, elementId, updates) =>
    set((state) => {
      const walls = state.draft.walls.map((w) =>
        w.id === wallId
          ? { ...w, elements: w.elements.map((e) => (e.id === elementId ? { ...e, ...updates } : e)) }
          : w,
      );
      return { draft: { ...state.draft, walls: recalcWallNetAreas(walls) } };
    }),

  removeWallElement: (wallId, elementId) =>
    set((state) => {
      const walls = state.draft.walls.map((w) =>
        w.id === wallId
          ? { ...w, elements: w.elements.filter((e) => e.id !== elementId) }
          : w,
      );
      return { draft: { ...state.draft, walls: recalcWallNetAreas(walls) } };
    }),

  addWallDetail: (wallId, detail) =>
    set((state) => ({
      draft: {
        ...state.draft,
        walls: state.draft.walls.map((w) =>
          w.id === wallId ? { ...w, details: [...w.details, detail] } : w,
        ),
      },
    })),

  removeWallDetail: (wallId, detailId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        walls: state.draft.walls.map((w) =>
          w.id === wallId
            ? { ...w, details: w.details.filter((d) => d.id !== detailId) }
            : w,
        ),
      },
    })),

  addWallPhoto: (wallId, dataUrl) =>
    set((state) => ({
      draft: {
        ...state.draft,
        walls: state.draft.walls.map((w) =>
          w.id === wallId ? { ...w, photos: [...w.photos, dataUrl] } : w,
        ),
      },
    })),

  removeWallPhoto: (wallId, index) =>
    set((state) => ({
      draft: {
        ...state.draft,
        walls: state.draft.walls.map((w) =>
          w.id === wallId ? { ...w, photos: w.photos.filter((_, i) => i !== index) } : w,
        ),
      },
    })),

  toggleWallLock: (wallId) =>
    set((state) => {
      const ids = state.draft.lockedWallIds;
      const next = ids.includes(wallId)
        ? ids.filter((id) => id !== wallId)
        : [...ids, wallId];
      return { draft: { ...state.draft, lockedWallIds: next } };
    }),

  loadRoom: (room) =>
    set({
      draft: {
        id: room.id,
        name: room.name,
        roomType: room.roomType,
        preset: room.preset,
        vertices: room.vertices,
        height: room.height,
        walls: room.walls,
        subSpaces: room.subSpaces,
        zonePlacementMode: 'binnen',
        lockedWallIds: [],
        floorType: room.floor.type,
        ceilingType: room.ceiling.type,
        floorNotes: room.floor.notes ?? '',
        ceilingNotes: room.ceiling.notes ?? '',
      },
      editingRoomId: room.id,
    }),

  resetDraft: () => {
    const rooms = useProjectStore.getState().project.rooms;
    const draft = createEmptyDraft();
    draft.name = suggestNextRoomName(draft.roomType, rooms, null);
    set({ draft, editingRoomId: null });
  },

  finaliseRoom: () => {
    const { draft, editingRoomId } = get();
    const existingRooms = useProjectStore.getState().project.rooms;
    const bb = verticesBoundingBox(draft.vertices);
    const w = bb.width * ROOM_CANVAS_SCALE;
    const h = bb.height * ROOM_CANVAS_SCALE;
    const floorArea = calcPolygonArea(draft.vertices);

    let position = { x: 50, y: 50 };
    if (!editingRoomId && existingRooms.length === 0) {
      const { floorPlanViewportWidth: vw, floorPlanViewportHeight: vh } = useUiStore.getState();
      const safeW = vw > 0 ? vw : 1200;
      const safeH = vh > 0 ? vh : 800;
      const { width: mapW, height: mapH } = getFloorPlanMapSizePx(safeW, safeH);
      position = {
        x: mapW / 2 - w / 2,
        y: mapH / 2 - h / 2,
      };
    } else if (!editingRoomId && existingRooms.length > 0) {
      const maxX = Math.max(
        ...existingRooms.map((r) => {
          const rbb = verticesBoundingBox(r.vertices);
          return r.position.x + rbb.width * ROOM_CANVAS_SCALE;
        }),
      );
      position = { x: maxX + 30, y: 50 };
    } else if (editingRoomId) {
      const existing = existingRooms.find((r) => r.id === editingRoomId);
      if (existing) position = existing.position;
    }

    return {
      id: draft.id,
      name: draft.name,
      roomType: draft.roomType,
      preset: draft.preset,
      vertices: draft.vertices,
      height: draft.height,
      walls: draft.walls,
      subSpaces: draft.subSpaces,
      floor: { area: floorArea, type: draft.floorType, notes: draft.floorNotes || undefined },
      ceiling: { area: floorArea, type: draft.ceilingType, notes: draft.ceilingNotes || undefined },
      position,
    };
  },
}));
