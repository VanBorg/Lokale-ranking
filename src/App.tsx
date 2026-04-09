import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { FloorPlanCanvas } from './components/canvas/FloorPlanCanvas';
import { RoomWizard } from './components/room-wizard/RoomWizard';
import { Dashboard } from './pages/Dashboard';

const BlueprintCreator = () => (
  <AppLayout canvas={<FloorPlanCanvas />} wizard={<RoomWizard />} />
);

export const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/blueprint" element={<BlueprintCreator />} />
  </Routes>
);
