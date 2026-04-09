import { StepHeader } from '../../shared/StepHeader';
import { ShapePicker } from './ShapePicker';
import { SubRoomInfoPanel } from './SubRoomInfoPanel';
import { SubRoomList } from './SubRoomList';
import { SubRoomMiniCanvas } from './SubRoomMiniCanvas';
import { SubRoomWallEditor } from './SubRoomWallEditor';

export const Step2Rooms = () => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="shrink-0 p-4 pb-0">
      <StepHeader
        title="Ruimtes Plaatsen"
        description="Voeg ruimtes toe en plaats ze tegen de muren van de kamer."
      />
    </div>
    <div className="flex flex-1 min-h-0">
      <div className="flex flex-1 flex-col border-r border-line min-w-0 overflow-y-auto">
        <SubRoomMiniCanvas />
        <SubRoomWallEditor />
      </div>
      <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
        <ShapePicker />
        <SubRoomList />
        <SubRoomInfoPanel />
      </div>
    </div>
  </div>
);
