import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '../types/room';
import type { Project } from '../types/project';
import { generateId } from '../utils/idGenerator';

interface ProjectState {
  project: Project;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  updateRoomPosition: (id: string, x: number, y: number) => void;
  removeRoom: (id: string) => void;
  setProjectName: (name: string) => void;
}

const createDefaultProject = (): Project => ({
  id: generateId(),
  name: 'Nieuw Project',
  rooms: [],
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      project: createDefaultProject(),

      addRoom: (room) =>
        set((state) => ({
          project: {
            ...state.project,
            rooms: [...state.project.rooms, room],
            updatedAt: new Date().toISOString(),
          },
        })),

      updateRoom: (id, updates) =>
        set((state) => ({
          project: {
            ...state.project,
            rooms: state.project.rooms.map((r) =>
              r.id === id ? { ...r, ...updates } : r,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      updateRoomPosition: (id, x, y) =>
        set((state) => ({
          project: {
            ...state.project,
            rooms: state.project.rooms.map((r) =>
              r.id === id ? { ...r, position: { x, y } } : r,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      removeRoom: (id) =>
        set((state) => ({
          project: {
            ...state.project,
            rooms: state.project.rooms.filter((r) => r.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),

      setProjectName: (name) =>
        set((state) => ({
          project: {
            ...state.project,
            name,
            updatedAt: new Date().toISOString(),
          },
        })),
    }),
    { name: 'pixel-blueprint-project' },
  ),
);
