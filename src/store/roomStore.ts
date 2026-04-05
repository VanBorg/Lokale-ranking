import { create } from 'zustand';
import type { Room, RoomShape, RoomType, SubSpace, FloorType, CeilingType } from '../types/room';
import type { Wall, WallElement, WallDetail } from '../types/wall';
import { generateWalls } from '../utils/wallGenerator';
import { calcFloorArea, calcNetArea } from '../utils/geometry';
import { generateId } from '../utils/idGenerator';
import { useProjectStore } from './projectStore';

interface RoomDraft {
  id: string;
  name: string;
  roomType: RoomType;
  shape: RoomShape;
  width: number;
  length: number;
  height: number;
  walls: Wall[];
  subSpaces: SubSpace[];
  floorType?: FloorType;
  ceilingType?: CeilingType;
  floorNotes: string;
  ceilingNotes: string;
  customWallCount: number;
}

interface RoomStoreState {
  draft: RoomDraft;
  editingRoomId: string | null;

  setShape: (shape: RoomShape) => void;
  setDimensions: (width: number, length: number, height: number) => void;
  setName: (name: string) => void;
  setRoomType: (roomType: RoomType) => void;
  setCustomWallCount: (count: number) => void;
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

const createEmptyDraft = (): RoomDraft => ({
  id: generateId(),
  name: '',
  roomType: 'other',
  shape: 'rectangle',
  width: 300,
  length: 400,
  height: 260,
  walls: generateWalls('rectangle', 300, 400, 260),
  subSpaces: [],
  floorType: undefined,
  ceilingType: undefined,
  floorNotes: '',
  ceilingNotes: '',
  customWallCount: 5,
});

const recalcWallNetAreas = (walls: Wall[]): Wall[] =>
  walls.map((w) => ({ ...w, netArea: calcNetArea(w) }));

export const useRoomStore = create<RoomStoreState>()((set, get) => ({
  draft: createEmptyDraft(),
  editingRoomId: null,

  setShape: (shape) =>
    set((state) => {
      const walls = generateWalls(shape, state.draft.width, state.draft.length, state.draft.height, state.draft.customWallCount);
      return { draft: { ...state.draft, shape, walls } };
    }),

  setDimensions: (width, length, height) =>
    set((state) => {
      const walls = generateWalls(state.draft.shape, width, length, height, state.draft.customWallCount);
      return { draft: { ...state.draft, width, length, height, walls } };
    }),

  setName: (name) =>
    set((state) => ({ draft: { ...state.draft, name } })),

  setRoomType: (roomType) =>
    set((state) => ({ draft: { ...state.draft, roomType } })),

  setCustomWallCount: (count) =>
    set((state) => {
      const walls = generateWalls(state.draft.shape, state.draft.width, state.draft.length, state.draft.height, count);
      return { draft: { ...state.draft, customWallCount: count, walls } };
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
      draft: {
        ...state.draft,
        subSpaces: state.draft.subSpaces.filter((s) => s.id !== id),
      },
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
          ? {
              ...w,
              elements: w.elements.map((e) =>
                e.id === elementId ? { ...e, ...updates } : e,
              ),
            }
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
          w.id === wallId
            ? { ...w, photos: w.photos.filter((_, i) => i !== index) }
            : w,
        ),
      },
    })),

  loadRoom: (room) =>
    set({
      draft: {
        id: room.id,
        name: room.name,
        roomType: room.roomType,
        shape: room.shape,
        width: room.width,
        length: room.length,
        height: room.height,
        walls: room.walls,
        subSpaces: room.subSpaces,
        floorType: room.floor.type,
        ceilingType: room.ceiling.type,
        floorNotes: room.floor.notes ?? '',
        ceilingNotes: room.ceiling.notes ?? '',
        customWallCount: room.walls.length,
      },
      editingRoomId: room.id,
    }),

  resetDraft: () =>
    set({ draft: createEmptyDraft(), editingRoomId: null }),

  finaliseRoom: () => {
    const { draft, editingRoomId } = get();
    const floorArea = calcFloorArea(draft.width, draft.length);
    const existingRooms = useProjectStore.getState().project.rooms;

    let position = { x: 50, y: 50 };
    if (!editingRoomId && existingRooms.length > 0) {
      const maxX = Math.max(...existingRooms.map((r) => r.position.x + r.width * 0.5));
      position = { x: maxX + 30, y: 50 };
    } else if (editingRoomId) {
      const existing = existingRooms.find((r) => r.id === editingRoomId);
      if (existing) position = existing.position;
    }

    return {
      ...draft,
      floor: { area: floorArea, type: draft.floorType, notes: draft.floorNotes || undefined },
      ceiling: { area: floorArea, type: draft.ceilingType, notes: draft.ceilingNotes || undefined },
      position,
    };
  },
}));
