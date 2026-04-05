import type { Room } from './room';

export type ProjectStatus = 'draft' | 'active' | 'quoted' | 'in-progress' | 'completed';

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  clientAddress?: string;
  rooms: Room[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}
