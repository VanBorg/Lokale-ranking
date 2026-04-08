import { ZonePanel } from './ZonePanel';

/** Zones are edited on the main `FloorPlanCanvas` (`RoomPreview`); this step only shows the side panel. */
export const Step2Spaces = () => (
  <div className="h-full w-full overflow-y-auto">
    <ZonePanel />
  </div>
);
