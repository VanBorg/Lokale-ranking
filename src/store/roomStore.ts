import { create } from 'zustand';
import type { Room, RoomShape, RoomType, SubSpace, FloorType, CeilingType } from '../types/room';
import type { Wall, WallElement, WallDetail } from '../types/wall';
import { generateWalls } from '../utils/wallGenerator';
import { calcFloorArea, calcNetArea } from '../utils/geometry';
import { generateId } from '../utils/idGenerator';
import { FLOOR_PLAN_CANVAS_H, FLOOR_PLAN_CANVAS_W } from '../constants/canvas';
import { getRoomShapeBoundingSize, ROOM_CANVAS_SCALE } from '../utils/geometry';
import { suggestNextRoomName } from '../utils/roomNaming';
import { clampSubSpaceTopLeftNoOverlapCm } from '../utils/subSpaceContainment';
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

const clampSubSpacesNoOverlap = (
  shape: RoomShape,
  width: number,
  length: number,
  subSpaces: SubSpace[],
): SubSpace[] => {
  const next: SubSpace[] = [];
  subSpaces.forEach((s) => {
    const position = clampSubSpaceTopLeftNoOverlapCm(
      shape,
      width,
      length,
      s.width,
      s.length,
      s.position.x,
      s.position.y,
      next,
      s.id,
    );
    next.push({ ...s, position });
  });
  return next;
};

export const useRoomStore = create<RoomStoreState>()((set, get) => ({
  draft: createEmptyDraft(),
  editingRoomId: null,

  setShape: (shape) =>
    set((state) => {
      const d = state.draft;
      const walls = generateWalls(shape, d.width, d.length, d.height, d.customWallCount);
      const subSpaces = clampSubSpacesNoOverlap(shape, d.width, d.length, d.subSpaces);
      return { draft: { ...d, shape, walls, subSpaces } };
    }),

  setDimensions: (width, length, height) =>
    set((state) => {
      const d = state.draft;
      const walls = generateWalls(d.shape, width, length, height, d.customWallCount);
      const subSpaces = clampSubSpacesNoOverlap(d.shape, width, length, d.subSpaces);
      return { draft: { ...d, width, length, height, walls, subSpaces } };
    }),

  setName: (name) =>
    set((state) => ({ draft: { ...state.draft, name } })),

  setRoomType: (roomType) =>
    set((state) => {
      const rooms = useProjectStore.getState().project.rooms;
      const name = suggestNextRoomName(
        roomType,
        rooms,
        state.editingRoomId,
      );
      return { draft: { ...state.draft, roomType, name } };
    }),

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
    set((state) => {
      const d = state.draft;
      const position = clampSubSpaceTopLeftNoOverlapCm(
        d.shape,
        d.width,
        d.length,
        subSpace.width,
        subSpace.length,
        subSpace.position.x,
        subSpace.position.y,
        d.subSpaces,
        subSpace.id,
      );
      return {
        draft: {
          ...d,
          subSpaces: [...d.subSpaces, { ...subSpace, position }],
        },
      };
    }),

  removeSubSpace: (id) =>
    set((state) => ({
      draft: {
        ...state.draft,
        subSpaces: state.draft.subSpaces.filter((s) => s.id !== id),
      },
    })),

  updateSubSpace: (id, updates) =>
    set((state) => {
      const d = state.draft;
      const subSpaces = d.subSpaces.map((s) => {
        if (s.id !== id) return s;
        const next = { ...s, ...updates };
        return {
          ...next,
          position: clampSubSpaceTopLeftNoOverlapCm(
            d.shape,
            d.width,
            d.length,
            next.width,
            next.length,
            next.position.x,
            next.position.y,
            d.subSpaces,
            next.id,
          ),
        };
      });
      return { draft: { ...d, subSpaces } };
    }),

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
        subSpaces: clampSubSpacesNoOverlap(room.shape, room.width, room.length, room.subSpaces),
        floorType: room.floor.type,
        ceilingType: room.ceiling.type,
        floorNotes: room.floor.notes ?? '',
        ceilingNotes: room.ceiling.notes ?? '',
        customWallCount: room.walls.length,
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
    const floorArea = calcFloorArea(draft.width, draft.length);
    const existingRooms = useProjectStore.getState().project.rooms;

    let position = { x: 50, y: 50 };
    if (!editingRoomId && existingRooms.length === 0) {
      const { w, h } = getRoomShapeBoundingSize(
        draft.shape,
        draft.width,
        draft.length,
        ROOM_CANVAS_SCALE,
      );
      position = {
        x: FLOOR_PLAN_CANVAS_W / 2 - w / 2,
        y: FLOOR_PLAN_CANVAS_H / 2 - h / 2,
      };
    } else if (!editingRoomId && existingRooms.length > 0) {
      const maxX = Math.max(
        ...existingRooms.map((r) => {
          const { w } = getRoomShapeBoundingSize(
            r.shape,
            r.width,
            r.length,
            ROOM_CANVAS_SCALE,
          );
          return r.position.x + w;
        }),
      );
      position = { x: maxX + 30, y: 50 };
    } else if (editingRoomId) {
      const existing = existingRooms.find((r) => r.id === editingRoomId);
      if (existing) position = existing.position;
    }

    const subSpaces = clampSubSpacesNoOverlap(
      draft.shape,
      draft.width,
      draft.length,
      draft.subSpaces,
    );

    return {
      ...draft,
      subSpaces,
      floor: { area: floorArea, type: draft.floorType, notes: draft.floorNotes || undefined },
      ceiling: { area: floorArea, type: draft.ceilingType, notes: draft.ceilingNotes || undefined },
      position,
    };
  },
}));
