import type { ReactNode } from 'react';
import { Header } from './Header';

interface AppLayoutProps {
  canvas: ReactNode;
  wizard: ReactNode;
  /** When true, the canvas fills the full area and the wizard panel is hidden. */
  floorPlanOnly?: boolean;
}

export const AppLayout = ({ canvas, wizard, floorPlanOnly }: AppLayoutProps) => (
  <>
    <Header />
    <div className="flex flex-1 overflow-hidden">
      {floorPlanOnly ? (
        <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-app">
          {canvas}
        </main>
      ) : (
        <>
          <main className="relative min-h-0 min-w-0 flex-[3] overflow-hidden bg-app">
            {canvas}
          </main>
          <aside className="flex min-h-0 flex-[2] flex-col overflow-hidden border-l border-line bg-surface">
            {wizard}
          </aside>
        </>
      )}
    </div>
  </>
);
