import { create } from 'zustand';
import type {
  Room, RoomType, RoomPreset, RoomVertex, SubSpace, FloorType, CeilingType,
} from '../types/room';
import type { Wall, WallElement, WallDetail } from '../types/wall';
import { generateWallsFromVertices } from '../utils/wallGenerator';
import { calcNetArea, verticesBoundingBox, ROOM_CANVAS_SCALE } from '../utils/geometry';
import { calcPolygonArea, midpoint } from '../utils/geometry';
import { createPresetVertices } from '../utils/presets';
import { generateId } from '../utils/idGenerator';
import { FLOOR_PLAN_CANVAS_H, FLOOR_PLAN_CANVAS_W } from '../constants/canvas';
import { suggestNextRoomName } from '../utils/roomNaming';
import { isZonePlacementValid } from '../utils/subSpaceContainment';
import { useProjectStore } from './projectStore';

interface RoomDraft {
  id: string;
  name: string;
  roomType: RoomType;
  preset: RoomPreset;
  vertices: RoomVertex[];
  height: number;
  walls: Wall[];
  subSpaces: SubSpace[];
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

  loadRoom: (room: Room) => void;
  resetDraft: () => void;
  finaliseRoom: () => Room;
}

const createEmptyDraft = (): RoomDraft => {
  const preset: RoomPreset = 'rectangle';
  const vertices = createPresetVertices(preset, 400, 300);
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
): SubSpace[] =>
  subSpaces.filter((s) =>
    isZonePlacementValid(
      s.position.x, s.position.y, s.width, s.length,
      vertices,
      subSpaces,
      s.id,
    ),
  );

export const useRoomStore = create<RoomStoreState>()((set, get) => ({
  draft: createEmptyDraft(),
  editingRoomId: null,

  loadPreset: (preset) =>
    set((state) => {
      const d = state.draft;
      const bb = verticesBoundingBox(d.vertices);
      const vertices = createPresetVertices(preset, bb.width || 400, bb.height || 300);
      const walls = generateWallsFromVertices(vertices, d.height);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices);
      return { draft: { ...d, preset, vertices, walls, subSpaces } };
    }),

  updateVertex: (index, pos) =>
    set((state) => {
      const d = state.draft;
      const snapped = { x: Math.round(pos.x / 10) * 10, y: Math.round(pos.y / 10) * 10 };
      const vertices = d.vertices.map((v, i) => (i === index ? snapped : v));
      const walls = generateWallsFromVertices(vertices, d.height);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  addVertex: (afterIndex) =>
    set((state) => {
      const d = state.draft;
      const n = d.vertices.length;
      const a = d.vertices[afterIndex]!;
      const b = d.vertices[(afterIndex + 1) % n]!;
      const mp = midpoint(a, b);
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
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  setVertices: (vertices) =>
    set((state) => {
      const d = state.draft;
      const walls = generateWallsFromVertices(vertices, d.height);
      const subSpaces = revalidateSubSpaces(d.subSpaces, vertices);
      return { draft: { ...d, vertices, walls, subSpaces } };
    }),

  setHeight: (height) =>
    set((state) => {
      const d = state.draft;
      const walls = generateWallsFromVertices(d.vertices, height);
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
      position = {
        x: FLOOR_PLAN_CANVAS_W / 2 - w / 2,
        y: FLOOR_PLAN_CANVAS_H / 2 - h / 2,
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
