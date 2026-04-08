import { Step2Canvas } from './Step2Canvas';
import { ZonePanel } from './ZonePanel';

export const Step2Spaces = () => (
  <div className="flex h-full w-full overflow-hidden">
    <div className="relative flex-[3] bg-app">
      <Step2Canvas />
    </div>
    <div className="flex w-[min(400px,38vw)] shrink-0 flex-col overflow-y-auto border-l border-line bg-surface">
      <ZonePanel />
    </div>
  </div>
);
