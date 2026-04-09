import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { FloorPlanCanvas } from './components/canvas/FloorPlanCanvas';
import { RoomWizard } from './components/room-wizard/RoomWizard';
import { Dashboard } from './pages/Dashboard';
import { useUiStore } from './store/uiStore';

const BlueprintCreator = () => {
  const floorPlanOpen = useUiStore((s) => s.floorPlanOpen);
  return (
    <AppLayout
      canvas={<FloorPlanCanvas />}
      wizard={<RoomWizard />}
      floorPlanOnly={floorPlanOpen}
    />
  );
};

export const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/blueprint" element={<BlueprintCreator />} />
  </Routes>
);
