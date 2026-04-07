import { AppLayout } from './components/layout/AppLayout';
import { FloorPlanCanvas } from './components/canvas/FloorPlanCanvas';
import { RoomWizard } from './components/room-wizard/RoomWizard';
import { ThemeColorProbe } from './debug/ThemeColorProbe';

export const App = () => (
  <>
    <ThemeColorProbe />
    <AppLayout
      canvas={<FloorPlanCanvas />}
      wizard={<RoomWizard />}
    />
  </>
);
