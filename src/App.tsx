import { AppLayout } from './components/layout/AppLayout';
import { FloorPlanCanvas } from './components/canvas/FloorPlanCanvas';
import { RoomWizard } from './components/room-wizard/RoomWizard';

export const App = () => (
  <AppLayout canvas={<FloorPlanCanvas />} wizard={<RoomWizard />} />
);
