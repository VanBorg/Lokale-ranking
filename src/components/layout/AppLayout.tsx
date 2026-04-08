import type { ReactNode } from 'react';
import { Header } from './Header';
import { Statusbar } from './Statusbar';

interface AppLayoutProps {
  canvas: ReactNode;
  wizard: ReactNode;
  fullscreenContent?: ReactNode;
}

export const AppLayout = ({ canvas, wizard, fullscreenContent }: AppLayoutProps) => (
  <>
    <Header />
    <div className="flex flex-1 overflow-hidden">
      {fullscreenContent ? (
        <div className="flex-1 overflow-hidden">{fullscreenContent}</div>
      ) : (
        <>
          <main className="relative min-w-0 flex-[1.35] bg-app">{canvas}</main>
          <aside className="w-[min(360px,32vw)] shrink-0 overflow-y-auto border-l border-line bg-surface">
            {wizard}
          </aside>
        </>
      )}
    </div>
    <Statusbar />
  </>
);
