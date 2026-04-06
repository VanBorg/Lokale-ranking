import type { ReactNode } from 'react';
import { Header } from './Header';
import { Statusbar } from './Statusbar';

interface AppLayoutProps {
  canvas: ReactNode;
  wizard: ReactNode;
}

export const AppLayout = ({ canvas, wizard }: AppLayoutProps) => (
  <>
    <Header />
    <div className="flex flex-1 overflow-hidden">
      <main className="relative min-w-0 flex-[1.35] bg-gray-50">{canvas}</main>
      <aside className="w-[min(360px,32vw)] shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
        {wizard}
      </aside>
    </div>
    <Statusbar />
  </>
);
